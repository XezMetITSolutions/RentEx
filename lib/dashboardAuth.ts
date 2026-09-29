import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/** Gets the current customer from session cookie. */
export async function getCurrentCustomer() {
    const customerId = await getSession();
    if (customerId == null) return null;
    // Callers pass this to client components — never include the password hash.
    return prisma.customer.findUnique({ where: { id: customerId }, omit: { passwordHash: true } });
}

/** Customer data that is safe to hand to a client component (no password hash). */
export function toClientCustomer<T extends object>(customer: T | null) {
    if (!customer) return null;
    const rest = { ...customer } as Record<string, unknown>;
    delete rest.passwordHash;
    return JSON.parse(JSON.stringify(rest)) as Omit<T, 'passwordHash'>;
}
