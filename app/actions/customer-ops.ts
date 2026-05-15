'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/adminAuth';
import { auditLog } from '@/lib/audit';
import { hashPassword } from '@/lib/auth';

export async function toggleCustomerBlacklist(customerId: number, reason?: string) {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        if (!customer) return { success: false, error: 'Kunde nicht gefunden' };

        const newState = !customer.isBlacklisted;
        
        await prisma.customer.update({
            where: { id: customerId },
            data: { 
                isBlacklisted: newState,
                blacklistReason: newState ? (reason || 'Gesperrt durch Administrator') : null
            }
        });

        await auditLog({
            userId: session.id,
            userName: session.name,
            action: 'UPDATE',
            entityType: 'Customer',
            entityId: customerId,
            description: newState ? `Kunde gesperrt: ${customer.email}` : `Kunde entsperrt: ${customer.email}`,
            metadata: { reason }
        });

        revalidatePath(`/admin/customers/${customerId}`);
        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        console.error('Error toggling blacklist:', error);
        return { success: false, error: 'Fehler beim Ändern des Blacklist-Status' };
    }
}

export async function resetCustomerPassword(customerId: number, newPassword?: string) {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'Unauthorized' };

    try {
        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });

        if (!customer) return { success: false, error: 'Kunde nicht gefunden' };

        // If no password provided, generate a random 8-character password
        const passwordToSet = newPassword || Math.random().toString(36).slice(-8);
        const passwordHash = hashPassword(passwordToSet);

        await prisma.customer.update({
            where: { id: customerId },
            data: { passwordHash }
        });

        await auditLog({
            userId: session.id,
            userName: session.name,
            action: 'UPDATE',
            entityType: 'Customer',
            entityId: customerId,
            description: `Passwort zurückgesetzt für Kunde: ${customer.email}`
        });

        return { success: true, tempPassword: passwordToSet };
    } catch (error) {
        console.error('Error resetting password:', error);
        return { success: false, error: 'Fehler beim Zurücksetzen des Passworts' };
    }
}
