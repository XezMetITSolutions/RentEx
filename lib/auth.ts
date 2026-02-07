import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'rentex_customer';
const SALT_LEN = 16;
const KEY_LEN = 64;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };

function hashPassword(password: string): string {
    const salt = crypto.randomBytes(SALT_LEN).toString('hex');
    const hash = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_OPTS).toString('hex');
    return `${salt}.${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split('.');
    if (!salt || !hash) return false;
    const derived = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_OPTS).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}

export async function setSession(customerId: number) {
    const c = await cookies();
    c.set(COOKIE_NAME, String(customerId), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });
}

export async function getSession(): Promise<number | null> {
    const c = await cookies();
    const v = c.get(COOKIE_NAME)?.value;
    if (!v) return null;
    const id = parseInt(v, 10);
    return Number.isNaN(id) ? null : id;
}

export async function clearSession() {
    const c = await cookies();
    c.delete(COOKIE_NAME);
}

export { hashPassword };
