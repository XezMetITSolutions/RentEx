import prisma from '@/lib/prisma';
import FahrtenbuchClientView from '@/components/admin/FahrtenbuchClientView';

export const dynamic = 'force-dynamic';

async function getCarsWithEntries() {
    const cars = await prisma.car.findMany({
        where: { isActive: true },
        orderBy: [{ brand: 'asc' }, { model: 'asc' }],
        include: {
            fahrtenbuchEntries: {
                orderBy: { datum: 'desc' },
                take: 100,
            },
        },
    });

    return cars.map((car) => {
        const latestEndKm = car.fahrtenbuchEntries[0]?.endKm ?? car.currentMileage ?? 0;
        return {
            id: car.id,
            brand: car.brand,
            model: car.model,
            plate: car.plate,
            currentMileage: car.currentMileage,
            latestEndKm,
            entries: car.fahrtenbuchEntries.map((e) => ({
                id: e.id,
                datum: e.datum.toISOString(),
                startKm: e.startKm,
                endKm: e.endKm,
                zweck: e.zweck,
                fahrtzweck: e.fahrtzweck,
                carId: e.carId,
            })),
        };
    });
}

export default async function FahrtenbuchPage() {
    const cars = await getCarsWithEntries();

    return <FahrtenbuchClientView cars={cars} />;
}
