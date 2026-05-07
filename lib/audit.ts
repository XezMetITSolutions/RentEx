/**
 * audit.ts — Structured audit log helper.
 *
 * Wraps the existing ActivityLog model with a small, typed surface so
 * callers don't have to remember the JSON shape. Failures are swallowed
 * (logged to console) — auditing must never block the primary action.
 */
import prisma from './prisma';
import { headers } from 'next/headers';

export type AuditActor =
    | { kind: 'admin'; id: number; name: string }
    | { kind: 'customer'; id: number; name?: string }
    | { kind: 'system' };

export interface AuditEntry {
    /** Action verb in PAST tense, SCREAMING_SNAKE: LOGIN_SUCCESS, REFUND_ISSUED, ... */
    action: string;
    entityType: string;        // Rental, Customer, Staff, Car, Auth, ...
    entityId?: number;
    actor: AuditActor;
    description: string;       // Human-readable
    metadata?: Record<string, unknown>;
}

async function getRequestIp(): Promise<string | null> {
    try {
        const h = await headers();
        return (
            h.get('cf-connecting-ip') ||
            h.get('x-forwarded-for')?.split(',')[0].trim() ||
            null
        );
    } catch {
        // headers() throws outside a request context (e.g. cron) — fine to skip
        return null;
    }
}

async function getUserAgent(): Promise<string | null> {
    try {
        const h = await headers();
        return h.get('user-agent');
    } catch {
        return null;
    }
}

export async function auditLog(entry: AuditEntry): Promise<void> {
    try {
        const [ipAddress, userAgent] = await Promise.all([getRequestIp(), getUserAgent()]);

        const userId =
            entry.actor.kind === 'system' ? null : String(entry.actor.id);
        const userName =
            entry.actor.kind === 'admin' ? entry.actor.name :
            entry.actor.kind === 'customer' ? (entry.actor.name ?? null) :
            'system';

        await prisma.activityLog.create({
            data: {
                action: entry.action,
                entityType: entry.entityType,
                entityId: entry.entityId ?? null,
                userId,
                userName,
                description: entry.description,
                metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
                ipAddress,
                userAgent,
            },
        });
    } catch (err) {
        console.error('[audit] write failed:', err);
    }
}
