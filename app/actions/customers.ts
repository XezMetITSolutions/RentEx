'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { customerSchema, formDataToObject, safeValidate } from '@/lib/schemas';

export async function createCustomer(formData: FormData) {
    const parsed = safeValidate(customerSchema, formDataToObject(formData));
    if (!parsed.ok) return { success: false, error: parsed.error };

    try {
        const customer = await prisma.customer.create({
            data: { ...parsed.data, country: parsed.data.country ?? 'Österreich' },
        });
        revalidatePath('/admin/customers');
        revalidatePath('/admin/reservations/new');
        return { success: true, customer };
    } catch (error) {
        console.error('Error creating customer:', error);
        return { success: false, error: 'Fehler beim Erstellen des Kunden' };
    }
}

export async function updateCustomer(id: number, formData: FormData) {
    const parsed = safeValidate(customerSchema, formDataToObject(formData));
    if (!parsed.ok) return { success: false, error: parsed.error };

    try {
        const customer = await prisma.customer.update({
            where: { id },
            data: { ...parsed.data, country: parsed.data.country ?? 'Österreich' },
        });
        revalidatePath('/admin/customers');
        revalidatePath(`/admin/customers/${id}`);
        return { success: true, customer };
    } catch (error) {
        console.error('Error updating customer:', error);
        return { success: false, error: 'Fehler beim Aktualisieren des Kunden' };
    }
}
