/**
 * Booking price calculation shared by the checkout UI, the fleet widget,
 * createBooking, the mobile API and the admin counter, so every surface
 * charges the same amount. No database access here.
 */
import { formatInTimeZone } from 'date-fns-tz';
import { BUSINESS } from './config';

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

const num = (v: unknown): number | null => {
    if (v == null || v === '') return null;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
};

function viennaDay(value: Date | string): string {
    return formatInTimeZone(new Date(value), BUSINESS.TIME_ZONE, 'yyyy-MM-dd');
}

export interface CarRates {
    dailyRate: unknown;
    maxMileagePerDay?: number | null;
    weeklyRate?: unknown;
    monthlyRate?: unknown;
    longTermRate?: unknown;
    minDaysForLongTerm?: number | null;
    promoPrice?: unknown;
    promoStartDate?: Date | string | null;
    promoEndDate?: Date | string | null;
}

/** Promo replaces the daily rate on the pickup day. Week and month prices stay as entered. */
export function effectiveDailyRate(car: CarRates, pickup: Date = new Date()): number {
    const daily = num(car.dailyRate) ?? 0;
    const promo = num(car.promoPrice);
    if (promo == null || promo <= 0) return daily;
    const day = viennaDay(pickup);
    if (car.promoStartDate && day < viennaDay(car.promoStartDate)) return daily;
    if (car.promoEndDate && day > viennaDay(car.promoEndDate)) return daily;
    return promo;
}

/**
 * Rent for `days` chargeable days.
 * Wochenpreis / Monatspreis are block prices (7 / 30 days). Langzeitpreis is a
 * daily rate and is used only when it is a discount against the normal day rate.
 * The cheaper combination wins, so a missing or higher block price never raises the bill.
 */
export function rentAmount(car: CarRates, days: number, pickup: Date = new Date()): { rent: number; rateNote: string } {
    const listDaily = num(car.dailyRate) ?? 0;
    const daily = effectiveDailyRate(car, pickup);
    const weekly = num(car.weeklyRate);
    const monthly = num(car.monthlyRate);
    const longTerm = num(car.longTermRate);
    const minLong = car.minDaysForLongTerm && car.minDaysForLongTerm > 0 ? car.minDaysForLongTerm : 30;
    const unit = longTerm != null && longTerm > 0 && longTerm < listDaily && days >= minLong ? longTerm : daily;

    const withWeeks = (n: number) => {
        if (weekly != null && weekly > 0 && n >= 7) {
            const w = Math.floor(n / 7);
            return w * weekly + (n % 7) * unit;
        }
        return n * unit;
    };

    let rent = days * unit;
    let rateNote = unit !== daily ? 'Langzeitpreis' : daily !== listDaily ? 'Aktionspreis' : 'Tagespreis';

    if (weekly != null && weekly > 0 && days >= 7) {
        const alt = withWeeks(days);
        if (alt < rent) {
            rent = alt;
            rateNote = 'Wochenpreis';
        }
    }
    if (monthly != null && monthly > 0 && days >= 30) {
        const months = Math.floor(days / 30);
        const rem = days % 30;
        const alt = months * monthly + (rem > 0 ? withWeeks(rem) : 0);
        if (alt < rent) {
            rent = alt;
            rateNote = 'Monatspreis';
        }
    }

    return { rent: round2(Math.max(0, rent)), rateNote };
}

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

/**
 * Mandatory options are always included; unknown ids are ignored.
 * Only one insurance is kept: the last one the customer chose, otherwise the mandatory cover.
 */
export function resolveSelection<T extends PriceOption>(bookable: T[], requestedIds: number[]): T[] {
    const requested = new Set(requestedIds);
    const picked = bookable.filter((o) => o.isMandatory || requested.has(o.id));
    const insurances = picked.filter((o) => o.type === 'insurance');
    if (insurances.length <= 1) return picked;
    const chosen = [...requestedIds].reverse()
        .map((id) => insurances.find((o) => o.id === id))
        .find((o): o is T => !!o);
    const keep = chosen ?? insurances.find((o) => o.isMandatory) ?? insurances[insurances.length - 1];
    return picked.filter((o) => o.type !== 'insurance' || o.id === keep.id);
}

export function couponDiscount(coupon: CouponTerms | null, baseTotal: number): number {
    if (!coupon) return 0;
    const discount = coupon.discountType === 'PERCENTAGE'
        ? baseTotal * (coupon.discountValue / 100)
        : Math.min(coupon.discountValue, baseTotal);
    return round2(Math.max(0, discount));
}

export function quoteBooking(
    car: CarRates,
    selected: PriceOption[],
    days: number,
    coupon: CouponTerms | null = null,
    pickup: Date = new Date(),
) {
    const { rent, rateNote } = rentAmount(car, days, pickup);
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
        rateNote,
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
