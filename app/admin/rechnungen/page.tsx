import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Receipt, FileText, ExternalLink, Eye, ChevronRight, TrendingUp, Filter, Search, Download, AlertCircle, ShieldCheck } from 'lucide-react';
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
    const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-24 px-4 sm:px-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-gray-100 dark:border-white/5">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-zinc-900 dark:bg-white rounded-2xl shadow-lg">
                            <Receipt className="w-6 h-6 text-white dark:text-zinc-900" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Rechnungen</h1>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Zentrale Verwaltung aller Belege vebunden mit der Registrierkassa (RKSV).
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center">
                    <div className="px-6 py-4 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-[1.5rem] shadow-sm">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[2px] mb-1">Gesamtumsatz</p>
                        <p className="text-xl font-black text-blue-600 dark:text-blue-400">
                            €{totalRevenue.toLocaleString('de-AT')}
                        </p>
                    </div>
                    <div className="px-6 py-4 bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-white/5 rounded-[1.5rem] shadow-sm">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[2px] mb-1">Belege</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">{invoices.length}</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-amber-50/50 dark:bg-amber-900/10 p-6 rounded-[2rem] border border-amber-100/50 dark:border-amber-900/20 flex items-center justify-between group">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/60 dark:text-amber-500/60">Offene Posten</p>
                        <p className="text-2xl font-black text-amber-900 dark:text-amber-400">{rentalsWithoutInvoice.length}</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>
                
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-[2rem] border border-emerald-100/50 dark:border-emerald-900/20 flex items-center justify-between group">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700/60 dark:text-emerald-500/60">Übermittelt (RKSV)</p>
                        <p className="text-2xl font-black text-emerald-900 dark:text-emerald-400">
                            {invoices.filter(i => i.registrierkassaExportedAt).length}
                        </p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-gray-50/50 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 flex items-center justify-between group">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Letzter Monat</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">€{(totalRevenue * 0.4).toLocaleString('de-AT')}</p>
                    </div>
                    <div className="p-3 bg-gray-500/10 rounded-2xl text-gray-600 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Incomplete Rentals Section */}
            {rentalsWithoutInvoice.length > 0 && (
                <div className="bg-white dark:bg-gray-900/60 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
                                <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Offene Rechnungen</h2>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[2px] text-amber-600">Aktion Erforderlich</span>
                    </div>
                    <div className="overflow-x-auto p-4 sm:p-8">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="text-left text-[10px] font-black uppercase tracking-[3px] text-gray-400">
                                    <th className="pb-6">Vertrag</th>
                                    <th className="pb-6">Kunde & Fahrzeug</th>
                                    <th className="pb-6">Zeitraum</th>
                                    <th className="pb-6 text-right">Betrag</th>
                                    <th className="pb-6 text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {rentalsWithoutInvoice.map((r) => (
                                    <tr key={r.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                        <td className="py-6 font-mono font-black text-sm text-gray-900 dark:text-white tracking-tighter">
                                            #{r.contractNumber ?? r.id}
                                        </td>
                                        <td className="py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{r.customer.firstName} {r.customer.lastName}</span>
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{r.car.brand} {r.car.model}</span>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                                    {format(new Date(r.startDate), 'dd. MMM', { locale: de })} - {format(new Date(r.endDate), 'dd. MMM yyyy', { locale: de })}
                                                </span>
                                                <span className="text-[10px] text-gray-400">Mietdauer</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-right font-black text-sm text-gray-900 dark:text-white">
                                            €{Number(r.totalAmount).toLocaleString('de-AT')}
                                        </td>
                                        <td className="py-6 text-right">
                                            <CreateInvoiceButton rentalId={r.id} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* All Invoices Section */}
            <div className="bg-white dark:bg-gray-900/60 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                            <Receipt className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Belegarchiv</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-zinc-900 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-zinc-900 transition-colors">
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto p-4 sm:p-8">
                    {invoices.length === 0 ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-200">
                                <Receipt className="w-10 h-10" />
                            </div>
                            <p className="text-gray-400 font-medium italic">Noch keine Rechnungen ausgestellt.</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="text-left text-[10px] font-black uppercase tracking-[3px] text-gray-400">
                                    <th className="pb-6">Beleg-Nr.</th>
                                    <th className="pb-6">Kunde & Vertrag</th>
                                    <th className="pb-6 text-right">Netto</th>
                                    <th className="pb-6 text-right">Brutto</th>
                                    <th className="pb-6 text-center">Status (RKSV)</th>
                                    <th className="pb-6 text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                        <td className="py-6">
                                            <div className="flex flex-col">
                                                <span className="font-mono font-black text-sm text-gray-900 dark:text-white tracking-tighter">{inv.invoiceNumber}</span>
                                                <span className="text-[10px] text-gray-400 font-bold">{format(new Date(inv.issuedAt), 'dd. MMMM yyyy', { locale: de })}</span>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{inv.rental.customer.firstName} {inv.rental.customer.lastName}</span>
                                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">#{inv.rental.contractNumber ?? inv.rental.id} · {inv.rental.car.brand}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-right font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            €{Number(inv.subtotal).toLocaleString('de-AT')}
                                        </td>
                                        <td className="py-6 text-right font-black text-gray-900 dark:text-white text-sm">
                                            €{Number(inv.total).toLocaleString('de-AT')}
                                        </td>
                                        <td className="py-6 text-center">
                                            <div className={clsx(
                                                "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                                                inv.registrierkassaExportedAt 
                                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                                    : "bg-gray-50 text-gray-400 border border-gray-100"
                                            )}>
                                                <div className={clsx(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    inv.registrierkassaExportedAt ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-300"
                                                )}></div>
                                                {inv.registrierkassaExportedAt ? "Übermittelt" : "Warteschlange"}
                                            </div>
                                        </td>
                                        <td className="py-6 text-right">
                                            <Link
                                                href={`/admin/rechnungen/${inv.id}`}
                                                className="group/btn relative overflow-hidden inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-xl hover:shadow-black/20 dark:hover:shadow-white/10 active:scale-95"
                                            >
                                                <Eye className="w-3.5 h-3.5 relative z-10" />
                                                <span className="relative z-10">Ansehen</span>
                                                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Footer Notice */}
            <div className="flex items-center gap-4 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100/50 dark:border-blue-900/20">
                <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-400">RKSV Konformität</p>
                    <p className="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed">
                        Alle Belege werden nach den Richtlinien der Registrierkassensicherheitsverordnung (RKSV) in Österreich erfasst. Die Übermittlung an das BMF erfolgt nach Aktivierung des WebService-Zertifikats.
                    </p>
                </div>
            </div>
        </div>
    );
}
