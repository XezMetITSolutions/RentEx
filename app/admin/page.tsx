import { Users, Car, Wallet, ArrowUpRight, ArrowDownRight, CalendarClock, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import prisma from '@/lib/prisma';
import { formatDistanceToNow, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { de } from 'date-fns/locale';
import DashboardCharts from '@/components/admin/DashboardCharts';
import TodayOverview from '@/components/admin/TodayOverview';
import Link from 'next/link';
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

    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        const monthlyRevenue = await prisma.rental.aggregate({
            _sum: { totalAmount: true },
            where: {
                ...where,
                createdAt: { gte: start, lte: end },
                status: { not: 'Cancelled' }
            }
        });

        revenueData.push({
            month: format(date, 'MMM', { locale: de }),
            revenue: Number(monthlyRevenue._sum.totalAmount || 0),
            rentals: await prisma.rental.count({ 
                where: { 
                    ...where,
                    createdAt: { gte: start, lte: end } 
                } 
            })
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
    const isRestricted = staff && staff.role !== 'ADMINISTRATOR';
    const locId = isRestricted ? staff?.locationId : undefined;

    const [stats, recentRentals, chartData] = await Promise.all([
        getStats(locId),
        getRecentRentals(locId),
        getChartData(locId)
    ]);

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition-all hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                            <div className={clsx('rounded-xl p-3 text-white shadow-lg', stat.color)}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span
                                className={clsx(
                                    'flex items-center font-semibold',
                                    stat.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                                        stat.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                                )}
                            >
                                {stat.trend === 'up' && <ArrowUpRight className="mr-1 h-4 w-4" />}
                                {stat.trend === 'down' && <ArrowDownRight className="mr-1 h-4 w-4" />}
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Today's Overview */}
            <TodayOverview />

            {/* Interactive Charts */}
            <DashboardCharts
                revenueData={chartData.revenueData}
                categoryData={chartData.categoryData}
                locationData={chartData.locationData}
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Recent Activity / Rentals */}
                <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 lg:col-span-2">
                    <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-5 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Letzte Vermietungen</h3>
                        <Link href="/admin/reservations" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Alle anzeigen</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-6 py-3 font-semibold">Kunde</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Betrag</th>
                                    <th className="px-6 py-3 font-semibold">Zeit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {recentRentals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Keine Vermietungen gefunden
                                        </td>
                                    </tr>
                                ) : (
                                    recentRentals.map((rental) => (
                                        <tr key={rental.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-700/50 cursor-pointer relative">
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/reservations/${rental.id}`} className="absolute inset-0 z-0" />
                                                <div className="font-medium text-gray-900 dark:text-white relative z-10">{rental.car.brand} {rental.car.model}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 relative z-10">{rental.car.plate}</div>
                                            </td>
                                            <td className="px-6 py-4 relative z-10">{rental.customer.firstName} {rental.customer.lastName}</td>
                                            <td className="px-6 py-4 relative z-10">
                                                <span
                                                    className={clsx(
                                                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                        rental.status === 'Active' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                                                        rental.status === 'Completed' && 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
                                                        rental.status === 'Pending' && 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
                                                        rental.status === 'Cancelled' && 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                                    )}
                                                >
                                                    {rental.status === 'Active' && 'Aktiv'}
                                                    {rental.status === 'Completed' && 'Abgeschlossen'}
                                                    {rental.status === 'Pending' && 'Ausstehend'}
                                                    {rental.status === 'Cancelled' && 'Storniert'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white relative z-10">
                                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400 relative z-10">
                                                {formatDistanceToNow(new Date(rental.createdAt), { addSuffix: true, locale: de })}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 h-fit">
                    <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-5">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schnellzugriff</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <Link href="/admin/reservations/new" className="w-full flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                            <span className="font-medium text-gray-700 dark:text-gray-200">Neue Reservierung</span>
                            <ArrowUpRight className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                        </Link>
                        <Link href="/admin/fleet/new" className="w-full flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                            <span className="font-medium text-gray-700 dark:text-gray-200">Fahrzeug hinzufügen</span>
                            <ArrowUpRight className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                        </Link>
                        <Link href="/admin/customers" className="w-full flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                            <span className="font-medium text-gray-700 dark:text-gray-200">Kunde suchen</span>
                            <ArrowUpRight className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
