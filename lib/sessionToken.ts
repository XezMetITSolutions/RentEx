/**
 * sessionToken.ts — Signed, expiring, purpose-bound session tokens.
 *
 * Format: `<id>.<exp>.<hmacHex>` where the HMAC covers `<purpose>|<id>|<exp>`.
 * Binding the purpose into the MAC means a customer cookie can never be
 * replayed as an admin cookie (or a 2FA-pending cookie as a full admin
 * session), even when the same secret is used for several purposes.
 *
 * Uses Web Crypto only, so it runs in both the Node runtime and middleware.
 */

export type SessionPurpose = 'customer' | 'admin' | 'admin-2fa' | 'booking-view';

const DEV_FALLBACK_SECRET = 'dev-secret-only-for-local';

function getSecret(purpose: SessionPurpose): string {
    const isAdmin = purpose === 'admin' || purpose === 'admin-2fa';
    const secret = isAdmin
        ? process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET
        : process.env.SESSION_SECRET || process.env.JWT_SECRET;
    if (secret) return secret;
    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            isAdmin
                ? 'ADMIN_SESSION_SECRET (or JWT_SECRET) must be set in production'
                : 'SESSION_SECRET (or JWT_SECRET) must be set in production'
        );
    }
    return DEV_FALLBACK_SECRET;
}

const encoder = new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

export async function createSessionToken(
    purpose: SessionPurpose,
    id: number,
    ttlSeconds: number
): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
    const sig = await hmacHex(getSecret(purpose), `${purpose}|${id}|${exp}`);
    return `${id}.${exp}.${sig}`;
}

/** Returns the id if the token is authentic, unexpired and for `purpose`. */
export async function verifySessionToken(
    purpose: SessionPurpose,
    token: string | undefined | null
): Promise<number | null> {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [idStr, expStr, sig] = parts;
    if (!/^\d+$/.test(idStr) || !/^\d+$/.test(expStr) || !/^[0-9a-f]{64}$/.test(sig)) return null;

    const exp = Number(expStr);
    if (exp < Math.floor(Date.now() / 1000)) return null;

    const expected = await hmacHex(getSecret(purpose), `${purpose}|${idStr}|${expStr}`);
    if (!constantTimeEqual(sig, expected)) return null;

    const id = Number(idStr);
    return Number.isSafeInteger(id) ? id : null;
}
