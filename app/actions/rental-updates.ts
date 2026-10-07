'use server';

import prisma from "@/lib/prisma";
import { requireAdminModule } from '@/lib/adminAccess';
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { settleReturnMileage } from "@/lib/returnSettlement";
import { assertReturnMileage } from "@/lib/rentalGuards";
import { sendRentalMail } from "@/lib/rentalMail";

export async function updateRentalStatus(id: number, status: string, returnMileageOrFormData?: number | FormData) {
    const session = await requireAdminModule('Reservierungen');

    let returnMileage: number | undefined;
    if (typeof returnMileageOrFormData === 'number') {
        returnMileage = returnMileageOrFormData;
    } else if (returnMileageOrFormData instanceof FormData) {
        const mileageStr = returnMileageOrFormData.get('returnMileage') as string;
        if (mileageStr) returnMileage = parseInt(mileageStr, 10);
    }

    const rental = await prisma.rental.findUnique({
        where: { id },
        include: { customer: true, car: true }
    });

    if (!rental) throw new Error("Rental not found");

    if (status === 'Completed') {
        if (rental.status !== 'Active' && rental.status !== 'Confirmed') {
            throw new Error('Nur eine laufende oder bestätigte Miete kann abgeschlossen werden.');
        }
        const finalReturnMileage = returnMileage || Number(rental.returnMileage || 0);
        const pickupKm = Number(rental.pickupMileage || rental.car.currentMileage || 0);
        if (finalReturnMileage > 0 && pickupKm > 0) {
            assertReturnMileage(finalReturnMileage, pickupKm, rental.totalDays);
        }
        let extraCharges = Number(rental.extraCharges || 0);
        let extraChargesNote = rental.extraChargesNote || '';
        const kmMarker = `rental:${rental.id}:km`;
        let kmCharge = 0;
        if (finalReturnMileage > 0 && !extraChargesNote.includes(kmMarker)) {
            const settlement = await settleReturnMileage(rental, finalReturnMileage);
            kmCharge = settlement.kmCharge;
            if (kmCharge > 0) {
                extraCharges += kmCharge;
                extraChargesNote = [extraChargesNote, `${kmMarker} Mehrkilometer €${kmCharge.toFixed(2)}`].filter(Boolean).join('\n');
            }
        }

        await prisma.rental.update({
            where: { id },
            data: { 
                status: 'Completed',
                returnMileage: finalReturnMileage || undefined,
                extraCharges: extraCharges ? new Prisma.Decimal(extraCharges) : undefined,
                extraChargesNote: extraChargesNote || undefined,
                actualReturnDate: new Date(),
                paymentStatus: kmCharge > 0 && rental.paymentStatus === 'Paid' ? 'Partial' : rental.paymentStatus,
            }
        });

        const stillOut = await prisma.rental.count({
            where: { carId: rental.carId, status: 'Active', id: { not: id } },
        });
        await prisma.car.update({
            where: { id: rental.carId },
            data: {
                status: stillOut > 0 ? 'Rented' : 'Active',
                currentMileage: finalReturnMileage || undefined,
            }
        });
        await sendRentalMail(id, { type: 'completed' });
    } else {
        const allowed = ['Pending', 'Confirmed', 'Active', 'Cancelled', 'NoShow'];
        if (!allowed.includes(status)) throw new Error('Unbekannter Status');
        await prisma.rental.update({
            where: { id: id },
            data: { status: status as any }
        });
        if (status === 'Cancelled' && rental.status !== 'Cancelled') {
            await sendRentalMail(id, { type: 'cancelled', by: 'company' });
        }
        if (rental.status === 'Active' && status !== 'Active') {
            const stillOut = await prisma.rental.count({
                where: { carId: rental.carId, status: 'Active', id: { not: id } },
            });
            if (stillOut === 0) {
                await prisma.car.update({
                    where: { id: rental.carId },
                    data: { status: 'Active' },
                });
            }
        }
    }

    revalidatePath(`/admin/reservations/${id}`);
    revalidatePath('/admin/reservations');
    revalidatePath('/admin/km-transfer');
}

export async function updatePaymentStatus(id: number, paymentStatus: string) {
    const session = await requireAdminModule('Reservierungen');
    await prisma.rental.update({
        where: { id },
        data: { paymentStatus }
    });
    revalidatePath(`/admin/reservations/${id}`);
}
