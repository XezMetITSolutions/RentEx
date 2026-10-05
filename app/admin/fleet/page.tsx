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
        extraKmCost: car.extraKmCost ? Number(car.extraKmCost) : null,
        nextInspection: car.nextInspection ? car.nextInspection.toISOString() : null,
        registrationDate: car.registrationDate ? car.registrationDate.toISOString() : null,
        insuranceValidUntil: car.insuranceValidUntil ? car.insuranceValidUntil.toISOString() : null,
        vignetteValidUntil: car.vignetteValidUntil ? car.vignetteValidUntil.toISOString() : null,
        lastOilChange: car.lastOilChange ? car.lastOilChange.toISOString() : null,
        nextOilChange: car.nextOilChange ? car.nextOilChange.toISOString() : null,
        lastTireChange: car.lastTireChange ? car.lastTireChange.toISOString() : null,
        nextServiceDate: car.nextServiceDate ? car.nextServiceDate.toISOString() : null,
        lastServiceDate: car.lastServiceDate ? car.lastServiceDate.toISOString() : null,
        promoStartDate: car.promoStartDate ? car.promoStartDate.toISOString() : null,
        promoEndDate: car.promoEndDate ? car.promoEndDate.toISOString() : null,
        createdAt: car.createdAt.toISOString(),
        updatedAt: car.updatedAt.toISOString(),
    }));
}

export default async function FleetPage(props: {
    searchParams?: Promise<{ location?: string }>;
}) {
    const searchParams = props.searchParams ? await props.searchParams : undefined;
    const staff = await getAdminSession();
    // ADMINISTRATOR / SUPERADMIN sees everything. Others only see their location.
    const isRestricted = staff && staff.role !== 'ADMINISTRATOR' && staff.role !== 'SUPERADMIN';
    const cars = await getCars(isRestricted ? staff?.locationId : undefined);
    
    const globalCategories = await prisma.carCategory.findMany({
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true }
    });

    return (
        <FleetManager
            initialCars={cars as any}
            globalCategories={globalCategories}
            initialLocation={searchParams?.location}
        />
    );
}
