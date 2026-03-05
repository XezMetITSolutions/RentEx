/**
 * rateLimit.ts
 * In-memory rate limiter for Next.js API routes
 * Usage: import { rateLimit } from '@/lib/rateLimit'
 */

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

/** Helper: get client IP from Next.js request */
export function getClientIp(req: Request): string {
    const cf = req.headers.get("cf-connecting-ip");
    if (cf) return cf;
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return "unknown";
}
