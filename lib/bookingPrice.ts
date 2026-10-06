/**
 * Booking price calculation shared by the checkout UI and createBooking, so the
 * customer sees exactly what the server charges. No database access here.
 */

export interface PriceOption {
    id: number;
    name: string;
    price: number;
    type: string | null;
    isPerDay: boolean;
    maxPrice: number | null;
    maxDays: number | null;
    isMandatory: boolean;
    carId?: number | null;
    description?: string | null;
}

export interface CouponTerms {
    discountType: string; // 'PERCENTAGE' | 'FIXED'
    discountValue: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function optionCost(opt: PriceOption, days: number): number {
    const chargedDays = opt.maxDays ? Math.min(days, opt.maxDays) : days;
    let cost = opt.isPerDay ? opt.price * chargedDays : opt.price;
    if (opt.maxPrice != null) cost = Math.min(cost, opt.maxPrice);
    return round2(cost);
}

/** "Mehrkilometer 500 Paket" → 500 */
export function packageKm(opt: PriceOption): number {
    // "Mehrkilometer 500 Paket" contains no "km" — match the word too.
    if (opt.type !== 'package' || !/km|kilometer/i.test(opt.name)) return 0;
    const match = opt.name.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
}

/**
 * The options a car can be booked with: active templates (carId null) plus the
 * car's own options, a car-specific option replacing a template of the same name.
 */
export function bookableOptions<T extends PriceOption>(all: T[], carId: number): T[] {
    const byName = new Map<string, T>();
    all.filter((o) => o.carId == null).forEach((o) => byName.set(o.name, o));
    all.filter((o) => o.carId === carId).forEach((o) => byName.set(o.name, o));
    return [...byName.values()];
}

/** Mandatory options are always included; unknown ids are ignored. */
export function resolveSelection<T extends PriceOption>(bookable: T[], requestedIds: number[]): T[] {
    const requested = new Set(requestedIds);
    return bookable.filter((o) => o.isMandatory || requested.has(o.id));
}

export function couponDiscount(coupon: CouponTerms | null, baseTotal: number): number {
    if (!coupon) return 0;
    const discount = coupon.discountType === 'PERCENTAGE'
        ? baseTotal * (coupon.discountValue / 100)
        : Math.min(coupon.discountValue, baseTotal);
    return round2(Math.max(0, discount));
}

export function quoteBooking(
    car: { dailyRate: number; maxMileagePerDay: number | null },
    selected: PriceOption[],
    days: number,
    coupon: CouponTerms | null = null,
) {
    const rent = round2(car.dailyRate * days);
    let extrasCost = 0;
    let insuranceCost = 0;
    let insuranceName = 'Basis';
    let addedKm = 0;

    const lines = selected.map((opt) => {
        const cost = optionCost(opt, days);
        if (opt.type === 'insurance') {
            insuranceCost += cost;
            insuranceName = opt.name;
        } else {
            extrasCost += cost;
        }
        addedKm += packageKm(opt);
        return { option: opt, cost };
    });

    const baseTotal = round2(rent + extrasCost + insuranceCost);
    const discount = couponDiscount(coupon, baseTotal);

    return {
        days,
        rent,
        lines,
        extrasCost: round2(extrasCost),
        insuranceCost: round2(insuranceCost),
        insuranceName,
        includedKm: (car.maxMileagePerDay || 0) * days + addedKm,
        baseTotal,
        discount,
        total: round2(Math.max(0, baseTotal - discount)),
    };
}
