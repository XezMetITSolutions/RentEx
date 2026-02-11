import prisma from '@/lib/prisma';
import { FleetManager } from '@/components/admin/FleetManager';

export const dynamic = 'force-dynamic';

async function getCars() {
    const cars = await prisma.car.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            currentLocation: true,
            homeLocation: true
        }
    });

    return cars.map(car => ({
        ...car,
        dailyRate: car.dailyRate ? Number(car.dailyRate) : null,
        weeklyRate: car.weeklyRate ? Number(car.weeklyRate) : null,
        monthlyRate: car.monthlyRate ? Number(car.monthlyRate) : null,
        depositAmount: car.depositAmount ? Number(car.depositAmount) : null,
        purchasePrice: car.purchasePrice ? Number(car.purchasePrice) : null,
        currentValue: car.currentValue ? Number(car.currentValue) : null,
        promoPrice: car.promoPrice ? Number(car.promoPrice) : null,
    }));
}

export default async function FleetPage() {
    const cars = await getCars();

    return (
        <FleetManager initialCars={cars} />
    );
}
