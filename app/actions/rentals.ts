'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { rentalSchema, safeValidate } from '@/lib/schemas';
import { calculateChargeableDays, parseBookingDateTime } from '@/lib/bookingUtils';
import { isCarAvailable, lockCarForBooking } from '@/lib/availability';
import { priceRental } from '@/lib/pricing';
import { auditLog } from '@/lib/audit';
import { requireAdminArea } from '@/lib/adminAccess';

/** Expected failures that are shown to the admin instead of thrown. */
class RentalConflictError extends Error {}

export async function createRental(formData: FormData) {
    const staff = await requireAdminArea('reservations');
    // Build a typed object from FormData. `options` may appear multiple
    // times so we collect it via getAll().
    const raw = {
        carId: formData.get('carId'),
        customerId: formData.get('customerId'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        startTime: formData.get('startTime') || undefined,
        endTime: formData.get('endTime') || undefined,
        paymentMethod: formData.get('paymentMethod') ?? undefined,
        driverName: formData.get('driverName'),
        driverLicense: formData.get('driverLicense'),
        pickupLocationId: formData.get('pickupLocationId') || null,
        returnLocationId: formData.get('returnLocationId') || null,
        depositPaid: formData.get('depositPaid') || null,
        notes: formData.get('notes'),
        options: formData.getAll('options').map((v) => Number(v)),
    };

    const parsed = safeValidate(rentalSchema, raw);
    if (!parsed.ok) return { success: false, error: parsed.error };
    const data = parsed.data;

    const startDate = parseBookingDateTime(data.startDate, data.startTime);
    const endDate = parseBookingDateTime(data.endDate, data.endTime);
    if (!startDate || !endDate || endDate <= startDate) {
        return { success: false, error: 'Ungültiger Mietzeitraum.' };
    }

    try {
        const car = await prisma.car.findUnique({ where: { id: data.carId } });
        if (!car) return { success: false, error: 'Fahrzeug nicht gefunden.' };

        const days = calculateChargeableDays(data.startDate, data.startTime, data.endDate, data.endTime);
        const selectedOptions = data.options.length
            ? await prisma.option.findMany({ where: { id: { in: data.options } } })
            : [];
        const price = priceRental(car, selectedOptions, days);

        // A rental that has already started is handed over right away; future
        // ones stay Pending until check-in, like online bookings.
        const startsNow = startDate.getTime() <= Date.now();

        const rentalId = await prisma.$transaction(async (tx) => {
            await lockCarForBooking(tx, data.carId);
            if (!(await isCarAvailable(data.carId, startDate, endDate, tx))) {
                throw new RentalConflictError('Das Fahrzeug ist in diesem Zeitraum bereits gebucht.');
            }

            const created = await tx.rental.create({
                data: {
                    carId: data.carId,
                    customerId: data.customerId,
                    startDate,
                    endDate,
                    dailyRate: car.dailyRate,
                    totalDays: days,
                    totalAmount: price.baseTotal,
                    extrasCost: price.extrasCost,
                    insuranceCost: price.insuranceCost,
                    insuranceType: price.insuranceType,
                    includedKm: price.includedKm,
                    status: startsNow ? 'Active' : 'Pending',
                    paymentStatus: 'Pending',
                    paymentMethod: data.paymentMethod,
                    driverName: data.driverName,
                    driverLicense: data.driverLicense,
                    pickupLocationId: data.pickupLocationId ?? car.locationId ?? null,
                    returnLocationId: data.returnLocationId ?? car.locationId ?? null,
                    depositPaid: data.depositPaid ?? null,
                    notes: data.notes,
                    options: {
                        create: data.options.map((id) => ({ optionId: id })),
                    },
                },
            });

            // Derived from the id so it is unique (the old random number could collide).
            await tx.rental.update({
                where: { id: created.id },
                data: { contractNumber: `RNT-${new Date().getFullYear()}-${String(created.id).padStart(7, '0')}` },
            });

            if (startsNow) {
                await tx.car.update({
                    where: { id: data.carId },
                    data: { status: 'Rented' },
                });
            }

            return created.id;
        });

        await auditLog({
            userId: staff.id,
            userName: staff.name,
            action: 'CREATE',
            entityType: 'Rental',
            entityId: rentalId,
            description: `Reservation created in admin for car ${car.brand} ${car.model}`,
            metadata: { totalAmount: price.baseTotal, days, carId: data.carId },
        });
    } catch (error) {
        if (error instanceof RentalConflictError) {
            return { success: false, error: error.message };
        }
        console.error('Error creating rental:', error);
        return { success: false, error: 'Fehler beim Erstellen der Miete' };
    }

    revalidatePath('/admin/reservations');
    revalidatePath('/admin/fleet');
    redirect('/admin/reservations');
}
