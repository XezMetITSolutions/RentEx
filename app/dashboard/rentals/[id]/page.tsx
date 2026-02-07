import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getCurrentCustomer } from '@/lib/dashboardAuth';
import NoCustomer from '@/components/dashboard/NoCustomer';
import { Car, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { notFound } from 'next/navigation';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

export const dynamic = 'force-dynamic';

export default async function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const customer = await getCurrentCustomer();
    if (!customer) return <NoCustomer />;

    const id = Number((await params).id);
    if (Number.isNaN(id)) notFound();

    const rental = await prisma.rental.findFirst({
        where: { id, customerId: customer.id },
        include: {
            car: true,
            pickupLocation: true,
            returnLocation: true,
            payments: true,
        },
    });

    if (!rental) notFound();

    const statusLabels: Record<string, string> = {
        Active: 'Aktiv',
        Pending: 'Ausstehend',
        Completed: 'Abgeschlossen',
        Cancelled: 'Storniert',
    };

    return (
        <div className="space-y-8">
            <Link href="/dashboard/rentals" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
                <ArrowLeft className="h-4 w-4" />
                Zurück zu Meine Anmietungen
            </Link>

            <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <div className="p-6 sm:p-8 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="h-20 w-28 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {rental.car.imageUrl ? (
                                    <img src={rental.car.imageUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <Car className="h-10 w-10 text-zinc-500 dark:text-zinc-400" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                    {rental.car.brand} {rental.car.model}
                                </h1>
                                <p className="text-zinc-500 dark:text-zinc-400">{rental.car.plate} • {rental.car.color}</p>
                                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    {rental.contractNumber ? `Vertrag #${rental.contractNumber}` : `Buchung #${rental.id}`}
                                </p>
                                <span className="inline-block mt-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                    {statusLabels[rental.status] ?? rental.status}
                                </span>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(Number(rental.totalAmount))}</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Gesamtbetrag</p>
                        </div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Abholung
                        </h3>
                        <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">{format(new Date(rental.startDate), 'EEEE, dd. MMMM yyyy', { locale: de })}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{rental.pickupLocation?.name ?? '–'}</p>
                    </div>
                    <div className="p-6">
                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Rückgabe
                        </h3>
                        <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">{format(new Date(rental.endDate), 'EEEE, dd. MMMM yyyy', { locale: de })}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{rental.returnLocation?.name ?? '–'}</p>
                    </div>
                </div>

                {rental.payments.length > 0 && (
                    <div className="border-t border-zinc-200 dark:border-zinc-800 p-6">
                        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Zahlungen</h3>
                        <ul className="space-y-2">
                            {rental.payments.map((p) => (
                                <li key={p.id} className="flex justify-between text-sm">
                                    <span>{p.paymentMethod} – {format(new Date(p.paymentDate), 'dd.MM.yyyy', { locale: de })}</span>
                                    <span className="font-medium">{formatCurrency(Number(p.amount))}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
