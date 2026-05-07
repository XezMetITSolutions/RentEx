'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { differenceInDays } from 'date-fns';
import { rentalSchema, safeValidate } from '@/lib/schemas';

export async function createRental(formData: FormData) {
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

    try {
        // Auto-generate contract number: REX-YY-XXXXX
        const year = new Date().getFullYear().toString().slice(-2);
        const random = Math.floor(10000 + Math.random() * 90000);
        const contractNumber = `REX-${year}-${random}`;

        const car = await prisma.car.findUnique({ where: { id: data.carId } });
        if (!car) throw new Error('Fahrzeug nicht gefunden');
        const days = Math.max(1, differenceInDays(data.endDate, data.startDate));
        let totalAmount = Number(car.dailyRate) * days;

        const selectedOptions = data.options.length
            ? await prisma.option.findMany({ where: { id: { in: data.options } } })
            : [];

        const optionsTotal = selectedOptions.reduce((acc, opt) => acc + Number(opt.price), 0);
        totalAmount += optionsTotal;

        await prisma.rental.create({
            data: {
                carId: data.carId,
                customerId: data.customerId,
                startDate: data.startDate,
                endDate: data.endDate,
                dailyRate: car.dailyRate,
                totalDays: days,
                totalAmount,
                status: 'Active',
                paymentStatus: 'Pending',
                paymentMethod: data.paymentMethod,
                contractNumber,
                driverName: data.driverName,
                driverLicense: data.driverLicense,
                pickupLocationId: data.pickupLocationId ?? null,
                returnLocationId: data.returnLocationId ?? null,
                depositPaid: data.depositPaid ?? null,
                notes: data.notes,
                options: {
                    create: data.options.map((id) => ({ optionId: id })),
                },
            },
        });

        await prisma.car.update({
            where: { id: data.carId },
            data: { status: 'Rented' },
        });
    } catch (error) {
        console.error('Error creating rental:', error);
        return { success: false, error: 'Fehler beim Erstellen der Miete' };
    }

    revalidatePath('/admin/reservations');
    revalidatePath('/admin/fleet');
    redirect('/admin/reservations');
}
