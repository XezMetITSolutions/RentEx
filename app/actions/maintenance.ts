'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMaintenance(formData: FormData) {
    try {
        const carId = Number(formData.get('carId'));
        const data = {
            carId,
            maintenanceType: formData.get('maintenanceType') as string,
            description: formData.get('description') as string,
            cost: formData.get('cost') ? Number(formData.get('cost')) : null,
            mileage: formData.get('mileage') ? Number(formData.get('mileage')) : null,
            performedBy: (formData.get('performedBy') as string) || null,
            performedDate: formData.get('performedDate')
                ? new Date(formData.get('performedDate') as string)
                : new Date(),
            nextDueDate: formData.get('nextDueDate')
                ? new Date(formData.get('nextDueDate') as string)
                : null,
            invoiceUrl: (formData.get('invoiceUrl') as string) || null,
            notes: (formData.get('notes') as string) || null,
        };

        await prisma.maintenanceRecord.create({ data });

        // Update car status if maintenance is today
        if (data.performedDate) {
            const isToday = new Date().toDateString() === data.performedDate.toDateString();
            if (isToday) {
                await prisma.car.update({
                    where: { id: carId },
                    data: { status: 'Maintenance' },
                });
            }
        }
    } catch (error) {
        console.error('Error creating maintenance record:', error);
        return { success: false, error: 'Fehler beim Erstellen des Wartungseintrags' };
    }

    revalidatePath('/admin/maintenance');
    redirect('/admin/maintenance');
}
