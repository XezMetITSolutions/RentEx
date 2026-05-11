import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Receipt, FileText, ExternalLink, Eye, ChevronRight, TrendingUp, Filter, Search, Download, AlertCircle, Shield, MoreHorizontal, CheckCircle2, Clock } from 'lucide-react';
import CreateInvoiceButton from './CreateInvoiceButton';
import Link from 'next/link';
import { clsx } from 'clsx';

export const dynamic = 'force-dynamic';

async function getData() {
    try {
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
    } catch (error) {
        console.error('Error fetching invoice data:', error);
        return { rentalsWithoutInvoice: [], invoices: [] };
    }
}

export default async function RechnungenPage() {
    const { rentalsWithoutInvoice, invoices } = await getData();
    const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.total || 0), 0) || 0;

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-24 px-4 sm:px-6">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Rechnungen</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Zentrale Verwaltung aller Belege und Registrierkassen-Transaktionen.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-black rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-gray-100 transition-colors shadow-sm">
                        <Receipt className="w-4 h-4" />
                        Manuelle Rechnung
                    </button>
                </div>
            </div>

            {/* Metrics Overview (Clean SaaS Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gesamtumsatz</p>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2 tracking-tight">
                        €{totalRevenue.toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +12.5% ggü. Vormonat
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ausgestellte Belege</p>
                        <Receipt className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2 tracking-tight">
                        {invoices?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Davon {invoices?.filter(i => i.registrierkassaExportedAt).length || 0} an RKSV übermittelt</p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Offene Posten</p>
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                    </div>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white mt-2 tracking-tight">
                        {rentalsWithoutInvoice?.length || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Zu verrechnende Vermietungen</p>
                </div>
            </div>

            {/* Needs Attention / Offene Rechnungen */}
            {rentalsWithoutInvoice && rentalsWithoutInvoice.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-500">
                            <AlertCircle className="w-5 h-5" />
                            <h2 className="text-base font-semibold">Offene Rechnungen (Aktion erforderlich)</h2>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Vertrag</th>
                                    <th className="px-6 py-3 font-medium">Kunde</th>
                                    <th className="px-6 py-3 font-medium">Fahrzeug</th>
                                    <th className="px-6 py-3 font-medium">Zeitraum</th>
                                    <th className="px-6 py-3 font-medium text-right">Betrag</th>
                                    <th className="px-6 py-3 font-medium text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {rentalsWithoutInvoice.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-900 dark:text-gray-100">
                                            #{r.contractNumber ?? r.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {r.customer?.firstName} {r.customer?.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {r.car?.brand} {r.car?.model}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {r.startDate ? format(new Date(r.startDate), 'dd.MM.yyyy', { locale: de }) : '-'} - {r.endDate ? format(new Date(r.endDate), 'dd.MM.yyyy', { locale: de }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                                            €{Number(r.totalAmount || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <CreateInvoiceButton rentalId={r.id} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Archive / All Invoices */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Belegarchiv</h2>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Beleg suchen..." 
                                className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-full sm:w-64"
                            />
                        </div>
                        <button className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {!invoices || invoices.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center">
                            <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Keine Rechnungen</h3>
                            <p className="text-sm text-gray-500 mt-1">Bisher wurden keine Belege ausgestellt.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Beleg-Nr.</th>
                                    <th className="px-6 py-3 font-medium">Datum</th>
                                    <th className="px-6 py-3 font-medium">Kunde / Vermietung</th>
                                    <th className="px-6 py-3 font-medium">Netto</th>
                                    <th className="px-6 py-3 font-medium">Brutto</th>
                                    <th className="px-6 py-3 font-medium text-center">RKSV Status</th>
                                    <th className="px-6 py-3 font-medium text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-gray-100">
                                            {inv.invoiceNumber}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {inv.issuedAt ? format(new Date(inv.issuedAt), 'dd.MM.yyyy', { locale: de }) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {inv.rental?.customer?.firstName} {inv.rental?.customer?.lastName}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                #{inv.rental?.contractNumber ?? inv.rental?.id} · {inv.rental?.car?.brand}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            €{Number(inv.subtotal || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            €{Number(inv.total || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {inv.registrierkassaExportedAt ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Übermittelt
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Ausstehend
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/admin/rechnungen/${inv.id}`}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                                    title="Beleg ansehen"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-800 rounded-md transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Footer Notice (Clean style) */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">RKSV Konformität</h4>
                    <p className="text-sm text-gray-500 mt-1">
                        Alle Belege werden nach den Richtlinien der Registrierkassensicherheitsverordnung (RKSV) erfasst. Die Übermittlung an das BMF erfolgt automatisch über die angebundene Schnittstelle.
                    </p>
                </div>
            </div>
        </div>
    );
}
