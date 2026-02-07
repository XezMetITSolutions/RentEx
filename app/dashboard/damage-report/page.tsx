import { getCurrentCustomer } from '@/lib/dashboardAuth';
import NoCustomer from '@/components/dashboard/NoCustomer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { AlertTriangle, FileText, Car } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import DamageReportForm from './DamageReportForm';

export const dynamic = 'force-dynamic';

export default async function DamageReportPage({ searchParams }: { searchParams: Promise<{ rentalId?: string }> }) {
    const customer = await getCurrentCustomer();
    if (!customer) return <NoCustomer />;

    const params = await searchParams;
    const rentalIdParam = params.rentalId ? Number(params.rentalId) : null;

    // Rentals that customer can report damage for (active or recent completed)
    const rentals = await prisma.rental.findMany({
        where: {
            customerId: customer.id,
            status: { in: ['Active', 'Completed', 'Pending'] },
        },
        include: {
            car: true,
            pickupLocation: true,
            returnLocation: true,
        },
        orderBy: { startDate: 'desc' },
        take: 20,
    });

    const selectedRental = rentalIdParam && rentals.some((r) => r.id === rentalIdParam)
        ? rentals.find((r) => r.id === rentalIdParam)!
        : rentals[0] ?? null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <AlertTriangle className="h-7 w-7 text-amber-500" />
                    Schaden / Unfall melden
                </h1>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    Europäischer Unfallbericht – alle Angaben zum gemieteten Fahrzeug werden aus Ihrem Vertrag übernommen.
                </p>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <a href="/api/unfallbericht-pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Europäischer Unfallbericht (PDF)
                    </a>
                    {' '}
                    – Vorlage zum Ausdrucken und Ausfüllen am Unfallort.
                </p>
            </div>

            {rentals.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
                    <Car className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500 mb-4" />
                    <p className="text-zinc-600 dark:text-zinc-400">Sie haben keine Miete, für die Sie einen Schaden melden können.</p>
                    <Link href="/dashboard/rentals" className="mt-4 inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        Meine Anmietungen anzeigen
                    </Link>
                </div>
            ) : (
                <>
                    {rentals.length > 1 && (
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 p-4">
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Miete auswählen:</p>
                            <div className="flex flex-wrap gap-2">
                                {rentals.map((r) => (
                                    <Link
                                        key={r.id}
                                        href={`/dashboard/damage-report?rentalId=${r.id}`}
                                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                            selectedRental?.id === r.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
                                        }`}
                                    >
                                        {r.car.brand} {r.car.model} ({r.car.plate}) – {format(new Date(r.startDate), 'dd.MM.yy', { locale: de })}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedRental && (
                        <DamageReportForm
                            rental={selectedRental}
                            customer={customer}
                        />
                    )}
                </>
            )}
        </div>
    );
}
