import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Receipt, FileText, ExternalLink, Eye, ChevronRight } from 'lucide-react';
import CreateInvoiceButton from './CreateInvoiceButton';
import Link from 'next/link';
import { clsx } from 'clsx';

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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rechnungen & Registrierkassa</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Alle Belege im Überblick. Später direkte Anbindung an das Finanzamt Österreich (RKSV).
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <p className="text-[10px] text-green-600 dark:text-green-400 uppercase font-bold tracking-wider">Gesamtumsatz (Brutto)</p>
                        <p className="text-xl font-black text-green-700 dark:text-green-300">
                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(invoices.reduce((sum, inv) => sum + Number(inv.total), 0))}
                        </p>
                    </div>
                    <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">Erstellt</p>
                        <p className="text-xl font-black text-blue-700 dark:text-blue-300">{invoices.length}</p>
                    </div>
                </div>
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
                        <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 text-sm italic">
                            Noch keine Rechnungen erstellt.
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Beleg-Nr.</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Datum</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Miete & Kunde</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Netto</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">USt (20%)</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Brutto</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-center">RKSV</th>
                                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-gray-100">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{format(new Date(inv.issuedAt), 'dd.MM.yyyy', { locale: de })}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-white">#{inv.rental.contractNumber ?? inv.rental.id} · {inv.rental.car.brand} {inv.rental.car.model}</span>
                                                <span className="text-xs text-gray-500">{inv.rental.customer.firstName} {inv.rental.customer.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(inv.subtotal))}</td>
                                        <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(inv.taxAmount))}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(inv.total))}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={clsx(
                                                "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                inv.registrierkassaExportedAt ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-500"
                                            )}>
                                                {inv.registrierkassaExportedAt ? "Übermittelt" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/rechnungen/${inv.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Ansehen
                                            </Link>
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
