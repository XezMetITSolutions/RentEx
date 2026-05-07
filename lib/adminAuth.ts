import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { AUTH_CONFIG } from './config';

const ADMIN_COOKIE_NAME = 'rentex_admin_session';
const ADMIN_2FA_PENDING_COOKIE = 'rentex_admin_2fa_pending';
const ADMIN_2FA_PENDING_TTL = 5 * 60; // 5 minutes

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
        maxAge: AUTH_CONFIG.ADMIN_SESSION_TTL,
        path: '/',
    });
}

export async function clearAdminSession() {
    const c = await cookies();
    c.delete(ADMIN_COOKIE_NAME);
    c.delete(ADMIN_2FA_PENDING_COOKIE);
}

// ─────────────────────────────────────────────
// 2FA pending session — set after password ✔ but before TOTP code ✔
// ─────────────────────────────────────────────

export async function setAdmin2FAPending(staffId: number) {
    const c = await cookies();
    c.set(ADMIN_2FA_PENDING_COOKIE, String(staffId), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ADMIN_2FA_PENDING_TTL,
        path: '/',
    });
}

export async function getAdmin2FAPendingStaffId(): Promise<number | null> {
    const c = await cookies();
    const v = c.get(ADMIN_2FA_PENDING_COOKIE)?.value;
    if (!v) return null;
    const id = parseInt(v, 10);
    return isNaN(id) ? null : id;
}

export async function clearAdmin2FAPending() {
    const c = await cookies();
    c.delete(ADMIN_2FA_PENDING_COOKIE);
}
