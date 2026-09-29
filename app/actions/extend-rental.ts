'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { formatInTimeZone } from 'date-fns-tz';
import { BUSINESS_TIME_ZONE, calculateChargeableDays, parseBookingDateTime } from '@/lib/bookingUtils';
import { blockingRentalWhere, lockCarForBooking } from '@/lib/availability';
import { requireAdminArea } from '@/lib/adminAccess';

/**
 * Extends a rental to `newEndDate` ("YYYY-MM-DD"), keeping the original return
 * time. The extra cost is computed here from the rental's daily rate — the
 * `_clientCost` argument is ignored and only kept for API compatibility.
 */
export async function extendRental(rentalId: number, newEndDate: string, _clientCost?: number) {
    await requireAdminArea('reservations');
    const rental = await prisma.rental.findUnique({
        where: { id: rentalId }
    });

    if (!rental) return { success: false, error: 'Miete nicht gefunden.' };
    if (!['Pending', 'Confirmed', 'Active'].includes(rental.status)) {
        return { success: false, error: 'Nur offene oder aktive Mieten können verlängert werden.' };
    }

    const returnTime = formatInTimeZone(rental.endDate, BUSINESS_TIME_ZONE, 'HH:mm');
    const updatedEndDate = parseBookingDateTime(newEndDate, returnTime);
    if (!updatedEndDate || updatedEndDate <= rental.endDate) {
        return { success: false, error: 'Das neue Rückgabedatum muss nach dem bisherigen liegen.' };
    }

    const startDateStr = formatInTimeZone(rental.startDate, BUSINESS_TIME_ZONE, 'yyyy-MM-dd');
    const pickupTime = formatInTimeZone(rental.startDate, BUSINESS_TIME_ZONE, 'HH:mm');
    const newTotalDays = calculateChargeableDays(startDateStr, pickupTime, newEndDate, returnTime);
    const extraDays = Math.max(0, newTotalDays - rental.totalDays);
    const additionalCost = extraDays * Number(rental.dailyRate);

    const extended = await prisma.$transaction(async (tx) => {
        await lockCarForBooking(tx, rental.carId);
        // The added period must not overlap another booking of the same car.
        const conflicts = await tx.rental.count({
            where: {
                id: { not: rentalId },
                carId: rental.carId,
                startDate: { lte: updatedEndDate },
                endDate: { gte: rental.endDate },
                ...blockingRentalWhere(),
            },
        });
        if (conflicts > 0) return false;

        await tx.rental.update({
            where: { id: rentalId },
            data: {
                endDate: updatedEndDate,
                totalDays: newTotalDays,
                totalAmount: Number(rental.totalAmount) + additionalCost
            }
        });
        return true;
    });

    if (!extended) {
        return { success: false, error: 'Das Fahrzeug ist im Verlängerungszeitraum bereits gebucht.' };
    }

    revalidatePath(`/admin/reservations/${rentalId}`);
    revalidatePath('/admin/reservations');

    return { success: true, additionalCost };
}
