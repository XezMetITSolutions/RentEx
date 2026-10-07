import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import { PENDING_PAYMENT_TTL_MINUTES, RENTAL_TERMS } from './config';
import { releaseCouponUse } from './coupons';
import { sendRentalMail } from './rentalMail';

/** Rental statuses that occupy a car for their date range. */
export const BLOCKING_RENTAL_STATUSES = ['Pending', 'Confirmed', 'Active'];

/** A car can be reserved for a free date range while it is out on another rental. */
export const BOOKABLE_CAR_STATUSES = ['Active', 'Rented'];

export function isBookableCar(car: { status: string; isActive: boolean } | null): boolean {
    return !!car && car.isActive && BOOKABLE_CAR_STATUSES.includes(car.status);
}

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

const TURNAROUND_MS = RENTAL_TERMS.TURNAROUND_HOURS * 60 * 60 * 1000;

/**
 * A rental occupies the car for its dates plus a turnaround gap.
 * An Active rental whose planned end has passed and that was never returned
 * occupies the car until somebody actually checks it back in — otherwise the
 * next customer is handed a car that is still out.
 */
export function overlapWhere(start: Date, end: Date, now = new Date()): Prisma.RentalWhereInput {
    const windowStart = new Date(start.getTime() - TURNAROUND_MS);
    const windowEnd = new Date(end.getTime() + TURNAROUND_MS);
    return {
        AND: [
            blockingRentalWhere(now),
            {
                OR: [
                    { startDate: { lte: windowEnd }, endDate: { gte: windowStart } },
                    { status: 'Active', actualReturnDate: null, endDate: { lt: now } },
                ],
            },
        ],
    };
}

export const CAR_BUSY_MESSAGE =
    'Das Fahrzeug ist in diesem Zeitraum bereits gebucht oder noch nicht zurück. Zwischen zwei Mieten brauchen wir zwei Stunden.';

/**
 * Dates the public calendar should paint as busy.
 * An Active rental that was never returned blocks every future day, because
 * the car is still out even though its planned end is in the past.
 */
export function calendarBlocks(
    rentals: { startDate: Date; endDate: Date; status: string; actualReturnDate: Date | null }[],
    now = new Date(),
): { startDate: Date; endDate: Date }[] {
    const horizon = new Date(now.getTime() + RENTAL_TERMS.MAX_RENTAL_DAYS * 24 * 60 * 60 * 1000);
    return rentals.map((rental) => ({
        startDate: rental.startDate,
        endDate:
            rental.status === 'Active' && rental.actualReturnDate == null && rental.endDate < now
                ? horizon
                : rental.endDate,
    }));
}

/** Returns true when no blocking rental of `carId` overlaps [start, end]. */
export async function isCarAvailable(
    carId: number,
    start: Date,
    end: Date,
    db: Db = prisma
): Promise<boolean> {
    const conflicts = await db.rental.count({
        where: { carId, ...overlapWhere(start, end) },
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
    const stale = await db.rental.findMany({
        where: staleUnpaidOnline(),
        select: { id: true, discountReason: true, stripeSessionId: true },
    });
    for (const rental of stale) {
        const released = await db.rental.updateMany({
            where: { id: rental.id, ...UNPAID_ONLINE },
            data: {
                status: 'Cancelled',
                notes: `Automatisch storniert: Online-Zahlung nicht innerhalb von ${PENDING_PAYMENT_TTL_MINUTES} Minuten abgeschlossen.`,
            },
        });
        if (released.count > 0) {
            await releaseCouponUse(rental.discountReason);
            // Without a Stripe session the customer saw the error on the spot; nothing to remind about.
            if (rental.stripeSessionId) await sendRentalMail(rental.id, { type: 'paymentExpired' });
        }
    }
    return stale.length;
}

/** Releases unpaid reservations whose pickup time passed and nobody collected the car. */
export async function cancelNoShowRentals(): Promise<number> {
    const cutoff = new Date(Date.now() - RENTAL_TERMS.NO_SHOW_GRACE_HOURS * 60 * 60 * 1000);
    const stale = await prisma.rental.findMany({
        where: {
            status: 'Pending',
            paymentStatus: { notIn: ['Paid', 'Refunded'] },
            startDate: { lt: cutoff },
        },
        select: { id: true, discountReason: true },
    });
    for (const rental of stale) {
        const released = await prisma.rental.updateMany({
            where: { id: rental.id, status: 'Pending' },
            data: {
                status: 'Cancelled',
                notes: 'Automatisch storniert: Fahrzeug nicht abgeholt.',
            },
        });
        if (released.count > 0) {
            await releaseCouponUse(rental.discountReason);
            await sendRentalMail(rental.id, { type: 'cancelled', by: 'noShow' });
        }
    }
    return stale.length;
}

/**
 * Paid reservations nobody collected are closed once their window is over,
 * without a refund: the car becomes bookable again and the charge stands.
 * Active rentals past their end are flagged so the car stays blocked until return.
 */
export async function closeLapsedRentals(): Promise<{ noShows: number; overdue: number }> {
    const now = new Date();
    const lapsed = await prisma.rental.findMany({
        where: {
            status: { in: ['Confirmed', 'Pending'] },
            paymentStatus: 'Paid',
            checkInAt: null,
            endDate: { lt: now },
        },
        select: { id: true, notes: true },
    });
    let noShows = 0;
    for (const rental of lapsed) {
        const updated = await prisma.rental.updateMany({
            where: { id: rental.id, status: { in: ['Confirmed', 'Pending'] }, checkInAt: null },
            data: {
                status: 'NoShow',
                notes: `${rental.notes ? rental.notes + '\n' : ''}Nicht übernommen: das Abholfenster ist abgelaufen. Der Mietpreis bleibt fällig.`,
            },
        });
        noShows += updated.count;
    }
    const overdue = await prisma.rental.updateMany({
        where: { status: 'Active', endDate: { lt: now }, isOverdue: false },
        data: { isOverdue: true },
    });
    return { noShows, overdue: overdue.count };
}
