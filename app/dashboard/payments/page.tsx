import prisma from '@/lib/prisma';
import { getCurrentCustomer } from '@/lib/dashboardAuth';
import NoCustomer from '@/components/dashboard/NoCustomer';
import { CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
    const customer = await getCurrentCustomer();
    if (!customer) return <NoCustomer />;

    const payments = await prisma.payment.findMany({
        where: { rental: { customerId: customer.id } },
        include: {
            rental: {
                include: { car: true },
            },
        },
        orderBy: { paymentDate: 'desc' },
    });

    const methodLabels: Record<string, string> = {
        Cash: 'Bar',
        Card: 'Karte',
        Transfer: 'Überweisung',
        Online: 'Online',
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Zahlungen</h1>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">Übersicht aller Ihre Zahlungen.</p>
            </div>

            {payments.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
                    <CreditCard className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500 mb-4" />
                    <p className="text-zinc-600 dark:text-zinc-400">Noch keine Zahlungen vorhanden.</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Datum</th>
                                    <th className="px-6 py-4">Miete / Fahrzeug</th>
                                    <th className="px-6 py-4">Zahlungsart</th>
                                    <th className="px-6 py-4 text-right">Betrag</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {payments.map((p) => (
                                    <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                                        <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100">
                                            {format(new Date(p.paymentDate), 'dd.MM.yyyy HH:mm', { locale: de })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                                {p.rental.car.brand} {p.rental.car.model}
                                            </span>
                                            {p.rental.contractNumber && (
                                                <span className="block text-xs text-zinc-500 dark:text-zinc-400">#{p.rental.contractNumber}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-zinc-400" />
                                            {methodLabels[p.paymentMethod] ?? p.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                                            {formatCurrency(Number(p.amount))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
