'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function performCheckIn(rentalId: number, data: {
    mileage: number;
    fuelLevel: string;
    damageNotes: string;
    signature: string;
}) {
    await prisma.rental.update({
        where: { id: rentalId },
        data: {
            status: 'Active',
            pickupMileage: data.mileage,
            fuelLevelPickup: data.fuelLevel,
            damageReport: data.damageNotes,
            signature: data.signature,
            checkInAt: new Date(),
        }
    });

    revalidatePath(`/admin/reservations/${rentalId}`);
    revalidatePath('/admin/reservations');

    return { success: true };
}
