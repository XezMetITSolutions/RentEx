import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

/** Gets the current customer from session cookie. */
export async function getCurrentCustomer() {
    const customerId = await getSession();
    if (customerId == null) return null;
    return prisma.customer.findUnique({ where: { id: customerId } });
}
