import type { Prisma } from '@prisma/client';

type PricedCar = { dailyRate: Prisma.Decimal | number; maxMileagePerDay?: number | null };
type PricedOption = { name: string; type: string | null; price: Prisma.Decimal | number; isPerDay: boolean };

export type RentalPrice = {
    baseTotal: number;
    extrasCost: number;
    insuranceCost: number;
    insuranceType: string;
    includedKm: number;
};

/**
 * Prices a rental from the car's daily rate and the selected options.
 * Single source of truth for customer bookings, coupon previews and admin
 * reservations, so all of them charge the same amount.
 */
export function priceRental(car: PricedCar, options: PricedOption[], days: number): RentalPrice {
    let extrasCost = 0;
    let insuranceCost = 0;
    let insuranceType = 'Basis';
    let addedKm = 0;

    for (const opt of options) {
        const cost = opt.isPerDay ? Number(opt.price) * days : Number(opt.price);
        if (opt.type === 'insurance') {
            insuranceCost += cost;
            insuranceType = opt.name;
        } else {
            extrasCost += cost;
            // Parse KM from package name if it's a KM package
            if (opt.type === 'package' && opt.name.toLowerCase().includes('km')) {
                const match = opt.name.match(/(\d+)/);
                if (match) addedKm += parseInt(match[0], 10);
            }
        }
    }

    return {
        baseTotal: Number(car.dailyRate) * days + extrasCost + insuranceCost,
        extrasCost,
        insuranceCost,
        insuranceType,
        includedKm: Number(car.maxMileagePerDay || 0) * days + addedKm,
    };
}
