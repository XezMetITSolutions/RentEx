'use server';

import { requireAdminModule } from '@/lib/adminAccess';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { rentalSchema, safeValidate } from '@/lib/schemas';
import { isBookableCar, isCarAvailable, lockCarForBooking } from '@/lib/availability';
import { quoteBooking } from '@/lib/bookingPrice';
import { chargeableDaysBetween } from '@/lib/bookingUtils';
import { bookingRejectedReason } from '@/lib/rentalGuards';
import { sendRentalMail } from '@/lib/rentalMail';

export async function createRental(formData: FormData) {
    await requireAdminModule('Reservierungen');
    // Build a typed object from FormData. `options` may appear multiple
    // times so we collect it via getAll().
    const raw = {
        carId: formData.get('carId'),
        customerId: formData.get('customerId'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
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

    let createdId: number;
    try {
        const car = await prisma.car.findUnique({ where: { id: data.carId } });
        if (!car) throw new Error('Fahrzeug nicht gefunden');
        if (!isBookableCar(car)) throw new Error('Fahrzeug ist nicht buchbar');

        const selectedOptions = data.options.length
            ? await prisma.option.findMany({ where: { id: { in: data.options } } })
            : [];
        const priced = selectedOptions.map((opt) => ({
            id: opt.id,
            name: opt.name,
            price: Number(opt.price),
            type: opt.type,
            isPerDay: opt.isPerDay,
            maxPrice: opt.maxPrice != null ? Number(opt.maxPrice) : null,
            maxDays: opt.maxDays,
            isMandatory: opt.isMandatory,
        }));
        const days = chargeableDaysBetween(data.startDate, data.endDate);
        const rejected = bookingRejectedReason(car, data.endDate, days);
        if (rejected) throw new Error(rejected);
        const quote = quoteBooking(car, priced, days, null, data.startDate);

        await prisma.$transaction(async (tx) => {
            await lockCarForBooking(tx, data.carId);
            if (!(await isCarAvailable(data.carId, data.startDate, data.endDate, tx))) {
                throw new Error('Das Fahrzeug ist in diesem Zeitraum bereits gebucht');
            }
            const created = await tx.rental.create({
                data: {
                    carId: data.carId,
                    customerId: data.customerId,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    dailyRate: car.dailyRate,
                    totalDays: days,
                    totalAmount: quote.total,
                    extrasCost: quote.extrasCost,
                    insuranceCost: quote.insuranceCost,
                    insuranceType: quote.insuranceName,
                    includedKm: quote.includedKm,
                    status: 'Confirmed',
                    paymentStatus: 'Pending',
                    paymentMethod: data.paymentMethod,
                    driverName: data.driverName,
                    driverLicense: data.driverLicense,
                    pickupLocationId: data.pickupLocationId ?? car.locationId,
                    returnLocationId: data.returnLocationId ?? car.locationId,
                    depositPaid: data.depositPaid ?? null,
                    notes: data.notes,
                    options: {
                        create: priced.map((opt) => ({ optionId: opt.id })),
                    },
                },
            });
            const year = new Date().getFullYear().toString().slice(-2);
            await tx.rental.update({
                where: { id: created.id },
                data: { contractNumber: `REX-${year}-${String(created.id).padStart(5, '0')}` },
            });
            createdId = created.id;
        });
    } catch (error) {
        console.error('Error creating rental:', error);
        if (error instanceof Error && /gebucht|buchbar|gefunden|Versicherung|Überprüfung|Tage|Tagespreis/.test(error.message)) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'Fehler beim Erstellen der Miete' };
    }

    await sendRentalMail(createdId!, { type: 'confirmed', staff: false });

    revalidatePath('/admin/reservations');
    revalidatePath('/admin/fleet');
    redirect('/admin/reservations');
}
