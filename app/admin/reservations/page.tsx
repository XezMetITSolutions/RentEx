/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, List, ChevronRight, Plus, CalendarDays } from 'lucide-react';
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
    const isRestricted = staff && staff.role !== 'ADMINISTRATOR' && staff.role !== 'SUPERADMIN';
    
    const rentals = await getRentals(isRestricted ? staff?.locationId : undefined);
    const view = resolvedSearchParams.view || 'list';

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Operativ · Buchungsmanagement
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Reservierungen
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Übersicht aller aktiven und geplanten Vermietungen · {rentals.length} Buchungen
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center bg-hm-paper-2 rounded-[var(--hm-radius-input)] p-1 border border-hm-rule">
                        <Link
                            href="/admin/reservations?view=list"
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider rounded-[calc(var(--hm-radius-input)-2px)] transition-all",
                                view === 'list' 
                                    ? "bg-hm-paper text-hm-ink shadow-xs border border-hm-rule" 
                                    : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            <List className="h-3.5 w-3.5" />
                            Liste
                        </Link>
                        <Link
                            href="/admin/reservations?view=calendar"
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider rounded-[calc(var(--hm-radius-input)-2px)] transition-all",
                                view === 'calendar' 
                                    ? "bg-hm-paper text-hm-ink shadow-xs border border-hm-rule" 
                                    : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            Kalender
                        </Link>
                    </div>

                    <Link 
                        href="/admin/reservations/new"
                        className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-hm-accent-ink transition-colors shadow-xs"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Neue Reservierung
                    </Link>
                </div>
            </div>

            {view === 'calendar' ? (
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule p-6">
                    <ReservationCalendar />
                </div>
            ) : (
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] font-mono text-hm-muted bg-hm-paper-2 border-b border-hm-rule uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">ID</th>
                                    <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-6 py-3 font-semibold">Kunde</th>
                                    <th className="px-6 py-3 font-semibold">Zeitraum</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold text-right">Betrag</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {rentals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm font-mono text-hm-muted">
                                            Keine Reservierungen gefunden.
                                        </td>
                                    </tr>
                                ) : (
                                    rentals.map((rental) => {
                                        const startDate = format(new Date(rental.startDate), 'dd.MM.yyyy', { locale: de });
                                        const endDate = format(new Date(rental.endDate), 'dd.MM.yyyy', { locale: de });

                                        return (
                                            <tr key={rental.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-hm-muted">
                                                    #{rental.id.toString().padStart(4, '0')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-hm-ink">{rental.car.brand} {rental.car.model}</div>
                                                    <div className="inline-block mt-1 font-mono text-[11px] px-2 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink-2">
                                                        {rental.car.plate}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-hm-ink">{rental.customer.firstName} {rental.customer.lastName}</div>
                                                    <div className="text-xs text-hm-muted mt-0.5 font-mono">{rental.customer.email}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs">
                                                    <div className="text-hm-ink font-medium">{startDate}</div>
                                                    <div className="text-hm-muted text-[11px]">bis {endDate}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={clsx(
                                                        "inline-flex items-center rounded-[var(--hm-radius-pill)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider border",
                                                        rental.status === 'Active' && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
                                                        rental.status === 'Completed' && "bg-hm-paper-2 text-hm-muted border-hm-rule",
                                                        rental.status === 'Pending' && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
                                                        rental.status === 'Cancelled' && "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                                                    )}>
                                                        {rental.status === 'Active' && 'Aktiv'}
                                                        {rental.status === 'Completed' && 'Abgeschlossen'}
                                                        {rental.status === 'Pending' && 'Ausstehend'}
                                                        {rental.status === 'Cancelled' && 'Storniert'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono font-bold text-hm-ink text-right hm-tnum">
                                                    {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link 
                                                        href={`/admin/reservations/${rental.id}`} 
                                                        className="inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted hover:text-hm-accent transition-colors"
                                                    >
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
