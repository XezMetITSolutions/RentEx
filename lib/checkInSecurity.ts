import crypto from 'crypto';

/**
 * Generates an unforgeable, 32-character HMAC token for self check-in links.
 * Binds rentalId, customerId, and booking creation timestamp.
 */
export function getCheckInToken(rentalId: number, customerId: number, createdAt: Date | string): string {
    const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET || process.env.DATABASE_URL || 'rent-ex-secure-salt-2026';
    const ts = new Date(createdAt).getTime();
    const payload = `checkin|${rentalId}|${customerId}|${ts}`;
    return crypto.createHmac('sha256', secret).update(payload).digest('hex').substring(0, 32);
}

/**
 * Validates whether the given check-in token matches the rental record.
 */
export function verifyCheckInToken(
    token: string | null | undefined,
    rentalId: number,
    customerId: number,
    createdAt: Date | string
): boolean {
    if (!token || typeof token !== 'string' || token.length !== 32) return false;
    const expected = getCheckInToken(rentalId, customerId, createdAt);
    try {
        return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
    } catch {
        return false;
    }
}

/**
 * Generates an unforgeable, 32-character HMAC token for self check-out (return) links.
 */
export function getCheckOutToken(rentalId: number, customerId: number, createdAt: Date | string): string {
    const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET || process.env.DATABASE_URL || 'rent-ex-secure-salt-2026';
    const ts = new Date(createdAt).getTime();
    const payload = `checkout|${rentalId}|${customerId}|${ts}`;
    return crypto.createHmac('sha256', secret).update(payload).digest('hex').substring(0, 32);
}

/**
 * Validates whether the given check-out token matches the rental record.
 */
export function verifyCheckOutToken(
    token: string | null | undefined,
    rentalId: number,
    customerId: number,
    createdAt: Date | string
): boolean {
    if (!token || typeof token !== 'string' || token.length !== 32) return false;
    const expected = getCheckOutToken(rentalId, customerId, createdAt);
    try {
        return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
    } catch {
        return false;
    }
}
