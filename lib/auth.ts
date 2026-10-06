import { cookies } from 'next/headers';
import crypto from 'crypto';
import { AUTH_CONFIG } from './config';
import { createSessionToken, verifySessionToken } from './sessionToken';

const COOKIE_NAME = 'rentex_customer';

function hashPassword(password: string): string {
    const salt = crypto.randomBytes(AUTH_CONFIG.PASSWORD_SALT_LENGTH).toString('hex');
    const hash = crypto.scryptSync(password, salt, AUTH_CONFIG.PASSWORD_KEY_LENGTH, AUTH_CONFIG.PASSWORD_SCRYPT_OPTS).toString('hex');
    return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
    const separator = stored.includes(':') ? ':' : '.';
    const [salt, hash] = stored.split(separator);
    if (!salt || !hash) return false;
    const derived = crypto.scryptSync(password, salt, AUTH_CONFIG.PASSWORD_KEY_LENGTH, AUTH_CONFIG.PASSWORD_SCRYPT_OPTS).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}

export async function setSession(customerId: number) {
    const c = await cookies();
    c.set(COOKIE_NAME, await createSessionToken('customer', customerId, AUTH_CONFIG.CUSTOMER_SESSION_TTL), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: AUTH_CONFIG.CUSTOMER_SESSION_TTL,
        path: '/',
    });
}

export async function getSession(): Promise<number | null> {
    const c = await cookies();
    return verifySessionToken('customer', c.get(COOKIE_NAME)?.value);
}

export async function clearSession() {
    const c = await cookies();
    c.delete(COOKIE_NAME);
}

const BOOKING_VIEW_COOKIE = 'rentex_booking_view';

/** Lets the success page show this booking to the browser that just created it. */
export async function grantBookingView(rentalId: number) {
    const c = await cookies();
    c.set(BOOKING_VIEW_COOKIE, await createSessionToken('booking-view', rentalId, 60 * 60 * 6), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 6,
        path: '/',
    });
}

export async function getBookingView(): Promise<number | null> {
    const c = await cookies();
    return verifySessionToken('booking-view', c.get(BOOKING_VIEW_COOKIE)?.value);
}

export { hashPassword };
