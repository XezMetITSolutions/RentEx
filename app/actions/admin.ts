'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/** Tüm araçları "Rent-Ex Feldkirch" standortuna atar (locationId + homeLocationId). Plakalar değiştirilmez. */
export async function assignAllCarsToFeldkirch(): Promise<{ ok: boolean; message: string; count?: number }> {
    const feldkirch = await prisma.location.findFirst({
        where: {
            OR: [
                { name: 'Rent-Ex Feldkirch' },
                { code: 'FK-01' }
            ]
        }
    });

    if (!feldkirch) {
        return { ok: false, message: 'Standort "Rent-Ex Feldkirch" nicht gefunden.' };
    }

    const result = await prisma.car.updateMany({
        data: {
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    });

    revalidatePath('/admin/fleet');
    revalidatePath('/admin/locations');
    return { ok: true, message: `${result.count} Fahrzeuge dem Standort Rent-Ex Feldkirch zugewiesen.`, count: result.count };
}

export async function createTask(formData: FormData) {
    const title = (formData.get('title') as string)?.trim();
    if (!title) {
        return { error: 'Titel ist erforderlich.' };
    }
    const description = (formData.get('description') as string)?.trim() || null;
    const priority = (formData.get('priority') as string) || 'medium';
    const status = (formData.get('status') as string) || 'todo';
    const dueDateStr = formData.get('dueDate') as string;
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;
    const assignedTo = (formData.get('assignedTo') as string)?.trim() || null;
    const relatedCarIdStr = formData.get('relatedCarId') as string;
    const relatedCarId = relatedCarIdStr ? parseInt(relatedCarIdStr, 10) : null;

    await prisma.task.create({
        data: {
            title,
            description,
            priority,
            status,
            dueDate,
            assignedTo,
            relatedCarId: relatedCarId != null && !Number.isNaN(relatedCarId) ? relatedCarId : undefined,
        },
    });
    revalidatePath('/admin/tasks');
    redirect('/admin/tasks');
}

export async function createCoupon(formData: FormData) {
    const code = (formData.get('code') as string)?.trim().toUpperCase();
    if (!code) {
        return { error: 'Gutscheincode ist erforderlich.' };
    }
    const existing = await prisma.discountCoupon.findUnique({ where: { code } });
    if (existing) {
        return { error: 'Dieser Code existiert bereits.' };
    }
    const discountType = (formData.get('discountType') as string) || 'PERCENTAGE';
    const discountValue = parseFloat((formData.get('discountValue') as string) || '0');
    if (discountValue <= 0 || (discountType === 'PERCENTAGE' && discountValue > 100)) {
        return { error: 'Ungültiger Rabattwert.' };
    }
    const description = (formData.get('description') as string)?.trim() || null;
    const validFromStr = formData.get('validFrom') as string;
    const validUntilStr = formData.get('validUntil') as string;
    const validFrom = validFromStr ? new Date(validFromStr) : null;
    const validUntil = validUntilStr ? new Date(validUntilStr) : null;
    const usageLimitStr = formData.get('usageLimit') as string;
    const usageLimit = usageLimitStr ? parseInt(usageLimitStr, 10) : null;
    const isActive = formData.get('isActive') === 'on';

    await prisma.discountCoupon.create({
        data: {
            code,
            description,
            discountType,
            discountValue,
            validFrom,
            validUntil,
            usageLimit: usageLimit ?? undefined,
            isActive,
        },
    });
    revalidatePath('/admin/marketing');
    redirect('/admin/marketing');
}
