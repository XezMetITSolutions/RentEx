/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
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
        },
        {
            name: 'Aktive Vermietungen',
            value: activeRentalsCount.toString(),
            change: 'Derzeit im Einsatz',
            trend: 'neutral',
            icon: Car,
        },
        {
            name: 'Neue Kunden',
            value: newCustomersCount.toString(),
            change: 'Diesen Monat',
            trend: 'up',
            icon: Users,
        },
        {
            name: 'Offene Reservierungen',
            value: pendingReservationsCount.toString(),
            change: 'Warten auf Bearbeitung',
            trend: 'down',
            icon: CalendarClock,
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

    const isRestricted = staff && staff.role !== 'ADMINISTRATOR' && staff.role !== 'SUPERADMIN';
    const locId = isRestricted ? staff?.locationId : undefined;

    const [stats, recentRentals] = await Promise.all([
        getStats(locId),
        getRecentRentals(locId)
    ]);

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            
            {/* Header Area (Workbench style) */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            RentEx Ländle Workbench · {staff?.location?.name || 'Alle Standorte'}
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Willkommen zurück, {staff?.name?.split(' ')[0] || 'Admin'}
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Stand: {format(new Date(), 'dd. MMMM yyyy', { locale: de })}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <Link 
                        href="/admin/check-in-setup"
                        className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-hm-ink transition-colors shadow-xs"
                    >
                        <Car className="h-3.5 w-3.5 text-hm-muted" />
                        Fahrzeugrückgabe
                    </Link>
                    <Link 
                        href="/admin/rechnungen"
                        className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-hm-ink transition-colors shadow-xs"
                    >
                        <Wallet className="h-3.5 w-3.5 text-hm-muted" />
                        Rechnung erstellen
                    </Link>
                    <Link 
                        href="/admin/reservations/new"
                        className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2 text-xs font-semibold uppercase tracking-wider text-hm-accent-ink transition-colors shadow-xs"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Neue Reservierung
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule transition-colors hover:border-hm-rule-strong flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div className="rounded-[var(--hm-radius-input)] p-2 bg-hm-paper-2 border border-hm-rule text-hm-ink">
                                <stat.icon className="h-4 w-4" />
                            </div>
                            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 text-hm-muted border border-hm-rule">
                                {stat.change}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">{stat.name}</p>
                            <p className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink mt-1 hm-tnum">
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-8">
                {/* Primary Operations View (Check-ins/Outs) */}
                <TodayOverview />

                {/* Recent Rentals Table */}
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                    <div className="px-6 py-4 border-b border-hm-rule flex justify-between items-center bg-hm-paper">
                        <div className="flex items-center gap-2.5">
                            <Activity className="h-4 w-4 text-hm-accent" />
                            <h3 className="hm-display text-base font-bold text-hm-ink tracking-tight">Letzte Vermietungen</h3>
                        </div>
                        <Link 
                            href="/admin/reservations" 
                            className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted hover:text-hm-accent flex items-center gap-1 transition-colors"
                        >
                            Alle anzeigen <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] font-mono text-hm-muted bg-hm-paper-2 border-b border-hm-rule uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-6 py-3 font-semibold">Kunde</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold text-right">Betrag</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {recentRentals.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-sm font-mono text-hm-muted">
                                            Keine aktuellen Vermietungen vorhanden.
                                        </td>
                                    </tr>
                                ) : (
                                    recentRentals.map((rental) => (
                                        <tr key={rental.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-hm-ink">{rental.car.brand} {rental.car.model}</div>
                                                <div className="inline-block mt-1 font-mono text-[11px] px-2 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink-2">
                                                    {rental.car.plate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-hm-ink font-medium">
                                                {rental.customer.firstName} {rental.customer.lastName}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={clsx(
                                                        'inline-flex items-center rounded-[var(--hm-radius-pill)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider border',
                                                        rental.status === 'Active' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
                                                        rental.status === 'Completed' && 'bg-hm-paper-2 text-hm-muted border-hm-rule',
                                                        rental.status === 'Pending' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
                                                        rental.status === 'Cancelled' && 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
                                                    )}
                                                >
                                                    {rental.status === 'Active' && 'Aktiv'}
                                                    {rental.status === 'Completed' && 'Abgeschlossen'}
                                                    {rental.status === 'Pending' && 'Ausstehend'}
                                                    {rental.status === 'Cancelled' && 'Storniert'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-hm-ink text-right hm-tnum">
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
