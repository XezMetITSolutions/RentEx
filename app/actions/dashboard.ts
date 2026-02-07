'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
    const customerId = await getSession();
    if (customerId == null) return { error: 'Nicht angemeldet.' };

    const firstName = (formData.get('firstName') as string)?.trim();
    const lastName = (formData.get('lastName') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim() || null;
    const address = (formData.get('address') as string)?.trim() || null;
    const city = (formData.get('city') as string)?.trim() || null;
    const postalCode = (formData.get('postalCode') as string)?.trim() || null;
    const country = (formData.get('country') as string)?.trim() || null;

    if (!firstName || !lastName) return { error: 'Vorname und Nachname sind Pflichtfelder.' };

    await prisma.customer.update({
        where: { id: customerId },
        data: {
            firstName,
            lastName,
            phone,
            address,
            city,
            postalCode,
            country,
        },
    });

    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function cancelReservation(formData: FormData) {
    const customerId = await getSession();
    if (customerId == null) return { error: 'Nicht angemeldet.' };

    const rentalId = Number(formData.get('rentalId'));
    if (Number.isNaN(rentalId)) return { error: 'Ungültige Anfrage.' };

    const rental = await prisma.rental.findFirst({
        where: { id: rentalId, customerId },
    });

    if (!rental) return { error: 'Reservierung nicht gefunden.' };
    if (rental.status !== 'Pending') return { error: 'Nur ausstehende Reservierungen können storniert werden.' };

    await prisma.rental.update({
        where: { id: rentalId },
        data: { status: 'Cancelled' },
    });

    revalidatePath('/dashboard/rentals');
    revalidatePath('/dashboard/rentals/[id]');
    revalidatePath('/dashboard/reservations');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function submitDamageReport(formData: FormData) {
    const customerId = await getSession();
    if (customerId == null) return { error: 'Nicht angemeldet.' };

    const rentalId = Number(formData.get('rentalId'));
    const carId = Number(formData.get('carId'));
    if (Number.isNaN(rentalId) || Number.isNaN(carId)) return { error: 'Ungültige Miete/Fahrzeug.' };

    const rental = await prisma.rental.findFirst({
        where: { id: rentalId, customerId },
        include: { car: true },
    });
    if (!rental || rental.carId !== carId) return { error: 'Miete nicht gefunden.' };

    const accidentDate = formData.get('accidentDate') ? new Date(formData.get('accidentDate') as string) : null;
    const accidentTime = (formData.get('accidentTime') as string)?.trim() || null;
    const accidentPlace = (formData.get('accidentPlace') as string)?.trim() || null;
    const accidentCountry = (formData.get('accidentCountry') as string)?.trim() || 'Österreich';
    const injuries = formData.get('injuries') === 'yes';
    const type = (formData.get('type') as string)?.trim() || 'Unfall';
    const description = (formData.get('description') as string)?.trim() || null;
    const locationOnCar = (formData.get('locationOnCar') as string)?.trim() || null;
    const otherPartyDriverName = (formData.get('otherPartyDriverName') as string)?.trim() || null;
    const otherPartyAddress = (formData.get('otherPartyAddress') as string)?.trim() || null;
    const otherPartyPhone = (formData.get('otherPartyPhone') as string)?.trim() || null;
    const otherPartyRegistration = (formData.get('otherPartyRegistration') as string)?.trim() || null;
    const otherPartyVehicle = (formData.get('otherPartyVehicle') as string)?.trim() || null;
    const otherPartyInsurance = (formData.get('otherPartyInsurance') as string)?.trim() || null;
    const otherPartyPolicyNumber = (formData.get('otherPartyPolicyNumber') as string)?.trim() || null;
    const otherPartyDamage = (formData.get('otherPartyDamage') as string)?.trim() || null;
    const witnessName = (formData.get('witnessName') as string)?.trim() || null;
    const witnessAddress = (formData.get('witnessAddress') as string)?.trim() || null;
    const witnessPhone = (formData.get('witnessPhone') as string)?.trim() || null;
    const circumstances = (formData.get('circumstances') as string)?.trim() || null;
    const sketchNotes = (formData.get('sketchNotes') as string)?.trim() || null;

    await prisma.damageRecord.create({
        data: {
            carId,
            rentalId,
            type,
            description: description || (otherPartyDamage ? `Unfall: ${otherPartyDamage}` : null),
            severity: 'High',
            locationOnCar,
            accidentDate,
            accidentTime,
            accidentPlace,
            accidentCountry,
            injuries,
            otherPartyDriverName,
            otherPartyAddress,
            otherPartyPhone,
            otherPartyRegistration,
            otherPartyVehicle,
            otherPartyInsurance,
            otherPartyPolicyNumber,
            otherPartyDamage,
            witnessName,
            witnessAddress,
            witnessPhone,
            circumstances,
            sketchNotes,
            reportedByCustomerId: customerId,
        },
    });

    try {
        const customer = await prisma.customer.findUnique({ where: { id: customerId }, select: { firstName: true, lastName: true } });
        await prisma.activityLog.create({
            data: {
                userName: customer ? `${customer.firstName} ${customer.lastName}` : 'Kunde',
                action: 'Created',
                entityType: 'DamageRecord',
                description: `Schaden/Unfall gemeldet: ${rental.car.brand} ${rental.car.model} (${rental.car.plate}), Miete #${rentalId}`,
            },
        });
    } catch (_) {}

    revalidatePath('/dashboard/damage-report');
    revalidatePath('/dashboard');
    return { success: true };
}
