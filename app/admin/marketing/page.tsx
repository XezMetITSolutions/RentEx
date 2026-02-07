
import prisma from '@/lib/prisma';
import { Tag, Plus, Trash, Edit, Percent, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

async function getCoupons() {
    return await prisma.discountCoupon.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

async function getRedeemedDiscountTotal() {
    const result = await prisma.rental.aggregate({
        _sum: { discountAmount: true },
        where: {
            status: { not: 'Cancelled' },
        },
    });
    return Number(result._sum.discountAmount ?? 0);
}

// Ensure this page is dynamic so it fetches fresh data
export const dynamic = 'force-dynamic';

export default async function MarketingPage() {
    const [coupons, redeemedValue] = await Promise.all([
        getCoupons(),
        getRedeemedDiscountTotal(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing & Gutscheine</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verwalten Sie Aktionscodes und Rabatte</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    Neuer Gutschein
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Stats Cards */}
                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-white/20 p-3">
                            <Tag className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-indigo-100">Aktive Kampagnen</p>
                            <h3 className="text-2xl font-bold">{coupons.filter(c => c.isActive).length}</h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 p-6 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-white/20 p-3">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-rose-100">Eingelöster Wert</p>
                            <h3 className="text-2xl font-bold">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(redeemedValue)}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-white/20 p-3">
                            <Tag className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-orange-100">Genutzte Gutscheine</p>
                            <h3 className="text-2xl font-bold">{coupons.reduce((acc, c) => acc + c.usedCount, 0)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Alle Gutscheine</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Rabatt</th>
                                <th className="px-6 py-4">Gültigkeit</th>
                                <th className="px-6 py-4">Nutzung</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Keine Gutscheine vorhanden. Erstellen Sie den ersten!
                                    </td>
                                </tr>
                            ) : (
                                coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-mono font-bold text-gray-700 dark:text-gray-200">
                                                    {coupon.code.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <span className="font-mono font-bold text-gray-900 dark:text-white">{coupon.code}</span>
                                                    <p className="text-xs text-gray-500">{coupon.description || 'Keine Beschreibung'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                                                {coupon.discountType === 'PERCENTAGE' ? (
                                                    <><Percent className="h-3 w-3" /> {Number(coupon.discountValue)}%</>
                                                ) : (
                                                    <><DollarSign className="h-3 w-3" /> €{Number(coupon.discountValue)}</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-xs">
                                                <Calendar className="h-3 w-3" />
                                                {coupon.validUntil
                                                    ? format(new Date(coupon.validUntil), 'dd. MMM yyyy', { locale: de })
                                                    : 'Unbegrenzt'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${Math.min(100, (coupon.usedCount / (coupon.usageLimit || 100)) * 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${coupon.isActive
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                                                }`}>
                                                {coupon.isActive ? 'Aktiv' : 'Inaktiv'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                                <Edit className="h-4 w-4" />
                                            </button>
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
