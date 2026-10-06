import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import { PENDING_PAYMENT_TTL_MINUTES } from './config';

/** Rental statuses that occupy a car for their date range. */
export const BLOCKING_RENTAL_STATUSES = ['Pending', 'Confirmed', 'Active'];

type Db = Prisma.TransactionClient | typeof prisma;

/** An online booking whose Stripe checkout was never paid. */
export const UNPAID_ONLINE: Prisma.RentalWhereInput = {
    status: 'Pending',
    paymentMethod: 'Online',
    paymentStatus: { not: 'Paid' },
};

/** Unpaid online bookings older than the payment window (plus a small buffer for slow webhooks). */
export function staleUnpaidOnline(now = new Date()): Prisma.RentalWhereInput {
    return {
        ...UNPAID_ONLINE,
        createdAt: { lt: new Date(now.getTime() - (PENDING_PAYMENT_TTL_MINUTES + 5) * 60_000) },
    };
}

/**
 * Rentals that block a car. Abandoned online checkouts stop blocking as soon
 * as their payment window has passed, even before the cleanup job cancels them.
 */
export function blockingRentalWhere(now = new Date()): Prisma.RentalWhereInput {
    return {
        status: { in: BLOCKING_RENTAL_STATUSES },
        NOT: staleUnpaidOnline(now),
    };
}

/** Returns true when no blocking rental of `carId` overlaps [start, end]. */
export async function isCarAvailable(
    carId: number,
    start: Date,
    end: Date,
    db: Db = prisma
): Promise<boolean> {
    const conflicts = await db.rental.count({
        where: {
            carId,
            ...blockingRentalWhere(),
            startDate: { lte: end },
            endDate: { gte: start },
        },
    });
    return conflicts === 0;
}

/**
 * Row-locks the car for the rest of the transaction so concurrent bookings of
 * the same car are serialized: the second one waits, then sees the first
 * rental in its availability check.
 */
export async function lockCarForBooking(tx: Prisma.TransactionClient, carId: number): Promise<void> {
    await tx.$queryRaw`SELECT id FROM "Car" WHERE id = ${carId} FOR UPDATE`;
}

/** Cancels online bookings whose payment window expired. Returns the number cancelled. */
export async function cancelStaleUnpaidRentals(db: Db = prisma): Promise<number> {
    const result = await db.rental.updateMany({
        where: staleUnpaidOnline(),
        data: {
            status: 'Cancelled',
            notes: `Automatisch storniert: Online-Zahlung nicht innerhalb von ${PENDING_PAYMENT_TTL_MINUTES} Minuten abgeschlossen.`,
        },
    });
    return result.count;
}
