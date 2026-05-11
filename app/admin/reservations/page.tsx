import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Search, Filter, Calendar, List, ChevronRight, Plus, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import ReservationCalendar from '@/components/admin/ReservationCalendar';
import Link from 'next/link';
import { getAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

async function getRentals(locationId?: number | null) {
    const where: any = {};
    if (locationId) {
        where.pickupLocationId = locationId;
    }

    const rentals = await prisma.rental.findMany({
        where,
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

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
    const resolvedSearchParams = await searchParams;
    const staff = await getAdminSession();
    const isRestricted = staff && staff.role !== 'ADMINISTRATOR';
    
    const rentals = await getRentals(isRestricted ? staff?.locationId : undefined);
    const view = resolvedSearchParams.view || 'list';

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-10 px-4 sm:px-6">
            
            {/* Header Area (Clean SaaS Style) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Activity className="w-6 h-6 text-gray-400" />
                        Reservierungen
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Übersicht aller aktiven und geplanten Vermietungen.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* View Toggle (Minimalist) */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                        <Link
                            href="/admin/reservations?view=list"
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                view === 'list' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            <List className="h-3.5 w-3.5" />
                            Liste
                        </Link>
                        <Link
                            href="/admin/reservations?view=calendar"
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                view === 'calendar' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            Kalender
                        </Link>
                    </div>

                    <Link 
                        href="/admin/reservations/new"
                        className="flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Neue Reservierung
                    </Link>
                </div>
            </div>

            {view === 'calendar' ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                    <ReservationCalendar />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-medium">ID</th>
                                    <th className="px-6 py-3 font-medium">Fahrzeug</th>
                                    <th className="px-6 py-3 font-medium">Kunde</th>
                                    <th className="px-6 py-3 font-medium">Zeitraum</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Betrag</th>
                                    <th className="px-6 py-3 font-medium text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {rentals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            Keine Reservierungen gefunden.
                                        </td>
                                    </tr>
                                ) : (
                                    rentals.map((rental) => {
                                        const startDate = format(new Date(rental.startDate), 'dd.MM.yyyy', { locale: de });
                                        const endDate = format(new Date(rental.endDate), 'dd.MM.yyyy', { locale: de });

                                        return (
                                            <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-[10px] text-gray-400">
                                                    #{rental.id.toString().padStart(4, '0')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{rental.car.brand} {rental.car.model}</div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5 font-mono">{rental.car.plate}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-700 dark:text-gray-300">{rental.customer.firstName} {rental.customer.lastName}</div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5">{rental.customer.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">{startDate}</div>
                                                    <div className="text-[11px] text-gray-500 mt-0.5 font-medium">bis {endDate}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={clsx(
                                                        "inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight border",
                                                        rental.status === 'Active' && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50",
                                                        rental.status === 'Completed' && "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
                                                        rental.status === 'Pending' && "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50",
                                                        rental.status === 'Cancelled' && "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50"
                                                    )}>
                                                        {rental.status === 'Active' && 'Aktiv'}
                                                        {rental.status === 'Completed' && 'Abgeschlossen'}
                                                        {rental.status === 'Pending' && 'Ausstehend'}
                                                        {rental.status === 'Cancelled' && 'Storniert'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white text-right">
                                                    {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link href={`/admin/reservations/${rental.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                                        Details <ChevronRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
