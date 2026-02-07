'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
