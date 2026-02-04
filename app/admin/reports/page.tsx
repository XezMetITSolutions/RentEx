import prisma from '@/lib/prisma';
import ReportsView from '@/components/admin/ReportsView';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    // 1. Car Stats
    const cars = await prisma.car.findMany({
        select: { status: true }
    });

    const carStats = {
        total: cars.length,
        active: cars.filter(c => c.status === 'Active').length,
        rented: cars.filter(c => c.status === 'Rented').length,
        maintenance: cars.filter(c => c.status === 'Maintenance').length
    };

    // 2. Upcoming Maintenance (Next 30 days or future)
    const upcomingMaintenance = await prisma.maintenanceRecord.findMany({
        where: { nextDueDate: { gte: new Date() } },
        take: 5,
        include: { car: { select: { brand: true, model: true, plate: true } } },
        orderBy: { nextDueDate: 'asc' }
    });

    // 3. Recent Rentals
    const recentRentals = await prisma.rental.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            car: { select: { brand: true, model: true } },
            customer: { select: { firstName: true, lastName: true } }
        }
    });

    // 4. Popular Cars
    const popularRaw = await prisma.rental.groupBy({
        by: ['carId'],
        _count: { carId: true },
        orderBy: { _count: { carId: 'desc' } },
        take: 5
    });

    const popularCars = [];
    for (const item of popularRaw) {
        const car = await prisma.car.findUnique({
            where: { id: item.carId },
            select: { brand: true, model: true }
        });
        if (car) {
            popularCars.push({
                name: `${car.brand} ${car.model}`,
                count: item._count.carId
            });
        }
    }

    // Serialize dates for Client Component
    const data = {
        carStats,
        upcomingMaintenance: JSON.parse(JSON.stringify(upcomingMaintenance)),
        recentRentals: JSON.parse(JSON.stringify(recentRentals)),
        popularCars
    };

    return <ReportsView data={data} />;
}
