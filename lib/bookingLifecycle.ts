import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import { stripe } from './stripe';
import { COUPON_REASON_PREFIX } from './coupons';
import { emailTemplates, sendEmail } from './notificationTemplates';

/**
 * Cancels a pending, unpaid online booking (abandoned or failed Stripe
 * checkout) so it no longer blocks the car, and gives back its coupon use.
 * No-op for bookings that were paid or already moved past Pending.
 * Returns true when the booking was cancelled by this call.
 */
export async function cancelUnpaidOnlineBooking(rentalId: number): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
        const cancelled = await tx.rental.updateMany({
            where: { id: rentalId, status: 'Pending', paymentMethod: 'Online', paymentStatus: { not: 'Paid' } },
            data: { status: 'Cancelled' },
        });
        if (cancelled.count === 0) return false;

        const rental = await tx.rental.findUnique({ where: { id: rentalId }, select: { discountReason: true } });
        await releaseCouponUse(tx, rental?.discountReason);
        return true;
    });
}

/** Gives back the coupon use recorded on a rental that is being cancelled. */
export async function releaseCouponUse(tx: Prisma.TransactionClient, discountReason: string | null | undefined): Promise<void> {
    const code = discountReason?.startsWith(COUPON_REASON_PREFIX)
        ? discountReason.slice(COUPON_REASON_PREFIX.length)
        : null;
    if (!code) return;
    await tx.discountCoupon.updateMany({
        where: { code, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
    });
}

/**
 * Cancels a rental that has not been completed: releases its coupon use and,
 * if it was handed over already, makes the car available again. Idempotent —
 * returns false when the rental was already cancelled or completed.
 */
export async function cancelRental(rentalId: number): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
        const rental = await tx.rental.findUnique({
            where: { id: rentalId },
            select: { status: true, carId: true, discountReason: true },
        });
        if (!rental) return false;

        const cancelled = await tx.rental.updateMany({
            where: { id: rentalId, status: { notIn: ['Cancelled', 'Completed'] } },
            data: { status: 'Cancelled' },
        });
        if (cancelled.count === 0) return false;

        await releaseCouponUse(tx, rental.discountReason);
        if (rental.status === 'Active') {
            await tx.car.update({ where: { id: rental.carId }, data: { status: 'Active' } });
        }
        return true;
    });
}

/**
 * Before a customer retries a booking, releases their own earlier unpaid online
 * attempts for the same car and period — otherwise their abandoned checkout
 * would block them with "already booked". The old Stripe session is expired
 * first so it can no longer be paid.
 */
export async function releaseOwnAbandonedAttempts(customerId: number, carId: number, start: Date, end: Date): Promise<void> {
    const attempts = await prisma.rental.findMany({
        where: {
            customerId,
            carId,
            status: 'Pending',
            paymentMethod: 'Online',
            paymentStatus: { not: 'Paid' },
            startDate: { lte: end },
            endDate: { gte: start },
        },
        select: { id: true, stripeSessionId: true },
    });

    for (const attempt of attempts) {
        if (attempt.stripeSessionId) {
            try {
                const session = await stripe.checkout.sessions.retrieve(attempt.stripeSessionId);
                // A completed session may be paid with the webhook still in flight — keep that booking.
                if (session.status === 'complete') continue;
                if (session.status === 'open') await stripe.checkout.sessions.expire(attempt.stripeSessionId);
            } catch (error) {
                console.error(`[booking] Could not expire Stripe session for rental ${attempt.id}:`, error);
                continue;
            }
        }
        await cancelUnpaidOnlineBooking(attempt.id);
    }
}

/**
 * Completes an active rental: records the return, frees the car and credits
 * unused included kilometres to the customer. Idempotent — a repeated call
 * (double click, app retry) returns false and credits nothing.
 */
export async function completeRental(
    rentalId: number,
    data: { returnMileage: number; fuelLevelReturn?: string | null; damageReport?: string | null; extraCharges?: number | null },
): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
        const rental = await tx.rental.findUnique({ where: { id: rentalId } });
        if (!rental) return false;

        const completed = await tx.rental.updateMany({
            where: { id: rentalId, status: 'Active' },
            data: {
                status: 'Completed',
                returnMileage: data.returnMileage,
                actualReturnDate: new Date(),
                fuelLevelReturn: data.fuelLevelReturn ?? undefined,
                damageReport: data.damageReport ?? undefined,
                extraCharges: data.extraCharges ?? undefined,
            },
        });
        if (completed.count === 0) return false;

        // Without a pickup reading the driven distance is unknown, so no credit.
        const usedKm = rental.pickupMileage != null ? data.returnMileage - Number(rental.pickupMileage) : null;
        const includedKm = Number(rental.includedKm || 0);
        const surplusKm = usedKm != null && usedKm >= 0 ? includedKm - usedKm : 0;

        if (surplusKm > 0) {
            await tx.kmBalance.upsert({
                where: { customerId: rental.customerId },
                update: { balance: { increment: surplusKm } },
                create: { customerId: rental.customerId, balance: surplusKm },
            });
            // Transfer record for tracking (system transfer)
            await tx.kmTransfer.create({
                data: {
                    fromId: rental.customerId,
                    toId: rental.customerId,
                    amount: surplusKm,
                    note: `Automatische Gutschrift aus Vertrag #${rental.contractNumber || rental.id} (${includedKm} paket - ${usedKm} used)`,
                },
            });
        }

        await tx.car.update({
            where: { id: rental.carId },
            data: { status: 'Active', currentMileage: data.returnMileage },
        });
        return true;
    });
}

/** Tells the customer that their booking was cancelled (best effort, never throws). */
export async function sendCancellationEmail(rentalId: number): Promise<void> {
    try {
        const rental = await prisma.rental.findUnique({ where: { id: rentalId }, include: { customer: true, car: true } });
        if (!rental?.customer || !rental.car || !rental.contractNumber) return;
        await sendEmail(rental.customer.email, emailTemplates.cancellationConfirmation({
            contractNumber: rental.contractNumber,
            customer: { firstName: rental.customer.firstName, lastName: rental.customer.lastName, email: rental.customer.email },
            car: { brand: rental.car.brand, model: rental.car.model, plate: rental.car.plate },
            rental: { startDate: rental.startDate, endDate: rental.endDate, totalAmount: Number(rental.totalAmount) },
        }));
    } catch (error) {
        console.error(`[cancel] Email for rental ${rentalId} failed:`, error);
    }
}
