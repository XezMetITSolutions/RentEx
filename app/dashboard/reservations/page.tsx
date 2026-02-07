import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getCurrentCustomer } from '@/lib/dashboardAuth';
import NoCustomer from '@/components/dashboard/NoCustomer';
import { CalendarClock, Car, MapPin, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { clsx } from 'clsx';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

export const dynamic = 'force-dynamic';

export default async function ReservationsPage() {
    const customer = await getCurrentCustomer();
    if (!customer) return <NoCustomer />;

    const reservations = await prisma.rental.findMany({
        where: {
            customerId: customer.id,
            startDate: { gte: new Date() },
            status: { not: 'Cancelled' },
        },
        include: {
            car: true,
            pickupLocation: true,
            returnLocation: true,
        },
        orderBy: { startDate: 'asc' },
    });

    const statusLabels: Record<string, string> = {
        Pending: 'Ausstehend',
        Active: 'Bestätigt',
    };
    const statusColors: Record<string, string> = {
        Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
        Active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Reservierungen</h1>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">Ihre anstehenden Buchungen.</p>
            </div>

            {reservations.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
                    <CalendarClock className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500 mb-4" />
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">Keine anstehenden Reservierungen.</p>
                    <Link href="/fleet" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline">
                        Jetzt reservieren <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {reservations.map((r) => (
                        <Link
                            key={r.id}
                            href={`/dashboard/rentals/${r.id}`}
                            className="block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className="h-14 w-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {r.car.imageUrl ? (
                                            <img src={r.car.imageUrl} alt="" className="h-full w-full object-contain" />
                                        ) : (
                                            <Car className="h-7 w-7 text-zinc-500 dark:text-zinc-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                                            {r.car.brand} {r.car.model}
                                        </h3>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{r.car.plate}</p>
                                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <CalendarClock className="h-3.5 w-3.5" />
                                                {format(new Date(r.startDate), 'dd.MM.yyyy', { locale: de })} – {format(new Date(r.endDate), 'dd.MM.yyyy', { locale: de })}
                                            </span>
                                            {(r.pickupLocation?.name || r.returnLocation?.name) && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {r.pickupLocation?.name ?? r.returnLocation?.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 sm:flex-shrink-0">
                                    <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[r.status] ?? 'bg-zinc-100 text-zinc-600')}>
                                        {statusLabels[r.status] ?? r.status}
                                    </span>
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">{formatCurrency(Number(r.totalAmount))}</span>
                                    <ChevronRight className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
