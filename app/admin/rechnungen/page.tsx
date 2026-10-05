/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Receipt, Eye, TrendingUp, Filter, Search, Download, AlertCircle, Shield, CheckCircle2, Clock } from 'lucide-react';
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
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Finanzen · Belegwesen & RKSV
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Rechnungen & Belege
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Zentrale Verwaltung aller Rechnungsbelege & Registrierkassen-Exporte
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button className="inline-flex items-center gap-2 px-3.5 py-2 bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs">
                        <Download className="w-3.5 h-3.5 text-hm-muted" />
                        Export
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs">
                        <Receipt className="w-3.5 h-3.5" />
                        Manuelle Rechnung
                    </button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Gesamtumsatz</span>
                        <div className="p-2 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl sm:text-3xl font-bold text-hm-ink mt-3 hm-tnum">
                        €{totalRevenue.toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Berechnet aus allen ausgestellten Rechnungen
                    </p>
                </div>

                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Ausgestellte Belege</span>
                        <div className="p-2 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Receipt className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl sm:text-3xl font-bold text-hm-ink mt-3 hm-tnum">
                        {invoices?.length || 0}
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        Davon {invoices?.filter(i => i.registrierkassaExportedAt).length || 0} an RKSV gemeldet
                    </p>
                </div>

                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Offene Posten</span>
                        <div className="p-2 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <AlertCircle className="w-4 h-4 text-hm-accent" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl sm:text-3xl font-bold text-hm-ink mt-3 hm-tnum">
                        {rentalsWithoutInvoice?.length || 0}
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        Vermietungen ohne ausgestellte Rechnung
                    </p>
                </div>
            </div>

            {/* Needs Attention / Offene Rechnungen */}
            {rentalsWithoutInvoice && rentalsWithoutInvoice.length > 0 && (
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                    <div className="px-6 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper">
                        <div className="flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 text-hm-accent" />
                            <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                Zu verrechnende Vermietungen (Aktion erforderlich)
                            </h2>
                        </div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-accent/10 text-hm-accent border border-hm-accent/20">
                            {rentalsWithoutInvoice.length} offen
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-hm-paper-2 text-[11px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Vertrag</th>
                                    <th className="px-6 py-3 font-semibold">Kunde</th>
                                    <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-6 py-3 font-semibold">Zeitraum</th>
                                    <th className="px-6 py-3 font-semibold text-right">Betrag</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {rentalsWithoutInvoice.map((r) => (
                                    <tr key={r.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-hm-ink font-semibold">
                                            #{r.contractNumber ?? r.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-hm-ink">
                                                {r.customer?.firstName} {r.customer?.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-hm-muted">
                                            {r.car?.brand} {r.car?.model}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-hm-muted">
                                            {r.startDate ? format(new Date(r.startDate), 'dd.MM.yyyy', { locale: de }) : '-'} bis {r.endDate ? format(new Date(r.endDate), 'dd.MM.yyyy', { locale: de }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-hm-ink hm-tnum">
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
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                <div className="px-6 py-4 border-b border-hm-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-hm-paper">
                    <div className="flex items-center gap-2.5">
                        <Receipt className="w-4 h-4 text-hm-accent" />
                        <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">Belegarchiv</h2>
                    </div>
                    
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-hm-muted" />
                        <input 
                            type="text" 
                            placeholder="Beleg suchen..." 
                            className="pl-9 pr-3 py-1.5 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono bg-hm-paper-2 text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors w-full sm:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {!invoices || invoices.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center">
                            <Receipt className="w-10 h-10 text-hm-muted/40 mb-3" />
                            <p className="text-xs font-mono uppercase tracking-wider text-hm-muted">Bisher wurden keine Belege ausgestellt</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-hm-paper-2 text-[11px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Beleg-Nr.</th>
                                    <th className="px-6 py-3 font-semibold">Datum</th>
                                    <th className="px-6 py-3 font-semibold">Kunde / Vermietung</th>
                                    <th className="px-6 py-3 font-semibold">Netto</th>
                                    <th className="px-6 py-3 font-semibold">Brutto</th>
                                    <th className="px-6 py-3 font-semibold text-center">RKSV Status</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-hm-paper-2/50 transition-colors group">
                                        <td className="px-6 py-4 font-mono font-semibold text-xs text-hm-ink">
                                            {inv.invoiceNumber}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-hm-muted">
                                            {inv.issuedAt ? format(new Date(inv.issuedAt), 'dd.MM.yyyy', { locale: de }) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-hm-ink text-xs">
                                                {inv.rental?.customer?.firstName} {inv.rental?.customer?.lastName}
                                            </div>
                                            <div className="text-[11px] font-mono text-hm-muted mt-0.5">
                                                #{inv.rental?.contractNumber ?? inv.rental?.id} · {inv.rental?.car?.brand} {inv.rental?.car?.model}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-hm-muted hm-tnum">
                                            €{Number(inv.subtotal || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-xs text-hm-ink hm-tnum">
                                            €{Number(inv.total || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {inv.registrierkassaExportedAt ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Übermittelt
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] text-[10px] font-mono font-bold uppercase tracking-wider bg-hm-paper-2 text-hm-muted border border-hm-rule">
                                                    <Clock className="w-3 h-3" />
                                                    Ausstehend
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/rechnungen/${inv.id}`}
                                                className="inline-flex items-center gap-1 p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors font-mono text-xs"
                                                title="Beleg ansehen"
                                            >
                                                <Eye className="w-4 h-4" />
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
            <div className="flex items-start gap-3 p-4 bg-hm-paper-2 rounded-[var(--hm-radius-card)] border border-hm-rule">
                <Shield className="w-4 h-4 text-hm-accent mt-0.5 shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-hm-ink">RKSV Konformität</h4>
                    <p className="text-xs text-hm-muted">
                        Alle Belege werden nach den Richtlinien der österreichischen Registrierkassensicherheitsverordnung (RKSV) manipulationssicher signiert und archiviert.
                    </p>
                </div>
            </div>
        </div>
    );
}
