'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateDamageStatus(id: number, status: string) {
    await prisma.damageRecord.update({
        where: { id },
        data: { status }
    });
    revalidatePath('/admin/damage');
    return { success: true };
}

export async function updateDamageRepairCost(id: number, cost: number) {
    await prisma.damageRecord.update({
        where: { id },
        data: { repairCost: cost }
    });
    revalidatePath('/admin/damage');
    return { success: true };
}

export async function deleteDamageRecord(id: number) {
    await prisma.damageRecord.delete({
        where: { id }
    });
    revalidatePath('/admin/damage');
    return { success: true };
}

export async function createDamageRecord(data: {
    carId: number;
    type: string;
    description?: string;
    severity?: string;
    locationOnCar?: string;
    xPosition?: number;
    yPosition?: number;
    photoUrl?: string;
    status?: string;
}) {
    const record = await prisma.damageRecord.create({
        data: {
            carId: data.carId,
            type: data.type,
            description: data.description,
            severity: data.severity || 'Medium',
            locationOnCar: data.locationOnCar,
            xPosition: data.xPosition,
            yPosition: data.yPosition,
            photoUrl: data.photoUrl,
            status: data.status || 'open',
        }
    });
    revalidatePath('/admin/damage');
    return { success: true, id: record.id };
}
