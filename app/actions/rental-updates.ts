'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateRentalStatus(id: number, status: string, returnMileageOrFormData?: number | FormData) {
    let returnMileage: number | undefined;
    if (typeof returnMileageOrFormData === 'number') {
        returnMileage = returnMileageOrFormData;
    } else if (returnMileageOrFormData instanceof FormData) {
        const mileageStr = returnMileageOrFormData.get('returnMileage') as string;
        if (mileageStr) returnMileage = parseInt(mileageStr, 10);
    }

    const rental = await prisma.rental.findUnique({
        where: { id },
        include: { customer: true }
    });

    if (!rental) throw new Error("Rental not found");

    if (status === 'Completed') {
        const finalReturnMileage = returnMileage || Number(rental.returnMileage || 0);
        const usedKm = finalReturnMileage - Number(rental.pickupMileage || 0);
        const includedKm = Number(rental.includedKm || 0);
        const surplusKm = includedKm - usedKm;

        if (surplusKm > 0) {
            // Add surplus KM to customer's balance
            await prisma.kmBalance.upsert({
                where: { customerId: rental.customerId },
                update: { balance: { increment: surplusKm } },
                create: { customerId: rental.customerId, balance: surplusKm }
            });

            // Create a transfer record for tracking (system transfer)
            await prisma.kmTransfer.create({
                data: {
                    fromId: rental.customerId, 
                    toId: rental.customerId,
                    amount: surplusKm,
                    note: `Automatische Gutschrift aus Vertrag #${rental.contractNumber || rental.id} (${includedKm} paket - ${usedKm} used)`
                }
            });
        }

        await prisma.rental.update({
            where: { id },
            data: { 
                status: 'Completed',
                returnMileage: finalReturnMileage || undefined,
                actualReturnDate: new Date()
            }
        });

        // Also update car status to 'Active' (Available)
        await prisma.car.update({
            where: { id: rental.carId },
            data: { status: 'Active', currentMileage: finalReturnMileage || undefined }
        });
    } else {
        await prisma.rental.update({
            where: { id: id },
            data: { status: status as any }
        });
    }

    revalidatePath(`/admin/reservations/${id}`);
    revalidatePath('/admin/reservations');
    revalidatePath('/admin/km-transfer');
}

export async function updatePaymentStatus(id: number, paymentStatus: string) {
    await prisma.rental.update({
        where: { id },
        data: { paymentStatus }
    });
    revalidatePath(`/admin/reservations/${id}`);
}
