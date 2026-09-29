/**
 * rateLimit.ts
 * In-memory rate limiter for Next.js API routes and server actions
 * Usage: import { rateLimit } from '@/lib/rateLimit'
 */
import { headers } from 'next/headers';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (now > entry.resetAt) store.delete(key);
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    /** Max requests per window */
    limit: number;
    /** Window in seconds */
    windowSeconds: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

export function rateLimit(
    identifier: string,
    config: RateLimitConfig = { limit: 30, windowSeconds: 60 }
): RateLimitResult {
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const key = identifier;

    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        // New window
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: config.limit - 1, resetAt: now + windowMs };
    }

    if (entry.count >= config.limit) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return {
        allowed: true,
        remaining: config.limit - entry.count,
        resetAt: entry.resetAt,
    };
}

type SharedLimiter = { limit(options: { key: string }): Promise<{ success: boolean }> };

/** Cloudflare rate-limit binding (wrangler.jsonc `ratelimits`), if running on Workers. */
function getSharedAuthLimiter(): SharedLimiter | undefined {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getCloudflareContext } = require('@opennextjs/cloudflare');
        const env = getCloudflareContext({ async: false })?.env as Record<string, unknown> | undefined;
        return env?.AUTH_RATE_LIMITER as SharedLimiter | undefined;
    } catch {
        return undefined;
    }
}

/**
 * Rate limit for authentication attempts. On Workers every isolate has its own
 * memory, so the in-memory counter alone can be bypassed by spreading requests;
 * the shared Cloudflare limiter (10/min per key) closes that gap. Falls back
 * to in-memory only (e.g. `next dev`, scripts).
 */
export async function rateLimitAuth(identifier: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const local = rateLimit(identifier, config);
    if (!local.allowed) return local;

    const shared = getSharedAuthLimiter();
    if (shared) {
        try {
            const { success } = await shared.limit({ key: identifier });
            if (!success) return { allowed: false, remaining: 0, resetAt: Date.now() + 60_000 };
        } catch (error) {
            console.error('[rateLimit] shared limiter failed, using in-memory only:', error);
        }
    }
    return local;
}

/** Helper: get client IP from Next.js request (API routes) */
export function getClientIp(req: Request): string {
    const cf = req.headers.get("cf-connecting-ip");
    if (cf) return cf;
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return "unknown";
}

/** Helper: get client IP from headers() (server actions / RSC) */
export async function getClientIpFromHeaders(): Promise<string> {
    const h = await headers();
    const cf = h.get("cf-connecting-ip");
    if (cf) return cf;
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return "unknown";
}

/** Preset configs for common auth flows */
export const RATE_LIMITS = {
    /** Login attempts per IP+email — prevents brute force */
    AUTH_LOGIN: { limit: 5, windowSeconds: 60 * 5 },
    /** Account creation per IP — prevents spam signups */
    AUTH_REGISTER: { limit: 3, windowSeconds: 60 * 60 },
    /** Password change/reset per IP+user — prevents abuse */
    AUTH_PASSWORD: { limit: 5, windowSeconds: 60 * 15 },
} as const satisfies Record<string, RateLimitConfig>;

/** Format a Retry-After response payload from a rate limit result */
export function rateLimitErrorMessage(result: RateLimitResult, label = "Anfrage"): string {
    const seconds = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
    const minutes = Math.ceil(seconds / 60);
    if (seconds < 60) return `Zu viele Versuche. Bitte ${seconds} Sekunden warten.`;
    return `Zu viele Versuche. Bitte ${minutes} Minute${minutes === 1 ? "" : "n"} warten.`;
}
