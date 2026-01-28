import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Search, Filter, Calendar, List } from 'lucide-react';
import { clsx } from 'clsx';
import ReservationCalendar from '@/components/admin/ReservationCalendar';

async function getRentals() {
    const rentals = await prisma.rental.findMany({
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

export default async function ReservationsPage({ searchParams }: { searchParams: { view?: string } }) {
    const rentals = await getRentals();
    const view = searchParams.view || 'list';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Reservierungen</h1>
                <div className="flex gap-2">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Suchen..."
                            className="h-9 w-64 rounded-lg border border-gray-300 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>

                    {/* View Toggle */}
                    <div className="flex rounded-lg border border-gray-300 bg-white overflow-hidden">
                        <a
                            href="/admin/reservations?view=list"
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors",
                                view === 'list' ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            <List className="h-4 w-4" />
                            Liste
                        </a>
                        <a
                            href="/admin/reservations?view=calendar"
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300",
                                view === 'calendar' ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            <Calendar className="h-4 w-4" />
                            Kalender
                        </a>
                    </div>

                    <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                        + Reservierung
                    </button>
                </div>
            </div>

            {view === 'calendar' ? (
                <ReservationCalendar />
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Fahrzeug</th>
                                    <th className="px-6 py-4">Kunde</th>
                                    <th className="px-6 py-4">Zeitraum</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Betrag</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rentals.map((rental) => {
                                    const startDate = format(new Date(rental.startDate), 'dd MMM yyyy', { locale: de });
                                    const endDate = format(new Date(rental.endDate), 'dd MMM yyyy', { locale: de });

                                    return (
                                        <tr key={rental.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs">#{rental.id.toString().padStart(4, '0')}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{rental.car.brand} {rental.car.model}</div>
                                                <div className="text-xs text-gray-500">{rental.car.plate}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{rental.customer.firstName} {rental.customer.lastName}</div>
                                                <div className="text-xs text-gray-500">{rental.customer.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-900">{startDate}</div>
                                                <div className="text-xs text-gray-500">bis {endDate}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                                    rental.status === 'Active' && "bg-blue-50 text-blue-700",
                                                    rental.status === 'Completed' && "bg-gray-100 text-gray-700",
                                                    rental.status === 'Pending' && "bg-yellow-50 text-yellow-700",
                                                    rental.status === 'Cancelled' && "bg-red-50 text-red-700"
                                                )}>
                                                    {rental.status === 'Active' ? 'Aktiv' :
                                                        rental.status === 'Completed' ? 'Abgeschlossen' :
                                                            rental.status === 'Pending' ? 'Ausstehend' : 'Storniert'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">Bearbeiten</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
