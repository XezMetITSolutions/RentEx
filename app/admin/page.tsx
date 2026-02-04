import { Users, Car, Wallet, ArrowUpRight, ArrowDownRight, CalendarClock } from 'lucide-react';
import { clsx } from 'clsx';
import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import DashboardCharts from '@/components/admin/DashboardCharts';
import TodayOverview from '@/components/admin/TodayOverview';
import Link from 'next/link';

async function getStats() {
    const totalRevenue = await prisma.rental.aggregate({
        _sum: {
            totalAmount: true
        },
        where: {
            status: {
                not: 'Cancelled'
            }
        }
    });

    const activeRentalsCount = await prisma.rental.count({
        where: {
            status: 'Active'
        }
    });

    const uniqueCustomersCount = await prisma.customer.count();

    const pendingReservationsCount = await prisma.rental.count({
        where: {
            status: 'Pending'
        }
    });

    return [
        {
            name: 'Gesamteinnahmen',
            value: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(totalRevenue._sum.totalAmount || 0)),
            change: '+12.5%', // Mocked for now, needs historical data
            trend: 'up',
            icon: Wallet,
            color: 'bg-green-500',
        },
        {
            name: 'Aktive Vermietungen',
            value: activeRentalsCount.toString(),
            change: '+3.2%', // Mocked
            trend: 'up',
            icon: Car,
            color: 'bg-blue-500',
        },
        {
            name: 'Neue Kunden',
            value: uniqueCustomersCount.toString(),
            change: '+18.1%', // Mocked
            trend: 'up',
            icon: Users,
            color: 'bg-purple-500',
        },
        {
            name: 'Ausstehende Reservierungen',
            value: pendingReservationsCount.toString(),
            change: '-2.4%', // Mocked
            trend: 'down',
            icon: CalendarClock,
            color: 'bg-orange-500',
        },
    ];
}

async function getRecentRentals() {
    const rentals = await prisma.rental.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            car: true,
            customer: true
        }
    });

    return rentals;
}

export default async function AdminDashboard() {
    const stats = await getStats();
    const recentRentals = await getRecentRentals();

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={clsx('rounded-xl p-3 text-white shadow-lg', stat.color)}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span
                                className={clsx(
                                    'flex items-center font-semibold',
                                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                )}
                            >
                                {stat.trend === 'up' ? (
                                    <ArrowUpRight className="mr-1 h-4 w-4" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-4 w-4" />
                                )}
                                {stat.change}
                            </span>
                            <span className="ml-2 text-gray-400">vs Vormonat</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Today's Overview - Pickups, Returns, Maintenance */}
            <TodayOverview />

            {/* Interactive Charts */}
            <DashboardCharts />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Recent Activity / Rentals */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 lg:col-span-2">
                    <div className="border-b border-gray-100 px-6 py-5">
                        <h3 className="text-lg font-semibold text-gray-900">Letzte Vermietungen</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-6 py-3 font-semibold">Kunde</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Betrag</th>
                                    <th className="px-6 py-3 font-semibold">Zeit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentRentals.map((rental) => (
                                    <tr key={rental.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{rental.car.brand} {rental.car.model}</div>
                                            <div className="text-xs text-gray-500">{rental.car.plate}</div>
                                        </td>
                                        <td className="px-6 py-4">{rental.customer.firstName} {rental.customer.lastName}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={clsx(
                                                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                    rental.status === 'Active' && 'bg-blue-50 text-blue-700',
                                                    rental.status === 'Completed' && 'bg-gray-100 text-gray-700',
                                                    rental.status === 'Pending' && 'bg-yellow-50 text-yellow-700'
                                                )}
                                            >
                                                {rental.status === 'Active' && 'Aktiv'}
                                                {rental.status === 'Completed' && 'Abgeschlossen'}
                                                {rental.status === 'Pending' && 'Ausstehend'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {formatDistanceToNow(new Date(rental.createdAt), { addSuffix: true, locale: de })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions or Summary */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
                    <div className="border-b border-gray-100 px-6 py-5">
                        <h3 className="text-lg font-semibold text-gray-900">Schnellzugriff</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <Link href="/admin/reservations/new" className="w-full flex items-center justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                            <span className="font-medium text-gray-700">Neue Reservierung</span>
                            <ArrowUpRight className="h-5 w-5 text-gray-400" />
                        </Link>
                        <Link href="/admin/fleet/new" className="w-full flex items-center justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                            <span className="font-medium text-gray-700">Fahrzeug hinzufügen</span>
                            <ArrowUpRight className="h-5 w-5 text-gray-400" />
                        </Link>
                        <Link href="/admin/customers" className="w-full flex items-center justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100">
                            <span className="font-medium text-gray-700">Kunde suchen</span>
                            <ArrowUpRight className="h-5 w-5 text-gray-400" />
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 px-6 py-5">
                        <div className="rounded-xl bg-blue-600 p-4 text-white">
                            <h4 className="font-semibold mb-1">Mobile App herunterladen</h4>
                            <p className="text-xs text-blue-100 mb-3">Verwalten Sie Ihr Admin-Panel von unterwegs.</p>
                            <div className="h-2 w-full bg-blue-500 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-white rounded-full"></div>
                            </div>
                            <p className="text-[10px] mt-2 text-right">Beta v1.0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
