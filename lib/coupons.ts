import prisma from './prisma';

export type CouponLookup =
    | {
        ok: true;
        id: number;
        code: string;
        discountType: string;
        discountValue: number;
        minOrderAmount: number | null;
        customerId: number | null;
        isPersonal: boolean;
    }
    | { ok: false; error: string };

export interface CouponContext {
    now?: Date;
    /** Signed-in customer, when the coupon is personal. */
    customerId?: number | null;
    /** Rent total before the coupon. Checked when the coupon has a minimum. */
    orderAmount?: number | null;
}

/** Checks a coupon code without claiming it. The claim happens atomically at booking time. */
export async function findUsableCoupon(rawCode: string, ctx: CouponContext = {}): Promise<CouponLookup> {
    const code = rawCode.trim().toUpperCase();
    if (!code) return { ok: false, error: 'Bitte einen Gutscheincode eingeben.' };

    const now = ctx.now ?? new Date();
    const coupon = await prisma.discountCoupon.findFirst({ where: { code, isActive: true } });
    if (!coupon) return { ok: false, error: 'Dieser Gutscheincode ist ungültig.' };
    if (coupon.validFrom && now < new Date(coupon.validFrom)) return { ok: false, error: 'Dieser Gutschein ist noch nicht gültig.' };
    if (coupon.validUntil && now > new Date(coupon.validUntil)) return { ok: false, error: 'Dieser Gutschein ist abgelaufen.' };
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
        return { ok: false, error: 'Dieser Gutschein ist bereits aufgebraucht.' };
    }
    if (coupon.isPersonal && coupon.customerId != null && coupon.customerId !== ctx.customerId) {
        return {
            ok: false,
            error: ctx.customerId
                ? 'Dieser Gutschein gehört zu einem anderen Kundenkonto.'
                : 'Dieser Gutschein ist einem Kundenkonto zugeordnet. Bitte melden Sie sich an.',
        };
    }
    const minOrder = coupon.minOrderAmount != null ? Number(coupon.minOrderAmount) : null;
    if (minOrder != null && ctx.orderAmount != null && ctx.orderAmount < minOrder) {
        return { ok: false, error: `Dieser Gutschein gilt ab einem Mietpreis von €${minOrder.toFixed(2)}.` };
    }

    return {
        ok: true,
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        minOrderAmount: minOrder,
        customerId: coupon.customerId,
        isPersonal: coupon.isPersonal,
    };
}

/** Gives a claimed use back when the booking is cancelled before it is consumed. */
export async function releaseCouponUse(discountReason: string | null | undefined): Promise<void> {
    const code = discountReason?.match(/^Gutschein\s+(\S+)/)?.[1];
    if (!code) return;
    await prisma.discountCoupon.updateMany({
        where: { code, usedCount: { gt: 0 } },
        data: { usedCount: { decrement: 1 } },
    });
}
