'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createOption(formData: FormData) {
    try {
        const carId = formData.get('carId') ? Number(formData.get('carId')) : null;
        const groupId = formData.get('groupId') ? Number(formData.get('groupId')) : null;
        await prisma.option.create({
            data: {
                name: formData.get('name') as string,
                description: (formData.get('description') as string) || null,
                price: Number(formData.get('price')),
                type: formData.get('type') as string,
                carCategory: (formData.get('carCategory') as string) || null,
                isPerDay: formData.get('isPerDay') === 'on',
                status: 'active',
                carId,
                groupId,
            },
        });
        revalidatePath('/admin/options');
        return { success: true };
    } catch (error) {
        console.error('Error creating option:', error);
        return { success: false, error: 'Failed to create option' };
    }
}

export async function deleteOption(id: number) {
    try {
        await prisma.option.delete({ where: { id } });
        revalidatePath('/admin/options');
        revalidatePath('/admin/fleet');
        return { success: true };
    } catch (error) {
        console.error('Error deleting option:', error);
        return { success: false, error: 'Failed to delete option' };
    }
}

export async function updateOption(id: number, formData: FormData) {
    try {
        const groupId = formData.get('groupId') ? Number(formData.get('groupId')) : null;
        await prisma.option.update({
            where: { id },
            data: {
                name: formData.get('name') as string,
                description: (formData.get('description') as string) || null,
                price: Number(formData.get('price')),
                type: formData.get('type') as string,
                carCategory: (formData.get('carCategory') as string) || null,
                isPerDay: formData.get('isPerDay') === 'on',
                groupId,
            },
        });
        revalidatePath('/admin/options');
        revalidatePath('/admin/fleet');
        return { success: true };
    } catch (error) {
        console.error('Error updating option:', error);
        return { success: false, error: 'Failed to update option' };
    }
}

export async function createOptionGroup(formData: FormData) {
    try {
        await prisma.optionGroup.create({
            data: {
                name: formData.get('name') as string,
                description: (formData.get('description') as string) || null,
            },
        });
        revalidatePath('/admin/options');
        return { success: true };
    } catch (error) {
        console.error('Error creating group:', error);
        return { success: false, error: 'Failed' };
    }
}

export async function deleteOptionGroup(id: number) {
    try {
        await prisma.optionGroup.delete({ where: { id } });
        revalidatePath('/admin/options');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
