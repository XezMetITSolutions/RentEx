import { cookies } from 'next/headers';
import crypto from 'crypto';
import { AUTH_CONFIG } from './config';

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

function getSecret() {
    const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        console.error('CRITICAL: SESSION_SECRET or JWT_SECRET is missing in production! Using fallback.');
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

export async function setSession(customerId: number) {
    const c = await cookies();
    c.set(COOKIE_NAME, sign(String(customerId)), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: AUTH_CONFIG.CUSTOMER_SESSION_TTL,
        path: '/',
    });
}

export async function getSession(): Promise<number | null> {
    const c = await cookies();
    const signedValue = c.get(COOKIE_NAME)?.value;
    if (!signedValue) return null;
    
    const customerId = verify(signedValue);
    if (!customerId) return null;
    
    const id = parseInt(customerId, 10);
    return Number.isNaN(id) ? null : id;
}

export async function clearSession() {
    const c = await cookies();
    c.delete(COOKIE_NAME);
}

export { hashPassword };
