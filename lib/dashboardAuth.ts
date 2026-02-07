import prisma from '@/lib/prisma';

/**
 * Gets the current customer for dashboard pages.
 * In production this would use auth session (e.g. NextAuth, Clerk).
 */
export async function getCurrentCustomer() {
    return prisma.customer.findFirst();
}
