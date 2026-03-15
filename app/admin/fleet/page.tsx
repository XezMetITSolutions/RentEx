import prisma from '@/lib/prisma';
import { FleetManager } from '@/components/admin/FleetManager';
import { getAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

async function getCars(locationId?: number | null) {
    const where: any = {};
    if (locationId) {
        where.locationId = locationId;
    }

    const cars = await prisma.car.findMany({
        where,
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
    const staff = await getAdminSession();
    // ADMINISTRATOR sees everything. Others only see their location.
    const isRestricted = staff && staff.role !== 'ADMINISTRATOR';
    const cars = await getCars(isRestricted ? staff?.locationId : undefined);

    return (
        <FleetManager initialCars={cars} />
    );
}
