import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { clsx } from 'clsx';
import prisma from '@/lib/prisma';

// Mock data for finance charts (until we have a real transactions table)
const monthlyRevenue = [
    { month: 'Jan', amount: 12500 },
    { month: 'Feb', amount: 15000 },
    { month: 'Mär', amount: 18200 },
    { month: 'Apr', amount: 14500 },
    { month: 'Mai', amount: 21000 },
    { month: 'Jun', amount: 24500 },
];

async function getFinanceStats() {
    const totalRevenue = await prisma.rental.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'Cancelled' } }
    });

    // Calculate pending revenue (Active + Pending)
    const pendingRevenue = await prisma.rental.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: ['Active', 'Pending'] } }
    });

    return {
        total: totalRevenue._sum.totalAmount || 0,
        pending: pendingRevenue._sum.totalAmount || 0,
        average: 450 // Hardcoded average for now
    };
}

export default async function FinancePage() {
    const stats = await getFinanceStats();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Finanzübersicht</h1>
                <div className="flex gap-2">
                    <select className="h-9 rounded-lg border border-gray-300 text-sm outline-none focus:border-blue-500">
                        <option>Diese Woche</option>
                        <option selected>Diesen Monat</option>
                        <option>Dieses Jahr</option>
                    </select>
                    <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                        Bericht exportieren
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Gesamteinnahmen</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(stats.total))}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="flex items-center text-green-600 font-medium">
                            <TrendingUp className="mr-1 h-4 w-4" />
                            +12.5%
                        </span>
                        <span className="ml-2 text-gray-400">vs Vormonat</span>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ausstehend</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(stats.pending))}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-gray-400">Erwartet diesen Monat</span>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Durchschnitt / Vermietung</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(stats.average)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="flex items-center text-red-600 font-medium">
                            <TrendingDown className="mr-1 h-4 w-4" />
                            -2.1%
                        </span>
                        <span className="ml-2 text-gray-400">vs Vormonat</span>
                    </div>
                </div>
            </div>

            {/* Revenue Chart (Mock visual) */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">Einnahmen Übersicht</h3>
                <div className="flex h-64 items-end gap-2 sm:gap-4">
                    {monthlyRevenue.map((item) => {
                        const height = (item.amount / 25000) * 100;
                        return (
                            <div key={item.month} className="group flex flex-1 flex-col justify-end gap-2">
                                <div
                                    style={{ height: `${height}%` }}
                                    className="w-full rounded-t-sm bg-blue-100 transition-all group-hover:bg-blue-600 relative"
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.amount)}
                                    </div>
                                </div>
                                <span className="text-center text-xs text-gray-500">{item.month}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
