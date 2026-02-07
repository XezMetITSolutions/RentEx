'use client';

import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';

interface FinanceStats {
    totalRevenue: number;
    pendingRevenue: number;
    monthlyRevenue: { month: string; amount: number }[];
    averageRentalValue: number;
    growth: number; // Percentage growth vs last month
}

export default function FinanceView({ stats }: { stats: FinanceStats }) {

    // Calculate max amount for chart scaling
    const maxAmount = Math.max(...stats.monthlyRevenue.map(m => m.amount), 1);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Finanzübersicht</h1>
                <div className="flex gap-2">
                    <select className="h-9 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm outline-none focus:border-blue-500 dark:text-gray-200">
                        <option>Diese Woche</option>
                        <option selected>Diesen Monat</option>
                        <option>Dieses Jahr</option>
                    </select>
                    <a
                        href="/api/admin/finance-export"
                        className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors inline-block"
                    >
                        Bericht exportieren
                    </a>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gesamteinnahmen</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(stats.totalRevenue)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className={clsx(
                            "flex items-center font-medium",
                            stats.growth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                            {stats.growth >= 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                            {stats.growth > 0 ? '+' : ''}{stats.growth}%
                        </span>
                        <span className="ml-2 text-gray-400">vs Vormonat</span>
                    </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ausstehend</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(stats.pendingRevenue)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-gray-400">Erwartet diesen Monat</span>
                    </div>
                </div>

                <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Durchschnitt / Vermietung</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(stats.averageRentalValue)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="flex items-center text-gray-500 dark:text-gray-400">
                            Pro aktiver Buchung
                        </span>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Einnahmen Übersicht (Letzte 6 Monate)</h3>
                <div className="flex h-64 items-end gap-2 sm:gap-4">
                    {stats.monthlyRevenue.length > 0 ? (
                        stats.monthlyRevenue.map((item) => {
                            const height = (item.amount / maxAmount) * 100;
                            return (
                                <div key={item.month} className="group flex flex-1 flex-col justify-end gap-2">
                                    <div className="relative w-full h-full flex items-end">
                                        <div
                                            style={{ height: `${Math.max(height, 2)}%` }} // Min 2% height
                                            className="w-full rounded-t-sm bg-blue-100 dark:bg-blue-900/40 transition-all group-hover:bg-blue-600 dark:group-hover:bg-blue-500 relative"
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.amount)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-center text-xs text-gray-500 dark:text-gray-400">{item.month}</span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Keine Daten verfügbar
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
