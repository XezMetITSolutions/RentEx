import prisma from './prisma';

/**
 * Options a customer can book for a car: active generic templates plus the
 * car's own options, de-duplicated by name (car-specific wins). Prices are
 * plain numbers so the result can go straight to a client component or JSON.
 */
export async function getBookableOptions(carId: number) {
    const rawOptions = await prisma.option.findMany({
        where: { status: 'active', OR: [{ carId: null }, { carId }] },
    });

    const byName = new Map<string, (typeof rawOptions)[number]>();
    rawOptions.filter(o => o.carId === null).forEach(o => byName.set(o.name, o));
    rawOptions.filter(o => o.carId === carId).forEach(o => byName.set(o.name, o));

    return Array.from(byName.values()).map(opt => ({
        id: opt.id,
        name: opt.name,
        description: opt.description,
        type: opt.type,
        price: Number(opt.price),
        isPerDay: opt.isPerDay,
    }));
}
