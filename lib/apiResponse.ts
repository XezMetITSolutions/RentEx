/**
 * apiResponse.ts — Shared helpers for consistent API responses.
 *
 * Goals:
 * - Every error has a stable string `error` (kept for backward compat with
 *   existing mobile/web clients) and optionally a machine-readable `code`.
 * - Every successful response is just the payload (no wrapper) — keeps
 *   existing routes shape-compatible.
 * - Rate-limit errors automatically get a `Retry-After` header.
 *
 * Usage:
 *   return apiError('Nicht autorisiert', 401, 'UNAUTHORIZED');
 *   return apiOk({ id: 42 }, 201);
 *   return apiRateLimited(rl);
 */
import { NextResponse } from 'next/server';
import type { RateLimitResult } from './rateLimit';

/** Stable machine-readable error codes. Extend as needed. */
export const ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION: 'VALIDATION',
    CONFLICT: 'CONFLICT',
    RATE_LIMITED: 'RATE_LIMITED',
    UPLOAD_INVALID: 'UPLOAD_INVALID',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    INTERNAL: 'INTERNAL',
} as const;
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

interface ApiErrorBody {
    error: string;
    code?: ErrorCode;
}

export function apiError(
    message: string,
    status = 400,
    code?: ErrorCode,
    extraHeaders?: Record<string, string>
): NextResponse<ApiErrorBody> {
    return NextResponse.json(
        code ? { error: message, code } : { error: message },
        { status, headers: extraHeaders }
    );
}

export function apiOk<T>(data: T, status = 200): NextResponse<T> {
    return NextResponse.json(data, { status });
}

export function apiRateLimited(
    rl: RateLimitResult,
    message = 'Zu viele Anfragen. Bitte später erneut versuchen.'
): NextResponse<ApiErrorBody> {
    const retryAfter = Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000));
    return apiError(message, 429, ERROR_CODES.RATE_LIMITED, {
        'Retry-After': String(retryAfter),
    });
}

/** Convenience wrappers for the most common cases */
export const apiUnauthorized = (msg = 'Nicht autorisiert') =>
    apiError(msg, 401, ERROR_CODES.UNAUTHORIZED);

export const apiForbidden = (msg = 'Verboten') =>
    apiError(msg, 403, ERROR_CODES.FORBIDDEN);

export const apiNotFound = (msg = 'Nicht gefunden') =>
    apiError(msg, 404, ERROR_CODES.NOT_FOUND);

export const apiValidation = (msg: string) =>
    apiError(msg, 400, ERROR_CODES.VALIDATION);

export const apiInternal = (msg = 'Serverfehler') =>
    apiError(msg, 500, ERROR_CODES.INTERNAL);
