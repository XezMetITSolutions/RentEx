'use server';

import { requireAdminModule } from '@/lib/adminAccess';
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { lockCarForBooking } from "@/lib/availability";
import { assertPickupMileage } from "@/lib/rentalGuards";

export async function performCheckIn(rentalId: number, data: {
    mileage: number;
    fuelLevel: string;
    damageNotes: string;
    signature: string;
    mileagePhoto?: string;
    fuelPhoto?: string;
    damages?: {
        type: string;
        description: string;
        photoUrl?: string;
        locationOnCar: string;
        xPosition: number;
        yPosition: number;
    }[];
}) {
    await requireAdminModule('Check-In');
    const rental = await prisma.rental.findUnique({
        where: { id: rentalId },
        include: {
            customer: { select: { isBlacklisted: true } },
            car: { select: { currentMileage: true } },
        },
    });

    if (!rental) throw new Error("Rental not found");
    if (rental.customer.isBlacklisted) {
        throw new Error('Dieser Kunde ist gesperrt. Das Fahrzeug darf nicht übergeben werden.');
    }
    if (rental.status === 'Active' && rental.checkInAt) {
        return { success: true };
    }
    if (rental.status !== 'Pending' && rental.status !== 'Confirmed') {
        throw new Error('Diese Reservierung kann nicht mehr übernommen werden.');
    }
    const mileage = assertPickupMileage(data.mileage, rental.car.currentMileage);

    await prisma.$transaction(async (tx) => {
        await lockCarForBooking(tx, rental.carId);
        const other = await tx.rental.count({
            where: { carId: rental.carId, status: 'Active', id: { not: rentalId } },
        });
        if (other > 0) {
            throw new Error('Dieses Fahrzeug ist noch in einer anderen Miete unterwegs.');
        }
        await tx.rental.update({
            where: { id: rentalId },
            data: {
                status: 'Active',
                pickupMileage: mileage,
                fuelLevelPickup: data.fuelLevel,
                damageReport: data.damageNotes,
                signature: data.signature,
                mileagePhoto: data.mileagePhoto,
                fuelPhoto: data.fuelPhoto,
                checkInAt: new Date(),
            }
        });
        await tx.car.update({
            where: { id: rental.carId },
            data: { status: 'Rented', currentMileage: mileage }
        });
        if (data.damages?.length) {
            await tx.damageRecord.createMany({
                data: data.damages.map((d) => ({
                    carId: rental.carId,
                    rentalId,
                    type: d.type,
                    description: d.description,
                    photoUrl: d.photoUrl,
                    locationOnCar: d.locationOnCar,
                    xPosition: d.xPosition,
                    yPosition: d.yPosition,
                    status: 'open',
                    severity: 'Medium',
                })),
            });
        }
    });

    revalidatePath(`/admin/reservations/${rentalId}`);
    revalidatePath('/admin/reservations');
    revalidatePath('/admin/fleet');

    return { success: true };
}
