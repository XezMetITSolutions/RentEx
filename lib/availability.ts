import type { Prisma } from '@prisma/client';
import prisma from './prisma';

/** Rental statuses that occupy a car for their date range. */
export const BLOCKING_RENTAL_STATUSES = ['Pending', 'Confirmed', 'Active'];

type Db = Prisma.TransactionClient | typeof prisma;

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
            status: { in: BLOCKING_RENTAL_STATUSES },
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
