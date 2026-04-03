import { Users, Car, Wallet, ArrowUpRight, ArrowDownRight, CalendarClock, Activity, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import prisma from '@/lib/prisma';
import { formatDistanceToNow, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { de } from 'date-fns/locale';
import DashboardCharts from '@/components/admin/DashboardCharts';
import TodayOverview from '@/components/admin/TodayOverview';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

async function getStats(locationId?: number | null) {
    const where: any = {};
    if (locationId) {
        where.pickupLocationId = locationId;
    }

    // 1. Total Revenue (Confirmed rentals, excluding cancelled)
    const totalRevenueResult = await prisma.rental.aggregate({
        _sum: { totalAmount: true },
        where: {
            ...where,
            status: { in: ['Active', 'Completed', 'Pending'] }
        }
    });
    const totalRevenue = Number(totalRevenueResult._sum.totalAmount || 0);

    // 2. Ongoing/Active Business (Active + Pending reservations)
    const activeRentalsCount = await prisma.rental.count({
        where: { 
            ...where,
            status: { in: ['Active', 'Pending'] } 
        }
    });

    // 3. New Customers (This Month) - Note: Customers are global, but we could link them to location via their first rental if needed.
    // For now, let's keep customers global or filter if staff is restricted? 
    // Usually Filialleiter only cares about customers who rented at their location.
    const startOfCurrentMonth = startOfMonth(new Date());
    const newCustomersCount = await prisma.customer.count({
        where: { 
            createdAt: { gte: startOfCurrentMonth },
            // If restricted, maybe only show customers with rentals at this location?
            ...(locationId ? { rentals: { some: { pickupLocationId: locationId } } } : {})
        }
    });

    // 4. Pending Reservations
    const pendingReservationsCount = await prisma.rental.count({ 
        where: { 
            ...where,
            status: 'Pending' 
        } 
    });

    return [
        {
            name: 'Gesamteinnahmen',
            value: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalRevenue),
            change: 'Gesamt',
            trend: 'neutral',
            icon: Wallet,
            color: 'bg-green-500',
        },
        {
            name: 'Aktive Vermietungen',
            value: activeRentalsCount.toString(),
            change: 'Aktuell',
            trend: 'neutral',
            icon: Car,
            color: 'bg-blue-500',
        },
        {
            name: 'Neue Kunden',
            value: newCustomersCount.toString(),
            change: 'Diesen Monat',
            trend: 'up',
            icon: Users,
            color: 'bg-purple-500',
        },
        {
            name: 'Ausstehende Reservierungen',
            value: pendingReservationsCount.toString(),
            change: 'Zu bearbeiten',
            trend: 'down',
            icon: CalendarClock,
            color: 'bg-orange-500',
        },
    ];
}

async function getChartData(locationId?: number | null) {
    const where: any = {};
    if (locationId) {
        where.pickupLocationId = locationId;
    }

    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    const rentals = await prisma.rental.findMany({
        where: {
            ...where,
            createdAt: { gte: sixMonthsAgo },
            status: { not: 'Cancelled' }
        },
        select: {
            totalAmount: true,
            createdAt: true
        }
    });

    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const s = startOfMonth(date);
        const e = endOfMonth(date);

        const monthlyRentals = rentals.filter(r => r.createdAt >= s && r.createdAt <= e);
        const revenue = monthlyRentals.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);

        revenueData.push({
            month: format(date, 'MMM', { locale: de }),
            revenue,
            rentals: monthlyRentals.length
        });
    }

    const categoryDataWhere: any = { isActive: true };
    if (locationId) {
        categoryDataWhere.locationId = locationId;
    }

    const carsByCategory = await prisma.car.groupBy({
        by: ['category'],
        _count: { category: true },
        where: categoryDataWhere
    });

    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];
    const categoryData = carsByCategory.map((c, i) => ({
        name: c.category || 'Andere',
        value: c._count.category,
        color: colors[i % colors.length]
    }));

    const locationDataWhere: any = {};
    if (locationId) {
        locationDataWhere.pickupLocationId = locationId;
    }

    const rentalsByLocation = await prisma.rental.groupBy({
        by: ['pickupLocationId'],
        _count: { pickupLocationId: true },
        where: locationDataWhere,
        take: 5,
        orderBy: { _count: { pickupLocationId: 'desc' } }
    });

    const locationData = await Promise.all(rentalsByLocation.map(async (r) => {
        if (!r.pickupLocationId) return null;
        const loc = await prisma.location.findUnique({ where: { id: r.pickupLocationId } });
        return {
            location: loc?.name || 'Unbekannt',
            rentals: r._count.pickupLocationId
        };
    }));

    return {
        revenueData,
        categoryData,
        locationData: locationData.filter(l => l !== null)
    };
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
    return rentals;
}

export default async function AdminDashboard() {
    const staff = await getAdminSession();
    
    if (!staff) {
        redirect('/admin/login');
        return null; // unreachable but safe for TS
    }

    const isRestricted = staff && staff.role !== 'ADMINISTRATOR';
    const locId = isRestricted ? staff?.locationId : undefined;

    const [stats, recentRentals, chartData] = await Promise.all([
        getStats(locId),
        getRecentRentals(locId),
        getChartData(locId)
    ]);

    return (
        <div className="space-y-10 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                        Willkommen zurück, {staff?.name?.split(' ')[0] || 'Admin'}
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Hier ist die Übersicht für <span className="font-semibold text-zinc-900 dark:text-zinc-100">{staff?.location?.name || 'alle Standorte'}</span> heute.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/reservations/new"
                        className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Neue Reservierung
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900/50 p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md group"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{stat.name}</p>
                                <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
                            </div>
                            <div className={clsx('rounded-2xl p-3 text-white shadow-lg transition-transform group-hover:rotate-6', stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-[11px] font-bold">
                            <span
                                className={clsx(
                                    'flex items-center rounded-full px-2 py-0.5',
                                    stat.trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
                                        stat.trend === 'down' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400'
                                )}
                            >
                                {stat.trend === 'up' && <ArrowUpRight className="mr-1 h-3 w-3" />}
                                {stat.trend === 'down' && <ArrowDownRight className="mr-1 h-3 w-3" />}
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1 & 2: Primary Operations */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Today's Overview Component */}
                    <TodayOverview />

                    {/* Recent Content */}
                    <div className="rounded-3xl bg-white dark:bg-zinc-900/50 shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
                            <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-500" />
                                Letzte Vermietungen
                            </h3>
                            <Link href="/admin/reservations" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Alle anzeigen</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
                                <thead className="bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
                                    <tr>
                                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">Fahrzeug</th>
                                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">Kunde</th>
                                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-right">Betrag</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {recentRentals.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                                                Keine Vermietungen gefunden
                                            </td>
                                        </tr>
                                    ) : (
                                        recentRentals.map((rental) => (
                                            <tr key={rental.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer relative">
                                                <td className="px-6 py-4">
                                                    <Link href={`/admin/reservations/${rental.id}`} className="absolute inset-0 z-0" />
                                                    <div className="font-bold text-zinc-900 dark:text-white relative z-10">{rental.car.brand} {rental.car.model}</div>
                                                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono relative z-10">{rental.car.plate}</div>
                                                </td>
                                                <td className="px-6 py-4 relative z-10 font-medium">{rental.customer.firstName} {rental.customer.lastName}</td>
                                                <td className="px-6 py-4 relative z-10">
                                                    <span
                                                        className={clsx(
                                                            'inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight',
                                                            rental.status === 'Active' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                                                            rental.status === 'Completed' && 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
                                                            rental.status === 'Pending' && 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
                                                            rental.status === 'Cancelled' && 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                                        )}
                                                    >
                                                        {rental.status === 'Active' && 'Aktiv'}
                                                        {rental.status === 'Completed' && 'Beendet'}
                                                        {rental.status === 'Pending' && 'Offen'}
                                                        {rental.status === 'Cancelled' && 'Storniert'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white text-right relative z-10">
                                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Column 3: Stats & Trends */}
                <div className="space-y-8">
                    {/* Charts Wrapper */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">Analyse & Trends</h3>
                        <DashboardCharts
                            revenueData={chartData.revenueData}
                            categoryData={chartData.categoryData}
                            locationData={chartData.locationData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
