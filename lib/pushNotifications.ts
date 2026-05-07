/**
 * pushNotifications.ts — Expo Push API integration.
 *
 * Sends push notifications to customers / staff that have registered an
 * Expo push token via the mobile app. Failed tokens (DeviceNotRegistered)
 * are removed automatically so we stop trying to use them.
 *
 * Docs: https://docs.expo.dev/push-notifications/sending-notifications/
 */
import prisma from './prisma';

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

export interface PushPayload {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    /** Optional sound name; default null disables sound */
    sound?: 'default' | null;
    /** iOS badge count */
    badge?: number;
    /** Channel id on Android (default: 'default') */
    channelId?: string;
}

interface ExpoMessage extends PushPayload {
    to: string;
}

interface ExpoTicket {
    status: 'ok' | 'error';
    id?: string;
    message?: string;
    details?: { error?: string };
}

interface ExpoResponse {
    data: ExpoTicket[] | ExpoTicket;
    errors?: Array<{ code: string; message: string }>;
}

/**
 * Low-level: send to a list of explicit tokens. Removes invalid tokens.
 * Returns the number of successfully delivered tickets.
 */
export async function sendToTokens(tokens: string[], payload: PushPayload): Promise<number> {
    if (tokens.length === 0) return 0;

    const messages: ExpoMessage[] = tokens.map((to) => ({
        to,
        sound: payload.sound ?? 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data,
        badge: payload.badge,
        channelId: payload.channelId ?? 'default',
    }));

    let res: Response;
    try {
        res = await fetch(EXPO_PUSH_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
            },
            body: JSON.stringify(messages),
        });
    } catch (err) {
        console.error('[push] network error:', err);
        return 0;
    }

    if (!res.ok) {
        console.error('[push] non-2xx response:', res.status);
        return 0;
    }

    const json = (await res.json().catch(() => ({}))) as ExpoResponse;
    const tickets = Array.isArray(json.data) ? json.data : json.data ? [json.data] : [];
    let delivered = 0;
    const tokensToRemove: string[] = [];

    tickets.forEach((ticket, i) => {
        if (ticket.status === 'ok') {
            delivered++;
        } else if (ticket.details?.error === 'DeviceNotRegistered') {
            tokensToRemove.push(tokens[i]);
        } else {
            console.warn('[push] error:', ticket.message, ticket.details);
        }
    });

    if (tokensToRemove.length > 0) {
        await prisma.pushToken
            .deleteMany({ where: { token: { in: tokensToRemove } } })
            .catch((err) => console.error('[push] cleanup failed:', err));
    }

    return delivered;
}

/** Send a push to all registered devices of a customer */
export async function notifyCustomer(customerId: number, payload: PushPayload): Promise<number> {
    const rows = await prisma.pushToken.findMany({
        where: { customerId },
        select: { token: true },
    });
    return sendToTokens(rows.map((r) => r.token), payload);
}

/** Send a push to all registered devices of a staff member */
export async function notifyStaff(staffId: number, payload: PushPayload): Promise<number> {
    const rows = await prisma.pushToken.findMany({
        where: { staffId },
        select: { token: true },
    });
    return sendToTokens(rows.map((r) => r.token), payload);
}

/** Broadcast to all staff (e.g. urgent ops alerts) */
export async function notifyAllStaff(payload: PushPayload): Promise<number> {
    const rows = await prisma.pushToken.findMany({
        where: { staffId: { not: null } },
        select: { token: true },
    });
    return sendToTokens(rows.map((r) => r.token), payload);
}
