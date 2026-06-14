import prisma from '@/lib/prisma';
import { startOfMonth, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/adminAuth';
import DashboardOverviewPanel from '@/components/admin/DashboardOverviewPanel';

export const dynamic = 'force-dynamic';

async function getStats(locationId?: number | null) {
    const where: any = {};
    if (locationId) {
        where.pickupLocationId = locationId;
    }

    const totalRevenueResult = await prisma.rental.aggregate({
        _sum: { totalAmount: true },
        where: {
            ...where,
            status: { in: ['Active', 'Completed', 'Pending'] }
        }
    });
    const totalRevenue = Number(totalRevenueResult._sum.totalAmount || 0);

    const activeRentalsCount = await prisma.rental.count({
        where: { 
            ...where,
            status: { in: ['Active', 'Pending'] } 
        }
    });

    const startOfCurrentMonth = startOfMonth(new Date());
    const newCustomersCount = await prisma.customer.count({
        where: { 
            createdAt: { gte: startOfCurrentMonth },
            ...(locationId ? { rentals: { some: { pickupLocationId: locationId } } } : {})
        }
    });

    const pendingReservationsCount = await prisma.rental.count({ 
        where: { 
            ...where,
            status: 'Pending' 
        } 
    });

    return [
        {
            name: 'Gesamteinnahmen',
            value: new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(totalRevenue),
            change: 'Gesamtumsatz',
            trend: 'neutral',
            icon: 'Wallet',
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50',
        },
        {
            name: 'Aktive Vermietungen',
            value: activeRentalsCount.toString(),
            change: 'Derzeit im Einsatz',
            trend: 'neutral',
            icon: 'Car',
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50',
        },
        {
            name: 'Neue Kunden',
            value: newCustomersCount.toString(),
            change: 'Diesen Monat',
            trend: 'up',
            icon: 'Users',
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50',
        },
        {
            name: 'Offene Reservierungen',
            value: pendingReservationsCount.toString(),
            change: 'Warten auf Bearbeitung',
            trend: 'down',
            icon: 'CalendarClock',
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50',
        },
    ];
}

async function getRecentRentals(locationId?: number | null) {
    const where: any = {};
    if (locationId) {
        where.pickupLocationId = locationId;
    }

    const rentals = await prisma.rental.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            car: true,
            customer: true
        }
    });
    
    return rentals.map(rental => ({
        id: rental.id,
        status: rental.status,
        totalAmount: Number(rental.totalAmount),
        car: {
            brand: rental.car.brand,
            model: rental.car.model,
            plate: rental.car.plate,
        },
        customer: {
            firstName: rental.customer.firstName,
            lastName: rental.customer.lastName,
        }
    }));
}

async function getRevenueData(locationId?: number | null) {
    const activeRentals = await prisma.rental.findMany({
        where: {
            status: { in: ['Active', 'Completed', 'Pending'] },
            ...(locationId ? { pickupLocationId: locationId } : {})
        },
        select: {
            startDate: true,
            totalAmount: true
        }
    });

    const monthlyRevenue: { [key: string]: number } = {};
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthName = format(d, 'MMM', { locale: de });
        monthlyRevenue[monthName] = 0;
    }

    activeRentals.forEach(r => {
        const monthName = format(r.startDate, 'MMM', { locale: de });
        if (monthlyRevenue[monthName] !== undefined) {
            monthlyRevenue[monthName] += Number(r.totalAmount || 0);
        }
    });

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue
    }));
}

async function getCategoryData(locationId?: number | null) {
    const categoryRentals = await prisma.rental.findMany({
        where: {
            status: { in: ['Active', 'Completed', 'Pending'] },
            ...(locationId ? { pickupLocationId: locationId } : {})
        },
        select: {
            car: {
                select: {
                    category: true
                }
            }
        }
    });

    const categoryCounts: { [key: string]: number } = {};
    categoryRentals.forEach(r => {
        const cat = r.car?.category || 'Sonstige';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];
    
    if (Object.keys(categoryCounts).length === 0) {
        return [
            { name: 'Kleinwagen', value: 0, color: '#3B82F6' },
            { name: 'Mittelklasse', value: 0, color: '#10B981' },
            { name: 'SUV', value: 0, color: '#F59E0B' }
        ];
    }

    return Object.entries(categoryCounts).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
    }));
}

async function getLocationData(locationId?: number | null) {
    const locationRentals = await prisma.rental.findMany({
        where: {
            status: { in: ['Active', 'Completed', 'Pending'] },
            ...(locationId ? { pickupLocationId: locationId } : {})
        },
        select: {
            pickupLocation: {
                select: {
                    name: true
                }
            }
        }
    });

    const locationCounts: { [key: string]: number } = {};
    locationRentals.forEach(r => {
        const locName = r.pickupLocation?.name || 'Unbekannt';
        locationCounts[locName] = (locationCounts[locName] || 0) + 1;
    });

    if (Object.keys(locationCounts).length === 0) {
        const locations = await prisma.location.findMany({ select: { name: true } });
        locations.forEach(loc => {
            locationCounts[loc.name] = 0;
        });
    }

    return Object.entries(locationCounts).map(([location, rentals]) => ({
        location,
        rentals
    }));
}

export default async function AdminDashboard() {
    const staff = await getAdminSession();
    
    if (!staff) {
        redirect('/admin/login');
        return null;
    }

    const isRestricted = staff && staff.role !== 'ADMINISTRATOR';
    const locId = isRestricted ? staff?.locationId : undefined;

    const [stats, recentRentals, revenueData, categoryData, locationData] = await Promise.all([
        getStats(locId),
        getRecentRentals(locId),
        getRevenueData(locId),
        getCategoryData(locId),
        getLocationData(locId)
    ]);

    const currentDateStr = format(new Date(), 'dd. MMMM yyyy', { locale: de });

    return (
        <DashboardOverviewPanel 
            staff={staff}
            stats={stats}
            recentRentals={recentRentals}
            revenueData={revenueData}
            categoryData={categoryData}
            locationData={locationData}
            currentDateStr={currentDateStr}
        />
    );
}
