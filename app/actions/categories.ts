'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const DEFAULT_CAR_CATEGORIES = [
    'Kleinwagen', 'Mittelklasse', 'Limousine', 'SUV', 'Van', 'Sportwagen', 'Cabrio', 'Kombi', 'Bus', 'Kastenwagen'
];

export async function getCarCategories() {
    let list = await prisma.carCategory.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    // Sync categories table with defaults and actual car categories in the database
    const activeCars = await prisma.car.findMany({
        where: { status: 'Active', isActive: true },
        select: { category: true }
    });
    const activeCarCats = Array.from(new Set(activeCars.map(c => c.category).filter(Boolean))) as string[];
    const allNeededNames = Array.from(new Set([...DEFAULT_CAR_CATEGORIES, ...activeCarCats]));

    const existingNames = new Set(list.map(c => c.name.toLowerCase()));
    const missingNames = allNeededNames.filter(name => !existingNames.has(name.toLowerCase()));

    if (missingNames.length > 0) {
        const maxOrderResult = await prisma.carCategory.aggregate({
            _max: { sortOrder: true }
        });
        const startOrder = (maxOrderResult._max.sortOrder ?? -1) + 1;

        await prisma.carCategory.createMany({
            data: missingNames.map((name, i) => ({
                name,
                sortOrder: startOrder + i
            }))
        });

        list = await prisma.carCategory.findMany({
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });
    }

    return list;
}

export async function createCarCategory(name: string) {
    const maxOrder = await prisma.carCategory.aggregate({ _max: { sortOrder: true } });
    await prisma.carCategory.create({
        data: { name: name.trim(), sortOrder: (maxOrder._max.sortOrder ?? -1) + 1 },
    });
    revalidatePath('/admin/fleet');
}

export async function updateCarCategory(id: number, name: string) {
    await prisma.carCategory.update({ where: { id }, data: { name: name.trim() } });
    revalidatePath('/admin/fleet');
}

export async function deleteCarCategory(id: number) {
    await prisma.carCategory.delete({ where: { id } });
    revalidatePath('/admin/fleet');
}
