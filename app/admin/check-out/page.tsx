import prisma from '@/lib/prisma';
import { format, startOfDay, endOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { ChevronRight, PackageCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { getAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export default async function CheckOutPage() {
    const staff = await getAdminSession();
    const isRestricted = staff && staff.role !== 'ADMINISTRATOR' && staff.role !== 'SUPERADMIN';
    const locationId = isRestricted ? staff?.locationId : undefined;

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const rentals = await prisma.rental.findMany({
        where: {
            status: 'Active',
            ...(locationId ? { pickupLocationId: locationId } : {}),
            endDate: { lte: todayEnd },
        },
        orderBy: { endDate: 'asc' },
        include: { car: true, customer: true },
    });

    return (
        <div className="max-w-[1200px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Operativ · Rückgabe
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink flex items-center gap-3">
                        <PackageCheck className="h-8 w-8 text-hm-accent" />
                        Check-Out
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Aktive Vermietungen mit Rückgabe heute oder überfällig · {rentals.length} Fahrzeuge
                    </p>
                </div>
                <Link
                    href="/admin/reservations"
                    className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted hover:text-hm-accent transition-colors"
                >
                    Alle Reservierungen
                </Link>
            </div>

            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] font-mono text-hm-muted bg-hm-paper-2 border-b border-hm-rule uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                <th className="px-6 py-3 font-semibold">Kunde</th>
                                <th className="px-6 py-3 font-semibold">Rückgabe</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-hm-rule">
                            {rentals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-mono text-hm-muted">
                                        Keine anstehenden Rückgaben für heute.
                                    </td>
                                </tr>
                            ) : (
                                rentals.map((rental) => {
                                    const endDate = new Date(rental.endDate);
                                    const isOverdue = endDate < todayStart;
                                    const endLabel = format(endDate, 'dd.MM.yyyy HH:mm', { locale: de });

                                    return (
                                        <tr key={rental.id} className="hover:bg-hm-paper-2/50 transition-colors">
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
                                            <td className="px-6 py-4 font-mono text-xs text-hm-ink">{endLabel}</td>
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    'inline-flex items-center rounded-[var(--hm-radius-pill)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider border',
                                                    isOverdue
                                                        ? 'bg-red-500/10 text-red-700 border-red-500/20'
                                                        : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                                                )}>
                                                    {isOverdue ? 'Überfällig' : 'Heute'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/admin/reservations/${rental.id}`}
                                                    className="inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted hover:text-hm-accent transition-colors"
                                                >
                                                    Rückgabe bearbeiten <ChevronRight className="w-3.5 h-3.5" />
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
        </div>
    );
}
