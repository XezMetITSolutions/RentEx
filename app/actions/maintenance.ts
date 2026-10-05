'use server';

import { requireAdminModule } from '@/lib/adminAccess';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createMaintenance(formData: FormData) {
    await requireAdminModule('Wartung');
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

export interface MaintenanceInput {
    carId: number;
    maintenanceType: string;
    description: string;
    cost?: number | null;
    mileage?: number | null;
    performedBy?: string | null;
    performedDate?: string | Date;
    nextDueDate?: string | Date | null;
    invoiceUrl?: string | null;
    notes?: string | null;
    setCarToMaintenance?: boolean;
}

export async function addMaintenanceRecord(input: MaintenanceInput) {
    await requireAdminModule('Wartung');
    try {
        const record = await prisma.maintenanceRecord.create({
            data: {
                carId: input.carId,
                maintenanceType: input.maintenanceType,
                description: input.description,
                cost: input.cost ? Number(input.cost) : null,
                mileage: input.mileage ? Number(input.mileage) : null,
                performedBy: input.performedBy || null,
                performedDate: input.performedDate ? new Date(input.performedDate) : new Date(),
                nextDueDate: input.nextDueDate ? new Date(input.nextDueDate) : null,
                invoiceUrl: input.invoiceUrl || null,
                notes: input.notes || null,
            }
        });

        // Update car mileage if provided and higher than current
        if (input.mileage) {
            const currentCar = await prisma.car.findUnique({
                where: { id: input.carId },
                select: { currentMileage: true }
            });
            if (currentCar && (!currentCar.currentMileage || input.mileage > currentCar.currentMileage)) {
                await prisma.car.update({
                    where: { id: input.carId },
                    data: { currentMileage: input.mileage }
                });
            }
        }

        // If requested, set car to Maintenance
        if (input.setCarToMaintenance) {
            await prisma.car.update({
                where: { id: input.carId },
                data: { status: 'Maintenance' }
            });
        }

        revalidatePath('/admin/maintenance');
        revalidatePath('/admin/fleet');
        revalidatePath(`/admin/fleet/${input.carId}`);
        return { success: true, record };
    } catch (error: any) {
        console.error('Error adding maintenance record:', error);
        return { success: false, error: error?.message || 'Fehler beim Erstellen des Wartungseintrags' };
    }
}

export async function updateMaintenanceRecord(id: number, input: Partial<MaintenanceInput>) {
    await requireAdminModule('Wartung');
    try {
        const updateData: any = {};
        if (input.maintenanceType !== undefined) updateData.maintenanceType = input.maintenanceType;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.cost !== undefined) updateData.cost = input.cost !== null ? Number(input.cost) : null;
        if (input.mileage !== undefined) updateData.mileage = input.mileage !== null ? Number(input.mileage) : null;
        if (input.performedBy !== undefined) updateData.performedBy = input.performedBy || null;
        if (input.performedDate !== undefined) updateData.performedDate = new Date(input.performedDate);
        if (input.nextDueDate !== undefined) updateData.nextDueDate = input.nextDueDate ? new Date(input.nextDueDate) : null;
        if (input.notes !== undefined) updateData.notes = input.notes || null;
        if (input.invoiceUrl !== undefined) updateData.invoiceUrl = input.invoiceUrl || null;

        const record = await prisma.maintenanceRecord.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/admin/maintenance');
        revalidatePath('/admin/fleet');
        return { success: true, record };
    } catch (error: any) {
        console.error('Error updating maintenance record:', error);
        return { success: false, error: error?.message || 'Fehler beim Aktualisieren' };
    }
}

export async function deleteMaintenanceRecord(id: number) {
    await requireAdminModule('Wartung');
    try {
        await prisma.maintenanceRecord.delete({ where: { id } });
        revalidatePath('/admin/maintenance');
        revalidatePath('/admin/fleet');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting maintenance record:', error);
        return { success: false, error: error?.message || 'Fehler beim Löschen' };
    }
}

export async function releaseCarFromMaintenance(carId: number) {
    await requireAdminModule('Wartung');
    try {
        await prisma.car.update({
            where: { id: carId },
            data: { status: 'Active' }
        });
        revalidatePath('/admin/maintenance');
        revalidatePath('/admin/fleet');
        revalidatePath(`/admin/fleet/${carId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Error releasing car:', error);
        return { success: false, error: error?.message || 'Fehler beim Freigeben' };
    }
}

