'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateSystemSetting(key: string, value: string) {
    try {
        await prisma.systemSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value, category: 'General' },
        });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error('Error updating setting:', error);
        return { success: false, error: 'Failed to update setting' };
    }
}
