import type { Prisma } from '@prisma/client';
import prisma from './prisma';

/** Rental statuses that occupy a car for their date range. */
export const BLOCKING_RENTAL_STATUSES = ['Pending', 'Confirmed', 'Active'];

/**
 * An online booking that was never paid stops blocking the car after this
 * long. Stripe Checkout sessions are created with a 30 minute expiry, so by
 * then the customer can no longer pay for it.
 */
export const ABANDONED_ONLINE_BOOKING_MINUTES = 45;

type Db = Prisma.TransactionClient | typeof prisma;

/**
 * Where-clause matching rentals that block their car: confirmed/active ones,
 * and pending ones unless they are abandoned (unpaid, expired) online checkouts.
 */
export function blockingRentalWhere(now: Date = new Date()): Prisma.RentalWhereInput {
    const cutoff = new Date(now.getTime() - ABANDONED_ONLINE_BOOKING_MINUTES * 60_000);
    return {
        OR: [
            { status: { in: BLOCKING_RENTAL_STATUSES.filter((s) => s !== 'Pending') } },
            {
                status: 'Pending',
                OR: [
                    { paymentMethod: null },
                    { paymentMethod: { not: 'Online' } },
                    { paymentStatus: 'Paid' },
                    { createdAt: { gte: cutoff } },
                ],
            },
        ],
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
            startDate: { lte: end },
            endDate: { gte: start },
            ...blockingRentalWhere(),
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
