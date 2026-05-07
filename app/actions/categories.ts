'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const DEFAULT_CAR_CATEGORIES = [
    'Kleinwagen', 'Mittelklasse', 'Limousine', 'SUV', 'Van',
    'Sportwagen', 'Cabrio', 'Kombi', 'Bus', 'Kastenwagen',
];

export async function getCarCategories() {
    const list = await prisma.carCategory.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    if (list.length === 0) {
        await prisma.carCategory.createMany({
            data: DEFAULT_CAR_CATEGORIES.map((name, i) => ({ name, sortOrder: i })),
        });
        return prisma.carCategory.findMany({
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
