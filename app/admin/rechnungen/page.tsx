import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Receipt, FileText } from 'lucide-react';
import CreateInvoiceButton from './CreateInvoiceButton';

export const dynamic = 'force-dynamic';

async function getData() {
    const withInvoice = await prisma.invoice.findMany({ select: { rentalId: true } });
    const rentalIdsWithInvoice = withInvoice.map((i) => i.rentalId);

    const [rentalsWithoutInvoice, invoices] = await Promise.all([
        prisma.rental.findMany({
            where: {
                status: { not: 'Cancelled' },
                id: { notIn: rentalIdsWithInvoice },
            },
            include: { car: true, customer: true },
            orderBy: { startDate: 'desc' },
        }),
        prisma.invoice.findMany({
            include: { rental: { include: { car: true, customer: true } } },
            orderBy: { issuedAt: 'desc' },
        }),
    ]);
    return { rentalsWithoutInvoice, invoices };
}

export default async function RechnungenPage() {
    const { rentalsWithoutInvoice, invoices } = await getData();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rechnungen & Registrierkassa</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Rechnungen pro Miete erstellen. Später Anbindung an Registrierkassa / Finanzamt Österreich.
                </p>
            </div>

            {/* Vermietungen ohne Rechnung */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Vermietungen ohne Rechnung ({rentalsWithoutInvoice.length})
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    {rentalsWithoutInvoice.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            Alle Vermietungen haben eine Rechnung.
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-6 py-3">Vertrag / Miete</th>
                                    <th className="px-6 py-3">Fahrzeug</th>
                                    <th className="px-6 py-3">Kunde</th>
                                    <th className="px-6 py-3">Zeitraum</th>
                                    <th className="px-6 py-3">Betrag</th>
                                    <th className="px-6 py-3 text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rentalsWithoutInvoice.map((r) => (
                                    <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700/50">
                                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">#{r.contractNumber ?? r.id}</td>
                                        <td className="px-6 py-3">{r.car.brand} {r.car.model}</td>
                                        <td className="px-6 py-3">{r.customer.firstName} {r.customer.lastName}</td>
                                        <td className="px-6 py-3">{format(new Date(r.startDate), 'dd.MM.yy', { locale: de })} – {format(new Date(r.endDate), 'dd.MM.yy', { locale: de })}</td>
                                        <td className="px-6 py-3">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(r.totalAmount))}</td>
                                        <td className="px-6 py-3 text-right">
                                            <CreateInvoiceButton rentalId={r.id} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Ausgestellte Rechnungen */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Ausgestellte Rechnungen ({invoices.length})
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    {invoices.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            Noch keine Rechnungen erstellt.
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-6 py-3">Rechnungsnummer</th>
                                    <th className="px-6 py-3">Datum</th>
                                    <th className="px-6 py-3">Miete</th>
                                    <th className="px-6 py-3">Netto</th>
                                    <th className="px-6 py-3">USt</th>
                                    <th className="px-6 py-3">Brutto</th>
                                    <th className="px-6 py-3">Registrierkassa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="border-b border-gray-100 dark:border-gray-700/50">
                                        <td className="px-6 py-3 font-mono font-medium text-gray-900 dark:text-gray-100">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-3">{format(new Date(inv.issuedAt), 'dd.MM.yyyy', { locale: de })}</td>
                                        <td className="px-6 py-3">#{inv.rental.contractNumber ?? inv.rental.id} · {inv.rental.car.brand} {inv.rental.car.model}</td>
                                        <td className="px-6 py-3">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(inv.subtotal))}</td>
                                        <td className="px-6 py-3">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(inv.taxAmount))}</td>
                                        <td className="px-6 py-3 font-medium">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(inv.total))}</td>
                                        <td className="px-6 py-3">
                                            {inv.registrierkassaExportedAt ? (
                                                <span className="text-green-600 dark:text-green-400 text-xs">Übermittelt</span>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">Noch nicht an RKSV/BMF</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
                Registrierkassa: Nach Anbindung der Kasse an das Finanzamt Österreich können Belege (Rechnungen) dort übermittelt werden. Bis dahin werden Rechnungsnummer und Beträge hier geführt.
            </p>
        </div>
    );
}
