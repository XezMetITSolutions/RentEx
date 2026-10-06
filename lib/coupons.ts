import prisma from './prisma';

export type CouponLookup =
    | { ok: true; id: number; code: string; discountType: string; discountValue: number }
    | { ok: false; error: string };

/** Checks a coupon code without claiming it. The claim happens atomically at booking time. */
export async function findUsableCoupon(rawCode: string, now = new Date()): Promise<CouponLookup> {
    const code = rawCode.trim().toUpperCase();
    if (!code) return { ok: false, error: 'Bitte einen Gutscheincode eingeben.' };

    const coupon = await prisma.discountCoupon.findFirst({ where: { code, isActive: true } });
    if (!coupon) return { ok: false, error: 'Dieser Gutscheincode ist ungültig.' };
    if (coupon.validFrom && now < new Date(coupon.validFrom)) return { ok: false, error: 'Dieser Gutschein ist noch nicht gültig.' };
    if (coupon.validUntil && now > new Date(coupon.validUntil)) return { ok: false, error: 'Dieser Gutschein ist abgelaufen.' };
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
        return { ok: false, error: 'Dieser Gutschein ist bereits aufgebraucht.' };
    }

    return {
        ok: true,
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
    };
}
