/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { useState, useMemo } from 'react';
import {
    Receipt,
    Eye,
    TrendingUp,
    Search,
    Download,
    AlertCircle,
    Shield,
    CheckCircle2,
    Clock,
    X,
    PlusCircle,
    ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { clsx } from 'clsx';
import CreateInvoiceButton from '@/app/admin/rechnungen/CreateInvoiceButton';

interface RentalItem {
    id: number;
    contractNumber: string | null;
    totalAmount: number;
    startDate: string;
    endDate: string;
    customer: {
        firstName: string;
        lastName: string;
        email: string;
    } | null;
    car: {
        brand: string;
        model: string;
        plate: string;
    } | null;
}

interface InvoiceItem {
    id: number;
    invoiceNumber: string;
    issuedAt: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    status: string;
    registrierkassaExportedAt: string | null;
    registrierkassaBelegId: string | null;
    rental: {
        id: number;
        contractNumber: string | null;
        customer: {
            firstName: string;
            lastName: string;
            email: string;
        } | null;
        car: {
            brand: string;
            model: string;
            plate: string;
        } | null;
    } | null;
}

interface InvoicesClientViewProps {
    rentalsWithoutInvoice: RentalItem[];
    invoices: InvoiceItem[];
}

export default function InvoicesClientView({
    rentalsWithoutInvoice,
    invoices,
}: InvoicesClientViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [rksvFilter, setRksvFilter] = useState<'ALL' | 'EXPORTED' | 'PENDING'>('ALL');
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [manualSearch, setManualSearch] = useState('');

    const totalRevenue = useMemo(() => {
        return invoices.reduce((sum, inv) => sum + inv.total, 0);
    }, [invoices]);

    const exportedCount = useMemo(() => {
        return invoices.filter((i) => i.registrierkassaExportedAt).length;
    }, [invoices]);

    // Filter invoices in archive
    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            const matchesRksv =
                rksvFilter === 'ALL' ||
                (rksvFilter === 'EXPORTED' && Boolean(inv.registrierkassaExportedAt)) ||
                (rksvFilter === 'PENDING' && !inv.registrierkassaExportedAt);

            const q = searchQuery.toLowerCase().trim();
            const customerName = inv.rental?.customer
                ? `${inv.rental.customer.firstName} ${inv.rental.customer.lastName}`.toLowerCase()
                : '';
            const carText = inv.rental?.car
                ? `${inv.rental.car.brand} ${inv.rental.car.model} ${inv.rental.car.plate}`.toLowerCase()
                : '';
            const contractNum = (inv.rental?.contractNumber || String(inv.rental?.id || '')).toLowerCase();

            const matchesSearch =
                !q ||
                inv.invoiceNumber.toLowerCase().includes(q) ||
                customerName.includes(q) ||
                carText.includes(q) ||
                contractNum.includes(q);

            return matchesRksv && matchesSearch;
        });
    }, [invoices, rksvFilter, searchQuery]);

    // Filter rentals in manual modal
    const filteredManualRentals = useMemo(() => {
        const q = manualSearch.toLowerCase().trim();
        if (!q) return rentalsWithoutInvoice;
        return rentalsWithoutInvoice.filter((r) => {
            const customerName = r.customer ? `${r.customer.firstName} ${r.customer.lastName}`.toLowerCase() : '';
            const carText = r.car ? `${r.car.brand} ${r.car.model} ${r.car.plate}`.toLowerCase() : '';
            const contractNum = (r.contractNumber || String(r.id)).toLowerCase();
            return customerName.includes(q) || carText.includes(q) || contractNum.includes(q);
        });
    }, [rentalsWithoutInvoice, manualSearch]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(val);

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
                        Zentrale Verwaltung aller Rechnungsbelege, USt-Nachweise & Registrierkassen-Exporte
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <a
                        href="/api/admin/rechnungen/export"
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Download className="w-3.5 h-3.5 text-hm-muted" />
                        CSV Export
                    </a>
                    <button
                        onClick={() => setIsManualModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                    >
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
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl sm:text-3xl font-bold text-hm-ink mt-3 hm-tnum">
                        {formatCurrency(totalRevenue)}
                    </p>
                    <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Berechnet aus {invoices.length} ausgestellten Belegen
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
                        {invoices.length}
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        Davon <span className="font-semibold text-emerald-700 dark:text-emerald-400">{exportedCount}</span> an RKSV gemeldet
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
                        {rentalsWithoutInvoice.length}
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        Vermietungen ohne ausgestellte Rechnung
                    </p>
                </div>
            </div>

            {/* Needs Attention / Offene Rechnungen */}
            {rentalsWithoutInvoice.length > 0 && (
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                    <div className="px-6 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper">
                        <div className="flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 text-hm-accent" />
                            <div>
                                <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                    Zu verrechnende Vermietungen (Aktion erforderlich)
                                </h2>
                                <p className="text-xs font-mono text-hm-muted">
                                    Für diese abgeschlossenen bzw. aktiven Verträge wurde noch kein Beleg erstellt
                                </p>
                            </div>
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
                                            <div className="font-medium text-xs text-hm-ink">
                                                {r.customer?.firstName} {r.customer?.lastName}
                                            </div>
                                            <div className="text-[11px] font-mono text-hm-muted">
                                                {r.customer?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-hm-muted">
                                            {r.car?.brand} {r.car?.model} <span className="text-[10px]">({r.car?.plate})</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-hm-muted">
                                            {r.startDate ? format(new Date(r.startDate), 'dd.MM.yyyy', { locale: de }) : '-'} bis {r.endDate ? format(new Date(r.endDate), 'dd.MM.yyyy', { locale: de }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-hm-ink hm-tnum">
                                            {formatCurrency(r.totalAmount)}
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
                <div className="px-6 py-4 border-b border-hm-rule flex flex-col md:flex-row md:items-center justify-between gap-4 bg-hm-paper">
                    <div className="flex items-center gap-2.5">
                        <Receipt className="w-4 h-4 text-hm-accent" />
                        <div>
                            <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">Belegarchiv</h2>
                            <p className="text-xs font-mono text-hm-muted">
                                {filteredInvoices.length} von {invoices.length} Rechnungen angezeigt
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* RKSV Status Tabs */}
                        <div className="inline-flex rounded-[var(--hm-radius-input)] p-1 bg-hm-paper-2 border border-hm-rule text-xs font-mono">
                            <button
                                onClick={() => setRksvFilter('ALL')}
                                className={clsx(
                                    "px-2.5 py-1 rounded-[var(--hm-radius-input)] transition-colors",
                                    rksvFilter === 'ALL' ? "bg-hm-paper font-semibold text-hm-ink shadow-xs" : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Alle
                            </button>
                            <button
                                onClick={() => setRksvFilter('EXPORTED')}
                                className={clsx(
                                    "px-2.5 py-1 rounded-[var(--hm-radius-input)] transition-colors",
                                    rksvFilter === 'EXPORTED' ? "bg-hm-paper font-semibold text-emerald-700 dark:text-emerald-400 shadow-xs" : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                RKSV Gemeldet
                            </button>
                            <button
                                onClick={() => setRksvFilter('PENDING')}
                                className={clsx(
                                    "px-2.5 py-1 rounded-[var(--hm-radius-input)] transition-colors",
                                    rksvFilter === 'PENDING' ? "bg-hm-paper font-semibold text-amber-700 dark:text-amber-400 shadow-xs" : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Ausstehend
                            </button>
                        </div>

                        {/* Search input */}
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-hm-muted" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Beleg-Nr, Kunde, Kennzeichen..."
                                className="pl-9 pr-3 py-1.5 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono bg-hm-paper-2 text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors w-full sm:w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {filteredInvoices.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center">
                            <Receipt className="w-10 h-10 text-hm-muted/40 mb-3" />
                            <p className="text-xs font-mono uppercase tracking-wider text-hm-muted">
                                Keine Belege für diese Suchkriterien gefunden
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-hm-paper-2 text-[11px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Beleg-Nr.</th>
                                    <th className="px-6 py-3 font-semibold">Datum</th>
                                    <th className="px-6 py-3 font-semibold">Kunde / Vermietung</th>
                                    <th className="px-6 py-3 font-semibold">Netto</th>
                                    <th className="px-6 py-3 font-semibold">MwSt (20%)</th>
                                    <th className="px-6 py-3 font-semibold">Brutto</th>
                                    <th className="px-6 py-3 font-semibold text-center">RKSV Status</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {filteredInvoices.map((inv) => (
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
                                            {formatCurrency(inv.subtotal)}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-hm-muted hm-tnum">
                                            {formatCurrency(inv.taxAmount)}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-xs text-hm-ink hm-tnum">
                                            {formatCurrency(inv.total)}
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
                                                className="inline-flex items-center gap-1.5 px-3 py-1 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors font-mono text-xs border border-transparent hover:border-hm-rule"
                                                title="Beleg ansehen & drucken"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Öffnen</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Manual Invoice Modal */}
            {isManualModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-hm-accent" />
                                <h3 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                    Manuelle Rechnung ausstellen
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsManualModalOpen(false)}
                                className="p-1.5 text-hm-muted hover:text-hm-ink rounded-[var(--hm-radius-input)] hover:bg-hm-paper-2 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <p className="text-xs font-mono text-hm-muted">
                                Wählen Sie eine abgeschlossene oder bestehende Vermietung aus, um dafür sofort eine fortlaufende österreichische Registrierkassen-Rechnung zu generieren.
                            </p>

                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-hm-muted" />
                                <input
                                    type="text"
                                    value={manualSearch}
                                    onChange={(e) => setManualSearch(e.target.value)}
                                    placeholder="Vertrag, Kunde oder Fahrzeug suchen..."
                                    className="w-full pl-9 pr-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono bg-hm-paper-2 text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                />
                            </div>

                            <div className="divide-y divide-hm-rule border border-hm-rule rounded-[var(--hm-radius-input)] max-h-72 overflow-y-auto">
                                {filteredManualRentals.length === 0 ? (
                                    <div className="p-8 text-center font-mono text-xs text-hm-muted">
                                        Keine offenen Vermietungen ohne Rechnung gefunden.
                                    </div>
                                ) : (
                                    filteredManualRentals.map((r) => (
                                        <div key={r.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-hm-paper-2/50 transition-colors">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-xs text-hm-ink">
                                                        #{r.contractNumber ?? r.id}
                                                    </span>
                                                    <span className="text-xs text-hm-ink font-medium truncate">
                                                        {r.customer?.firstName} {r.customer?.lastName}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] font-mono text-hm-muted mt-0.5">
                                                    {r.car?.brand} {r.car?.model} ({r.car?.plate}) · {formatCurrency(r.totalAmount)}
                                                </div>
                                            </div>
                                            <CreateInvoiceButton rentalId={r.id} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-3 border-t border-hm-rule bg-hm-paper-2 flex justify-end">
                            <button
                                onClick={() => setIsManualModalOpen(false)}
                                className="px-4 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] font-mono text-xs text-hm-ink hover:bg-hm-paper transition-colors cursor-pointer"
                            >
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Notice */}
            <div className="flex items-start gap-3 p-4 bg-hm-paper-2 rounded-[var(--hm-radius-card)] border border-hm-rule">
                <Shield className="w-4 h-4 text-hm-accent mt-0.5 shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-hm-ink">
                        RKSV Konformität (§ 131 BAO & RKSV)
                    </h4>
                    <p className="text-xs text-hm-muted">
                        Alle Belege werden nach den Richtlinien der österreichischen Registrierkassensicherheitsverordnung (RKSV) manipulationssicher signiert und archiviert.
                    </p>
                </div>
            </div>
        </div>
    );
}
