'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
                mileagePhoto: data.mileagePhoto,
                fuelPhoto: data.fuelPhoto,
                checkInAt: new Date(),
            }
        }),
        // Update vehicle status and mileage
        prisma.car.update({
            where: { id: rental.carId },
            data: {
                status: 'Rented',
                currentMileage: data.mileage
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

    // Fetch customer details to send checkout/handover email
    try {
        const fullRental = await prisma.rental.findUnique({
            where: { id: rentalId },
            include: { customer: true, car: true }
        });

        if (fullRental?.customer) {
            const { sendEmail } = require('@/lib/notificationTemplates');
            const subject = `Fahrzeug-Übergabeprotokoll (Mietbeginn) - ${fullRental.contractNumber || fullRental.id}`;
            const body = `
Sehr geehrte/r ${fullRental.customer.firstName} ${fullRental.customer.lastName},

hiermit senden wir Ihnen das digitale Übergabeprotokoll für Ihren Mietvertrag ${fullRental.contractNumber || fullRental.id}.

Fahrzeugübergabe Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fahrzeug: ${fullRental.car?.brand} ${fullRental.car?.model} (${fullRental.car?.plate})
Kilometerstand bei Übergabe: ${data.mileage} km
Tankfüllung: ${data.fuelLevel}%
Bekannte Vorschäden: ${data.damageNotes || 'Keine registriert'}
Datum/Uhrzeit: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wir wünschen Ihnen eine gute und sichere Fahrt!

Mit freundlichen Grüßen,
Ihr RentEx-Team
            `.trim();
            await sendEmail(fullRental.customer.email, { subject, body });
        }
    } catch (mailError) {
        console.error('[performCheckIn] Failed to send handover email:', mailError);
    }

    revalidatePath(`/admin/reservations/${rentalId}`);
    revalidatePath('/admin/reservations');
    revalidatePath('/admin/fleet');

    return { success: true };
}
