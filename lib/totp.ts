/**
 * totp.ts — Two-factor authentication helpers (TOTP, RFC 6238)
 *
 * Wraps `otplib` v13 (functional API) and `qrcode`. Backup codes are hashed
 * with the same scrypt scheme used for passwords so a DB leak does not
 * expose plaintext recovery codes.
 */
import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const ISSUER = 'Rentex';
// Tolerate ±30s clock skew (one full step before and after current)
const EPOCH_TOLERANCE_SECONDS = 30;

export function generateTotpSecret(): string {
    return generateSecret();
}

export function buildOtpauthUri(secret: string, accountLabel: string): string {
    return generateURI({ issuer: ISSUER, label: accountLabel, secret });
}

export async function buildQrDataUrl(otpauthUri: string): Promise<string> {
    return QRCode.toDataURL(otpauthUri, { errorCorrectionLevel: 'M', margin: 1, width: 240 });
}

export async function verifyTotpCode(secret: string, code: string): Promise<boolean> {
    const cleaned = code.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleaned)) return false;
    try {
        const result = await verify({
            secret,
            token: cleaned,
            epochTolerance: EPOCH_TOLERANCE_SECONDS,
        });
        return result.valid === true;
    } catch {
        return false;
    }
}

// ─────────────────────────────────────────────────
// Backup codes — 10 single-use recovery codes
// ─────────────────────────────────────────────────

export interface BackupCodeBundle {
    /** Plaintext codes — show ONCE to the user, never store */
    plaintext: string[];
    /** Hashed codes — safe to persist as JSON */
    hashed: string[];
}

function hashBackupCode(code: string): string {
    const salt = randomBytes(8).toString('hex');
    const hash = scryptSync(code, salt, 32).toString('hex');
    return `${salt}:${hash}`;
}

export function generateBackupCodes(count = 10): BackupCodeBundle {
    const plaintext: string[] = [];
    const hashed: string[] = [];
    for (let i = 0; i < count; i++) {
        const raw = randomBytes(5).toString('hex').toUpperCase();
        const code = `${raw.slice(0, 5)}-${raw.slice(5, 10)}`;
        plaintext.push(code);
        hashed.push(hashBackupCode(code));
    }
    return { plaintext, hashed };
}

/**
 * Verify a backup code against the stored JSON list. If matched, returns the
 * remaining codes (with the matched one removed) so the caller can persist
 * the one-time-use property.
 */
export function consumeBackupCode(
    storedJson: string | null,
    inputCode: string
): { ok: false } | { ok: true; remaining: string[] } {
    if (!storedJson) return { ok: false };
    const cleaned = inputCode.trim().toUpperCase();
    let stored: string[];
    try {
        stored = JSON.parse(storedJson);
        if (!Array.isArray(stored)) return { ok: false };
    } catch {
        return { ok: false };
    }
    for (let i = 0; i < stored.length; i++) {
        const entry = stored[i];
        const [salt, hash] = entry.split(':');
        if (!salt || !hash) continue;
        const computed = scryptSync(cleaned, salt, 32);
        const expected = Buffer.from(hash, 'hex');
        if (computed.length !== expected.length) continue;
        if (timingSafeEqual(computed, expected)) {
            const remaining = stored.slice(0, i).concat(stored.slice(i + 1));
            return { ok: true, remaining };
        }
    }
    return { ok: false };
}
