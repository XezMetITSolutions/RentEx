'use server';

import prisma from '@/lib/prisma';
import { isCarAvailable } from '@/lib/availability';
import { calculateChargeableDays, parseBookingDateTime } from '@/lib/bookingUtils';
import { evaluateCoupon } from '@/lib/coupons';
import { priceRental } from '@/lib/pricing';

/** Live availability check for the booking forms (same rules as createBooking). */
export async function checkCarAvailability(
    carId: number,
    startDate: string,
    pickupTime: string,
    endDate: string,
    returnTime: string
): Promise<boolean> {
    const start = parseBookingDateTime(startDate, pickupTime);
    const end = parseBookingDateTime(endDate, returnTime);
    if (!Number.isInteger(carId) || !start || !end || end <= start) return false;
    try {
        return await isCarAvailable(carId, start, end);
    } catch (err) {
        console.error('Error checking availability:', err);
        return false; // Fail safe
    }
}

export type CouponPreview =
    | { valid: true; code: string; discountAmount: number }
    | { valid: false };

/**
 * Previews a coupon for the booking forms. The discount is computed on the
 * server-side price (car + selected options), exactly like createBooking.
 */
export async function previewCoupon(
    code: string,
    carId: number,
    startDate: string,
    pickupTime: string,
    endDate: string,
    returnTime: string,
    optionIds: number[]
): Promise<CouponPreview> {
    const car = await prisma.car.findUnique({ where: { id: carId }, select: { dailyRate: true } });
    if (!car) return { valid: false };

    const days = calculateChargeableDays(startDate, pickupTime, endDate, returnTime);
    const options = await prisma.option.findMany({
        where: { id: { in: optionIds.filter(Number.isInteger) }, status: 'active', OR: [{ carId: null }, { carId }] },
    });
    const { baseTotal } = priceRental(car, options, days);

    const coupon = await evaluateCoupon(code, baseTotal);
    return coupon ? { valid: true, code: coupon.code, discountAmount: coupon.discountAmount } : { valid: false };
}
