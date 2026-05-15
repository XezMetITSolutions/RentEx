'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { customerSchema, formDataToObject, safeValidate } from '@/lib/schemas';

import { getAdminSession } from '@/lib/adminAuth';
import { auditLog } from '@/lib/audit';


export async function createCustomer(formData: FormData) {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const parsed = safeValidate(customerSchema, formDataToObject(formData));

    if (!parsed.ok) return { success: false, error: parsed.error };

    try {
        const customer = await prisma.customer.create({
            data: { ...parsed.data, country: parsed.data.country ?? 'Österreich' },
        });
        await auditLog({
            userId: session.id,
            userName: session.name,
            action: 'CREATE',
            entityType: 'Customer',
            entityId: customer.id,
            description: `Created customer ${customer.firstName} ${customer.lastName}`
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
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    const parsed = safeValidate(customerSchema, formDataToObject(formData));

    if (!parsed.ok) return { success: false, error: parsed.error };

    try {
        const customer = await prisma.customer.update({
            where: { id },
            data: { ...parsed.data, country: parsed.data.country ?? 'Österreich' },
        });
        await auditLog({
            userId: session.id,
            userName: session.name,
            action: 'UPDATE',
            entityType: 'Customer',
            entityId: id,
            description: `Updated customer ${customer.firstName} ${customer.lastName}`
        });

        revalidatePath('/admin/customers');
        revalidatePath(`/admin/customers/${id}`);
        return { success: true, customer };
    } catch (error) {
        console.error('Error updating customer:', error);
        return { success: false, error: 'Fehler beim Aktualisieren des Kunden' };
    }
}
