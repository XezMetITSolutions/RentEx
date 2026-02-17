'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function performCheckIn(rentalId: number, data: {
    mileage: number;
    fuelLevel: string;
    damageNotes: string;
    signature: string;
    damages?: {
        type: string;
        description: string;
        photoUrl?: string;
        locationOnCar: string;
        xPosition: number;
        yPosition: number;
    }[];
}) {
    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        select: { carId: true }
    });

    if (!rental) throw new Error("Rental not found");

    await prisma.$transaction([
        prisma.rental.update({
            where: { id: rentalId },
            data: {
                status: 'Active',
                pickupMileage: data.mileage,
                fuelLevelPickup: data.fuelLevel,
                damageReport: data.damageNotes,
                signature: data.signature,
                checkInAt: new Date(),
            }
        }),
        // Add new damage records if provided
        ...(data.damages?.map(d => prisma.damageRecord.create({
            data: {
                carId: rental.carId,
                rentalId: rentalId,
                type: d.type,
                description: d.description,
                photoUrl: d.photoUrl,
                locationOnCar: d.locationOnCar,
                xPosition: d.xPosition,
                yPosition: d.yPosition,
                status: 'open',
                severity: 'Medium'
            }
        })) || [])
    ]);

    revalidatePath(`/admin/reservations/${rentalId}`);
    revalidatePath('/admin/reservations');

    return { success: true };
}
