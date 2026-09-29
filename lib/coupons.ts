import prisma from './prisma';

export type AppliedCoupon = {
    couponId: number;
    code: string;
    discountAmount: number;
};

/** Discount reasons are stored as "Gutschein <CODE>" on the rental. */
export const COUPON_REASON_PREFIX = 'Gutschein ';

/**
 * Looks up an active, currently valid coupon with remaining uses and computes
 * its discount on `baseTotal`. Returns null when the code cannot be applied.
 * This is a read-only check; the usage is claimed atomically at booking time.
 */
export async function evaluateCoupon(rawCode: string | null | undefined, baseTotal: number): Promise<AppliedCoupon | null> {
    const code = rawCode?.trim().toUpperCase();
    if (!code) return null;

    const coupon = await prisma.discountCoupon.findFirst({
        where: { code, isActive: true }
    });
    if (!coupon) return null;

    const now = new Date();
    if (coupon.validFrom && now < new Date(coupon.validFrom)) return null;
    if (coupon.validUntil && now > new Date(coupon.validUntil)) return null;
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return null;

    const discountAmount = coupon.discountType === 'PERCENTAGE'
        ? baseTotal * (Number(coupon.discountValue) / 100)
        : Number(coupon.discountValue);

    return {
        couponId: coupon.id,
        code: coupon.code,
        discountAmount: Math.round(Math.min(Math.max(discountAmount, 0), baseTotal) * 100) / 100,
    };
}
