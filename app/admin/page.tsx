import { Users, Car, Wallet, ArrowUpRight, ArrowDownRight, CalendarClock, Activity, Plus, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import prisma from '@/lib/prisma';
import { formatDistanceToNow, startOfMonth, format } from 'date-fns';
import { de } from 'date-fns/locale';
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
            icon: Wallet,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50',
        },
        {
            name: 'Aktive Vermietungen',
            value: activeRentalsCount.toString(),
            change: 'Derzeit im Einsatz',
            trend: 'neutral',
            icon: Car,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50',
        },
        {
            name: 'Neue Kunden',
            value: newCustomersCount.toString(),
            change: 'Diesen Monat',
            trend: 'up',
            icon: Users,
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50',
        },
        {
            name: 'Offene Reservierungen',
            value: pendingReservationsCount.toString(),
            change: 'Warten auf Bearbeitung',
            trend: 'down',
            icon: CalendarClock,
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
    return rentals;
}

export default async function AdminDashboard() {
    const staff = await getAdminSession();
    
    if (!staff) {
        redirect('/admin/login');
        return null;
    }

    const isRestricted = staff && staff.role !== 'ADMINISTRATOR';
    const locId = isRestricted ? staff?.locationId : undefined;

    const [stats, recentRentals] = await Promise.all([
        getStats(locId),
        getRecentRentals(locId)
    ]);

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-10 px-4 sm:px-6">
            
            {/* Header Area (Clean SaaS Style) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                        Willkommen zurück, {staff?.name?.split(' ')[0] || 'Admin'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Übersicht für <span className="font-medium text-gray-900 dark:text-gray-200">{staff?.location?.name || 'alle Standorte'}</span> am {format(new Date(), 'dd. MMMM yyyy', { locale: de })}.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/reservations/new"
                        className="flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Neue Reservierung
                    </Link>
                </div>
            </div>

            {/* Stats Grid (Minimalist Cards) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-700"
                    >
                        <div className="flex items-center justify-between">
                            <div className={clsx('rounded-lg p-2 border', stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <span
                                className={clsx(
                                    'text-xs font-medium px-2 py-0.5 rounded-full',
                                    stat.trend === 'up' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                    stat.trend === 'down' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 
                                    'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                )}
                            >
                                {stat.trend === 'up' && '+ '}
                                {stat.change}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1 tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-8">
                {/* Primary Operations View (Check-ins/Outs) */}
                <TodayOverview />

                {/* Recent Rentals Table (Clean Design) */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-gray-400" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">Letzte Vermietungen</h3>
                        </div>
                        <Link href="/admin/reservations" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            Alle anzeigen <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Fahrzeug</th>
                                    <th className="px-6 py-3 font-medium">Kunde</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Betrag</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {recentRentals.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            Keine aktuellen Vermietungen vorhanden.
                                        </td>
                                    </tr>
                                ) : (
                                    recentRentals.map((rental) => (
                                        <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 dark:text-white">{rental.car.brand} {rental.car.model}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 font-mono">{rental.car.plate}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-medium">
                                                {rental.customer.firstName} {rental.customer.lastName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={clsx(
                                                        'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium border',
                                                        rental.status === 'Active' && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50',
                                                        rental.status === 'Completed' && 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
                                                        rental.status === 'Pending' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
                                                        rental.status === 'Cancelled' && 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                                                    )}
                                                >
                                                    {rental.status === 'Active' && 'Aktiv'}
                                                    {rental.status === 'Completed' && 'Abgeschlossen'}
                                                    {rental.status === 'Pending' && 'Ausstehend'}
                                                    {rental.status === 'Cancelled' && 'Storniert'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-right">
                                                {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
