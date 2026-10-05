/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { useState, useMemo } from 'react';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Download,
    Search,
    Wrench,
    PiggyBank,
    Receipt,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowUpRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';

interface TransactionItem {
    id: number;
    contractNumber: string;
    customerName: string;
    customerEmail: string;
    carName: string;
    plate: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    totalAmount: number;
    paymentStatus: string;
    status: string;
    paymentMethod: string;
}

interface FinanceStats {
    totalRevenue: number;
    netRevenue: number;
    vatAmount: number;
    pendingRevenue: number;
    totalExpenses: number;
    netProfit: number;
    monthlyRevenue: { month: string; amount: number }[];
    averageRentalValue: number;
    growth: number;
    transactions: TransactionItem[];
}

export default function FinanceView({ stats }: { stats: FinanceStats }) {
    const [period, setPeriod] = useState<'month' | 'quarter' | 'year' | 'all'>('month');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'Paid' | 'Pending' | 'Partial'>('ALL');

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return stats.transactions.filter((tx) => {
            const matchesStatus = statusFilter === 'ALL' || tx.paymentStatus === statusFilter;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                tx.contractNumber.toLowerCase().includes(q) ||
                tx.customerName.toLowerCase().includes(q) ||
                tx.customerEmail.toLowerCase().includes(q) ||
                tx.carName.toLowerCase().includes(q) ||
                tx.plate.toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [stats.transactions, statusFilter, searchQuery]);

    const maxAmount = Math.max(...stats.monthlyRevenue.map((m) => m.amount), 1);

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
                            Finanzen · Bilanz, Cashflow & Ertrag
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Finanzübersicht
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Einnahmen, Vorsteuer (20% USt), Betriebskosten & monatliche Kennzahlen
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="inline-flex rounded-[var(--hm-radius-input)] p-1 bg-hm-paper-2 border border-hm-rule text-xs font-mono">
                        <button
                            onClick={() => setPeriod('month')}
                            className={clsx(
                                "px-3 py-1 rounded-[var(--hm-radius-input)] transition-colors",
                                period === 'month' ? "bg-hm-paper font-semibold text-hm-ink shadow-xs" : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            Monat
                        </button>
                        <button
                            onClick={() => setPeriod('quarter')}
                            className={clsx(
                                "px-3 py-1 rounded-[var(--hm-radius-input)] transition-colors",
                                period === 'quarter' ? "bg-hm-paper font-semibold text-hm-ink shadow-xs" : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            Quartal
                        </button>
                        <button
                            onClick={() => setPeriod('year')}
                            className={clsx(
                                "px-3 py-1 rounded-[var(--hm-radius-input)] transition-colors",
                                period === 'year' ? "bg-hm-paper font-semibold text-hm-ink shadow-xs" : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            Jahr
                        </button>
                        <button
                            onClick={() => setPeriod('all')}
                            className={clsx(
                                "px-3 py-1 rounded-[var(--hm-radius-input)] transition-colors",
                                period === 'all' ? "bg-hm-paper font-semibold text-hm-ink shadow-xs" : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            Gesamt
                        </button>
                    </div>

                    <a
                        href="/api/admin/finance-export"
                        className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-hm-accent-ink transition-colors shadow-xs"
                    >
                        <Download className="w-3.5 h-3.5" />
                        CSV Export
                    </a>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Gesamteinnahmen */}
                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper p-5 border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Wallet className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 text-hm-muted border border-hm-rule">
                            Realisierter Umsatz
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Gesamteinnahmen (Brutto)</p>
                        <p className="hm-display text-2xl font-bold tracking-tight text-hm-ink mt-1 hm-tnum">
                            {formatCurrency(stats.totalRevenue)}
                        </p>
                        <div className="mt-2 text-[11px] font-mono text-hm-muted flex items-center justify-between border-t border-hm-rule pt-2">
                            <span>Netto: {formatCurrency(stats.netRevenue)}</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">20% USt: {formatCurrency(stats.vatAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Ausstehende Zahlungen */}
                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper p-5 border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <DollarSign className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            Offen
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Ausstehende Forderungen</p>
                        <p className="hm-display text-2xl font-bold tracking-tight text-hm-ink mt-1 hm-tnum">
                            {formatCurrency(stats.pendingRevenue)}
                        </p>
                        <p className="mt-3 font-mono text-[11px] text-hm-muted border-t border-hm-rule pt-2">
                            In aktiven oder unbezahlten Verträgen
                        </p>
                    </div>
                </div>

                {/* 3. Wartungs- & Werkstattkosten */}
                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper p-5 border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Wrench className="h-4 w-4 text-hm-accent" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 text-hm-muted border border-hm-rule">
                            Aufwand
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Wartungskosten (Fleet)</p>
                        <p className="hm-display text-2xl font-bold tracking-tight text-hm-ink mt-1 hm-tnum">
                            {formatCurrency(stats.totalExpenses)}
                        </p>
                        <p className="mt-3 font-mono text-[11px] text-hm-muted border-t border-hm-rule pt-2">
                            Inspektion, § 57a & Reparaturen
                        </p>
                    </div>
                </div>

                {/* 4. Deckungsbeitrag / Netto-Ergebnis */}
                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper p-5 border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <PiggyBank className="h-4 w-4" />
                        </div>
                        <span className={clsx(
                            "font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] border",
                            stats.netProfit >= 0
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                        )}>
                            {stats.netProfit >= 0 ? 'Positiv' : 'Defizit'}
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Deckungsbeitrag (Miete - Kosten)</p>
                        <p className={clsx(
                            "hm-display text-2xl font-bold tracking-tight mt-1 hm-tnum",
                            stats.netProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                        )}>
                            {formatCurrency(stats.netProfit)}
                        </p>
                        <div className="mt-3 flex items-center font-mono text-xs border-t border-hm-rule pt-2">
                            <span className={clsx(
                                "flex items-center font-bold",
                                stats.growth >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                            )}>
                                {stats.growth >= 0 ? <TrendingUp className="mr-1 h-3.5 w-3.5" /> : <TrendingDown className="mr-1 h-3.5 w-3.5" />}
                                {stats.growth > 0 ? '+' : ''}{stats.growth}%
                            </span>
                            <span className="ml-2 text-hm-muted text-[11px]">vs Vormonat</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="rounded-[var(--hm-radius-card)] bg-hm-paper p-6 border border-hm-rule">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-hm-rule">
                    <div>
                        <h3 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                            Umsatzentwicklung (Letzte 6 Monate)
                        </h3>
                        <p className="text-xs font-mono text-hm-muted mt-0.5">
                            Realisierte Zahlungseingänge pro Monat im Vergleich
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                            Ø Bon: {formatCurrency(stats.averageRentalValue)}
                        </span>
                    </div>
                </div>

                <div className="flex h-56 items-end gap-3 sm:gap-6 pt-6">
                    {stats.monthlyRevenue.length > 0 ? (
                        stats.monthlyRevenue.map((item) => {
                            const height = (item.amount / maxAmount) * 100;
                            return (
                                <div key={item.month} className="group flex flex-1 flex-col justify-end gap-2 h-full">
                                    <div className="relative w-full h-full flex items-end">
                                        <div
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                            className="w-full rounded-t-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule group-hover:bg-hm-accent group-hover:border-hm-accent transition-colors relative"
                                        >
                                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-hm-ink text-hm-paper font-mono text-[11px] font-bold rounded-[var(--hm-radius-input)] px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md">
                                                {formatCurrency(item.amount)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-center font-mono text-xs uppercase text-hm-muted group-hover:text-hm-ink transition-colors">
                                        {item.month}
                                    </span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-xs uppercase tracking-wider text-hm-muted">
                            Keine Daten verfügbar
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions Section */}
            <div className="rounded-[var(--hm-radius-card)] bg-hm-paper border border-hm-rule overflow-hidden">
                <div className="px-6 py-4 border-b border-hm-rule flex flex-col md:flex-row md:items-center justify-between gap-4 bg-hm-paper">
                    <div className="flex items-center gap-2.5">
                        <Receipt className="w-4 h-4 text-hm-accent" />
                        <div>
                            <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                Letzte Finanztransaktionen
                            </h2>
                            <p className="text-xs font-mono text-hm-muted">
                                {filteredTransactions.length} von {stats.transactions.length} Buchungen angezeigt
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Tabs */}
                        <div className="inline-flex rounded-[var(--hm-radius-input)] p-1 bg-hm-paper-2 border border-hm-rule text-xs font-mono">
                            <button
                                onClick={() => setStatusFilter('ALL')}
                                className={clsx(
                                    "px-2.5 py-1 rounded-[var(--hm-radius-input)] transition-colors",
                                    statusFilter === 'ALL' ? "bg-hm-paper font-semibold text-hm-ink shadow-xs" : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Alle
                            </button>
                            <button
                                onClick={() => setStatusFilter('Paid')}
                                className={clsx(
                                    "px-2.5 py-1 rounded-[var(--hm-radius-input)] transition-colors",
                                    statusFilter === 'Paid' ? "bg-hm-paper font-semibold text-emerald-700 dark:text-emerald-400 shadow-xs" : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Bezahlt
                            </button>
                            <button
                                onClick={() => setStatusFilter('Pending')}
                                className={clsx(
                                    "px-2.5 py-1 rounded-[var(--hm-radius-input)] transition-colors",
                                    statusFilter === 'Pending' ? "bg-hm-paper font-semibold text-amber-700 dark:text-amber-400 shadow-xs" : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Offen
                            </button>
                        </div>

                        {/* Search input */}
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-hm-muted" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Kunde, Beleg, Kennzeichen..."
                                className="pl-9 pr-3 py-1.5 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono bg-hm-paper-2 text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors w-full sm:w-60"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-hm-paper-2 text-[11px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Vertrag / Datum</th>
                                <th className="px-6 py-3 font-semibold">Kunde</th>
                                <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                <th className="px-6 py-3 font-semibold">Zahlungsart</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Betrag (Brutto)</th>
                                <th className="px-6 py-3 font-semibold text-right">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-hm-rule">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center font-mono text-xs text-hm-muted uppercase tracking-wider">
                                        Keine Transaktionen für diese Auswahl gefunden.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-hm-paper-2/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs font-semibold text-hm-ink">
                                                #{tx.contractNumber}
                                            </div>
                                            <div className="font-mono text-[11px] text-hm-muted mt-0.5">
                                                {format(new Date(tx.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-xs text-hm-ink">
                                                {tx.customerName}
                                            </div>
                                            <div className="text-[11px] font-mono text-hm-muted">
                                                {tx.customerEmail}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs font-semibold text-hm-ink">
                                                {tx.carName}
                                            </div>
                                            <span className="inline-block mt-0.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-muted">
                                                {tx.plate}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-hm-muted">
                                            {tx.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.paymentStatus === 'Paid' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Bezahlt
                                                </span>
                                            ) : tx.paymentStatus === 'Pending' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                                    <Clock className="w-3 h-3" />
                                                    Offen
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                                                    <AlertCircle className="w-3 h-3" />
                                                    Teilzahlung
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-xs text-hm-ink hm-tnum">
                                            {formatCurrency(tx.totalAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/reservations/${tx.id}`}
                                                className="inline-flex items-center gap-1 p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors font-mono text-xs"
                                                title="Mietvertrag öffnen"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
