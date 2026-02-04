import prisma from '@/lib/prisma';
import ReservationCalendar from '@/components/admin/ReservationCalendar';
import Link from 'next/link';
import { Plus, Filter, Calendar as CalendarIcon, List } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getRentals() {
    return await prisma.rental.findMany({
        where: {
            // Fetch both active and reserved, maybe completed past ones too for calendar history
            OR: [
                { status: 'Active' },
                { status: 'Reserved' },
                { status: 'Completed' },
                { status: 'Pending' }
            ]
        },
        include: {
            car: true,
            customer: true
        },
        orderBy: {
            startDate: 'desc'
        }
    });
}

export default async function ReservationsPage() {
    const rentals = await getRentals();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Reservierungen</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Verwalten Sie Buchungen und Verfügbarkeiten</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <Link
                        href="/admin/reservations/new"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Neue Reservierung
                    </Link>
                </div>
            </div>

            {/* Tabs for List/Calendar view could go here, for now we show Calendar primarily */}

            <ReservationCalendar rentals={rentals} />

            {/* Recent Reservations List */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <List className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Aktuelle Buchungsliste</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase font-medium text-zinc-500 dark:text-zinc-400">
                            <tr>
                                <th className="px-6 py-3">Kunde</th>
                                <th className="px-6 py-3">Fahrzeug</th>
                                <th className="px-6 py-3">Zeitraum</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {rentals.slice(0, 10).map((rental) => (
                                <tr key={rental.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                                        {rental.customer.firstName} {rental.customer.lastName}
                                    </td>
                                    <td className="px-6 py-4">
                                        {rental.car.brand} {rental.car.model}
                                        <div className="text-xs text-zinc-400 mt-0.5">{rental.car.plate}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span>{new Date(rental.startDate).toLocaleDateString('de-DE')}</span>
                                            <span className="text-xs text-zinc-400">bis {new Date(rental.endDate).toLocaleDateString('de-DE')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${rental.status === 'Active' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
                                                rental.status === 'Completed' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700' :
                                                    rental.status === 'Reserved' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' :
                                                        'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                                            }`}>
                                            {rental.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/reservations/${rental.id}`} className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline">
                                            Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {rentals.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 italic">
                                        Keine Reservierungen gefunden.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
