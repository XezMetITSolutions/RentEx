'use server';

import { requireAdminModule } from '@/lib/adminAccess';
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { quoteBooking } from "@/lib/bookingPrice";
import { chargeableDaysBetween } from "@/lib/bookingUtils";
import { CAR_BUSY_MESSAGE, lockCarForBooking, overlapWhere } from "@/lib/availability";
import { bookingRejectedReason } from "@/lib/rentalGuards";

export async function extendRental(rentalId: number, newEndDate: string, _additionalCost?: number) {
    await requireAdminModule('Reservierungen');
    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: { options: { include: { option: true } }, car: true },
    });

    if (!rental) throw new Error("Rental not found");

    const updatedEndDate = new Date(newEndDate);
    if (isNaN(updatedEndDate.getTime()) || updatedEndDate <= new Date(rental.endDate)) {
        throw new Error('Das neue Endedatum muss nach dem bisherigen Ende liegen.');
    }

    const selected = rental.options.map((link) => ({
        id: link.option.id,
        name: link.option.name,
        price: Number(link.option.price),
        type: link.option.type,
        isPerDay: link.option.isPerDay,
        maxPrice: link.option.maxPrice != null ? Number(link.option.maxPrice) : null,
        maxDays: link.option.maxDays,
        isMandatory: link.option.isMandatory,
    }));

    const extended = await prisma.$transaction(async (tx) => {
        await lockCarForBooking(tx, rental.carId);
        const newTotalDays = chargeableDaysBetween(new Date(rental.startDate), updatedEndDate);
        const rejected = bookingRejectedReason(rental.car, updatedEndDate, newTotalDays);
        if (rejected) throw new Error(rejected);
        const conflict = await tx.rental.count({
            where: {
                carId: rental.carId,
                id: { not: rental.id },
                ...overlapWhere(new Date(rental.startDate), updatedEndDate),
            },
        });
        if (conflict > 0) {
            throw new Error(CAR_BUSY_MESSAGE);
        }

        const quote = quoteBooking(rental.car, selected, newTotalDays, null, new Date(rental.startDate));
        const keptDiscount = Number(rental.discountAmount || 0);
        const newTotal = Math.max(0, quote.baseTotal - keptDiscount);
        const additional = Math.max(0, newTotal - Number(rental.totalAmount));

        return tx.rental.update({
            where: { id: rentalId },
            data: {
                endDate: updatedEndDate,
                totalDays: newTotalDays,
                totalAmount: newTotal,
                includedKm: quote.includedKm,
                extrasCost: quote.extrasCost,
                insuranceCost: quote.insuranceCost,
                paymentStatus: additional > 0 && rental.paymentStatus === 'Paid' ? 'Partial' : rental.paymentStatus,
                notes: additional > 0
                    ? `${rental.notes ? rental.notes + '\n' : ''}Verlängerung: +€${additional.toFixed(2)} offen.`
                    : rental.notes,
            },
        });
    });

    revalidatePath(`/admin/reservations/${rentalId}`);
    revalidatePath('/admin/reservations');

    return { success: true, totalAmount: Number(extended.totalAmount) };
}
