import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { AUTH_CONFIG } from './config';
import crypto from 'crypto';

const ADMIN_COOKIE_NAME = 'rentex_admin_session';
const ADMIN_2FA_PENDING_COOKIE = 'rentex_admin_2fa_pending';
const ADMIN_2FA_PENDING_TTL = 5 * 60; // 5 minutes

function getSecret() {
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: ADMIN_SESSION_SECRET or JWT_SECRET is missing in production! Using fallback.');
    }
    return secret || 'dev-secret-only-for-local';
}

function sign(value: string) {
    const hmac = crypto.createHmac('sha256', getSecret());
    hmac.update(value);
    return `${value}.${hmac.digest('hex')}`;
}

function verify(signedValue: string): string | null {
    const [value, signature] = signedValue.split('.');
    if (!value || !signature) return null;
    const hmac = crypto.createHmac('sha256', getSecret());
    hmac.update(value);
    const expected = hmac.digest('hex');
    try {
        if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
            return value;
        }
    } catch {
        return null;
    }
    return null;
}

export async function getAdminSession() {
    const c = await cookies();
    const signedId = c.get(ADMIN_COOKIE_NAME)?.value;
    if (!signedId) return null;

    const staffId = verify(signedId);
    if (!staffId) return null;

    const id = parseInt(staffId, 10);
    if (isNaN(id)) return null;

    const staff = await prisma.staff.findUnique({
        where: { id, isActive: true },
        include: { location: true }
    });

    return staff;
}

const COOKIE_OPTS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
};

/**
 * Set the admin session cookie.
 * - If `res` (NextResponse) is provided, sets cookie on the response object directly
 *   (reliable in API Routes / Route Handlers).
 * - Otherwise uses next/headers cookies() API (used in Server Actions).
 */
export async function setAdminSession(staffId: number, res?: import('next/server').NextResponse) {
    const value = sign(String(staffId));
    if (res) {
        res.cookies.set(ADMIN_COOKIE_NAME, value, {
            ...COOKIE_OPTS,
            maxAge: AUTH_CONFIG.ADMIN_SESSION_TTL,
        });
    } else {
        const c = await cookies();
        c.set(ADMIN_COOKIE_NAME, value, {
            ...COOKIE_OPTS,
            maxAge: AUTH_CONFIG.ADMIN_SESSION_TTL,
        });
    }
}

export async function clearAdminSession() {
    const c = await cookies();
    c.delete(ADMIN_COOKIE_NAME);
    c.delete(ADMIN_2FA_PENDING_COOKIE);
}

// ─────────────────────────────────────────────
// 2FA pending session — set after password ✔ but before TOTP code ✔
// ─────────────────────────────────────────────

export async function setAdmin2FAPending(staffId: number, res?: import('next/server').NextResponse) {
    const value = sign(String(staffId));
    if (res) {
        res.cookies.set(ADMIN_2FA_PENDING_COOKIE, value, {
            ...COOKIE_OPTS,
            maxAge: ADMIN_2FA_PENDING_TTL,
        });
    } else {
        const c = await cookies();
        c.set(ADMIN_2FA_PENDING_COOKIE, value, {
            ...COOKIE_OPTS,
            maxAge: ADMIN_2FA_PENDING_TTL,
        });
    }
}

export async function getAdmin2FAPendingStaffId(): Promise<number | null> {
    const c = await cookies();
    const signedId = c.get(ADMIN_2FA_PENDING_COOKIE)?.value;
    if (!signedId) return null;

    const staffId = verify(signedId);
    if (!staffId) return null;

    const id = parseInt(staffId, 10);
    return isNaN(id) ? null : id;
}

export async function clearAdmin2FAPending() {
    const c = await cookies();
    c.delete(ADMIN_2FA_PENDING_COOKIE);
}
