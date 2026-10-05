/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { Wallet, TrendingUp, TrendingDown, DollarSign, Download } from 'lucide-react';
import { clsx } from 'clsx';

interface FinanceStats {
    totalRevenue: number;
    pendingRevenue: number;
    monthlyRevenue: { month: string; amount: number }[];
    averageRentalValue: number;
    growth: number;
}

export default function FinanceView({ stats }: { stats: FinanceStats }) {
    const maxAmount = Math.max(...stats.monthlyRevenue.map(m => m.amount), 1);

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Finanzen · Bilanz & Cashflow
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Finanzübersicht
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Einnahmen, Zahlungsstatus & monatliche Kennzahlen
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <select className="h-9 px-3 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 font-mono text-xs text-hm-ink outline-hidden focus:border-hm-rule-strong transition-colors cursor-pointer">
                        <option>Diese Woche</option>
                        <option defaultValue="Diesen Monat">Diesen Monat</option>
                        <option>Dieses Jahr</option>
                    </select>
                    <a
                        href="/api/admin/finance-export"
                        className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-hm-accent-ink transition-colors shadow-xs"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Exportieren
                    </a>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper p-5 border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Wallet className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 text-hm-muted border border-hm-rule">
                            Realisiert
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Gesamteinnahmen</p>
                        <p className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink mt-1 hm-tnum">
                            {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(stats.totalRevenue)}
                        </p>
                        <div className="mt-3 flex items-center font-mono text-xs">
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

                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper p-5 border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <DollarSign className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 text-hm-muted border border-hm-rule">
                            Forderungen
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Ausstehende Zahlungen</p>
                        <p className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink mt-1 hm-tnum">
                            {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(stats.pendingRevenue)}
                        </p>
                        <div className="mt-3 font-mono text-[11px] text-hm-muted">
                            Offen in aktiven Verträgen
                        </div>
                    </div>
                </div>

                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper p-5 border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 text-hm-muted border border-hm-rule">
                            Ø Bon
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Durchschnitt / Vermietung</p>
                        <p className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink mt-1 hm-tnum">
                            {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(stats.averageRentalValue)}
                        </p>
                        <div className="mt-3 font-mono text-[11px] text-hm-muted">
                            Pro abgerechneter Buchung
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="rounded-[var(--hm-radius-card)] bg-hm-paper p-6 border border-hm-rule">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-hm-rule">
                    <h3 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                        Einnahmenübersicht (Letzte 6 Monate)
                    </h3>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                        Monatsumsatz netto
                    </span>
                </div>
                
                <div className="flex h-64 items-end gap-3 sm:gap-6 pt-6">
                    {stats.monthlyRevenue.length > 0 ? (
                        stats.monthlyRevenue.map((item) => {
                            const height = (item.amount / maxAmount) * 100;
                            return (
                                <div key={item.month} className="group flex flex-1 flex-col justify-end gap-2 h-full">
                                    <div className="relative w-full h-full flex items-end">
                                        <div
                                            style={{ height: `${Math.max(height, 4)}%` }}
                                            className="w-full rounded-t-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule group-hover:bg-hm-accent group-hover:border-hm-accent transition-colors relative"
                                        >
                                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-hm-ink text-hm-paper font-mono text-[11px] font-bold rounded-[var(--hm-radius-input)] px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md">
                                                {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(item.amount)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-center font-mono text-xs uppercase text-hm-muted group-hover:text-hm-ink transition-colors">{item.month}</span>
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
        </div>
    );
}
