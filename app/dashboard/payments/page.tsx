import prisma from '@/lib/prisma';
import { getCurrentCustomer } from '@/lib/dashboardAuth';
import NoCustomer from '@/components/dashboard/NoCustomer';
import { CreditCard, CreditCard as CardIcon, Plus, Info, CheckCircle2 } from 'lucide-react';
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Transaktionsverlauf (Links 2 cols) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Info className="h-4 w-4 text-zinc-400" />
                                    Transaktionsverlauf
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Datum</th>
                                            <th className="px-6 py-4">Fahrzeug</th>
                                            <th className="px-6 py-4">Art</th>
                                            <th className="px-6 py-4 text-right">Betrag</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {payments.map((p) => (
                                            <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                                                <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                                                    {format(new Date(p.paymentDate), 'dd.MM.yy HH:mm', { locale: de })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                                                        {p.rental.car.brand} {p.rental.car.model}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                                                        <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                                                        {methodLabels[p.paymentMethod] ?? p.paymentMethod}
                                                    </span>
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
                    </div>

                    {/* Zahlungsmethoden (Rechts 1 col) */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                Gespeicherte Zahlungsmittel
                            </h2>
                            
                            <div className="space-y-3">
                                {/* Sample Saved Method */}
                                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                            <CardIcon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">•••• 4242</p>
                                            <p className="text-xs text-zinc-500">Ablauf: 12/28</p>
                                        </div>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                </div>

                                <button className="w-full group mt-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-6 px-4 text-sm font-medium text-zinc-500 transition-all hover:border-blue-400 hover:text-blue-600 dark:border-zinc-800 dark:hover:border-blue-500 dark:hover:text-blue-400">
                                    <Plus className="h-5 w-5" />
                                    Zahlungsart hinzufügen
                                </button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-4">Unterstützte Methoden (via Stripe)</p>
                                <div className="flex flex-wrap gap-3 grayscale opacity-60">
                                    {/* Simulated Mini-Logos or Labels */}
                                    <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-black dark:text-white">VISA</span>
                                    <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-black dark:text-white">MASTERCARD</span>
                                    <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-blue-600">PayPal</span>
                                    <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-pink-500">Klarna</span>
                                    <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-zinc-800 dark:text-zinc-200">Apple Pay</span>
                                </div>
                                <p className="mt-4 text-[11px] text-zinc-500 flex items-center gap-1.5 leading-relaxed">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 flex-shrink-0"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    Ihre Zahlungsdaten sind durch Stripe SSL-verschlüsselt und werden nicht auf unseren Servern gespeichert.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
