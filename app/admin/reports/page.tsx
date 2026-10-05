import prisma from '@/lib/prisma';
import ReportsView from '@/components/admin/ReportsView';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    // 1. Car Stats
    const cars = await prisma.car.findMany({
        select: { id: true, status: true, brand: true, model: true, plate: true }
    });

    const carStats = {
        total: cars.length,
        active: cars.filter(c => c.status === 'Active').length,
        rented: cars.filter(c => c.status === 'Rented').length,
        maintenance: cars.filter(c => c.status === 'Maintenance').length
    };

    // 2. Upcoming Maintenance (Next 60 days or future)
    const upcomingMaintenance = await prisma.maintenanceRecord.findMany({
        where: { nextDueDate: { gte: new Date() } },
        take: 6,
        include: { car: { select: { id: true, brand: true, model: true, plate: true } } },
        orderBy: { nextDueDate: 'asc' }
    });

    // 3. Recent Rentals
    const recentRentals = await prisma.rental.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
            car: { select: { id: true, brand: true, model: true, plate: true } },
            customer: { select: { firstName: true, lastName: true, email: true } }
        }
    });

    // 4. Popular Cars
    const popularRaw = await prisma.rental.groupBy({
        by: ['carId'],
        _count: { carId: true },
        orderBy: { _count: { carId: 'desc' } },
        take: 6
    });

    const popularCars = [];
    for (const item of popularRaw) {
        const car = await prisma.car.findUnique({
            where: { id: item.carId },
            select: { id: true, brand: true, model: true, plate: true }
        });
        if (car) {
            popularCars.push({
                id: car.id,
                name: `${car.brand} ${car.model}`,
                plate: car.plate,
                count: item._count.carId
            });
        }
    }

    // Serialize for Client Component
    const data = {
        carStats,
        upcomingMaintenance: upcomingMaintenance.map(m => ({
            id: m.id,
            carId: m.carId,
            maintenanceType: m.maintenanceType,
            description: m.description,
            nextDueDate: m.nextDueDate ? m.nextDueDate.toISOString() : null,
            car: m.car
        })),
        recentRentals: recentRentals.map(r => ({
            id: r.id,
            contractNumber: r.contractNumber || String(r.id),
            startDate: r.startDate.toISOString(),
            endDate: r.endDate.toISOString(),
            status: r.status,
            totalAmount: Number(r.totalAmount || 0),
            car: r.car,
            customer: r.customer
        })),
        popularCars
    };

    return <ReportsView data={data} />;
}
