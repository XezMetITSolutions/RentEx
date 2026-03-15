import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

const ADMIN_COOKIE_NAME = 'rentex_admin_session';

export async function getAdminSession() {
    const c = await cookies();
    const staffId = c.get(ADMIN_COOKIE_NAME)?.value;
    if (!staffId) return null;

    const id = parseInt(staffId, 10);
    if (isNaN(id)) return null;

    const staff = await prisma.staff.findUnique({
        where: { id, isActive: true },
        include: { location: true }
    });

    return staff;
}

export async function setAdminSession(staffId: number) {
    const c = await cookies();
    c.set(ADMIN_COOKIE_NAME, String(staffId), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 12, // 12 hours
        path: '/',
    });
}

export async function clearAdminSession() {
    const c = await cookies();
    c.delete(ADMIN_COOKIE_NAME);
}
