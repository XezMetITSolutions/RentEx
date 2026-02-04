import prisma from '@/lib/prisma';
import { Search, Mail, Phone, MapPin, Crown, Gift, Shield, Calendar, TrendingUp, Star, Award, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

async function getCustomers() {
    const customers = await prisma.customer.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            rentals: {
                orderBy: {
                    createdAt: 'desc'
                }
            },
            _count: {
                select: { rentals: true }
            }
        }
    });

    // Calculate customer metrics
    return customers.map(customer => {
        const totalRentals = customer._count.rentals;
        const totalRevenue = customer.rentals.reduce((sum, r) => sum + Number(r.totalAmount), 0);
        const lastRental = customer.rentals[0];
        const daysSinceLastRental = lastRental ? differenceInDays(new Date(), new Date(lastRental.createdAt)) : null;

        // Determine customer tier
        let tier: 'VIP' | 'Stammkunde' | 'Neukunde' = 'Neukunde';
        if (totalRentals >= 10) tier = 'VIP';
        else if (totalRentals >= 3) tier = 'Stammkunde';

        // Calculate benefits
        const benefits = {
            noDeposit: totalRentals >= 5,
            birthdayVoucher: totalRentals >= 3,
            prioritySupport: totalRentals >= 10,
            freeUpgrade: totalRentals >= 10,
            loyaltyDiscount: totalRentals >= 3 ? 10 : 0,
        };

        return {
            ...customer,
            tier,
            totalRentals,
            totalRevenue,
            lastRental,
            daysSinceLastRental,
            benefits
        };
    });
}

export default async function CustomersPage() {
    const customers = await getCustomers();

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'VIP': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
            case 'Stammkunde': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
        }
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case 'VIP': return Crown;
            case 'Stammkunde': return Star;
            default: return Award;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kundenverwaltung</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {customers.length} Kunden • {customers.filter(c => c.tier === 'VIP').length} VIP • {customers.filter(c => c.tier === 'Stammkunde').length} Stammkunden
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Kunde suchen..."
                            className="h-9 w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-9 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
                        />
                    </div>
                    <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                        + Neuer Kunde
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                            <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.filter(c => c.tier === 'VIP').length}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">VIP Kunden</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.filter(c => c.tier === 'Stammkunde').length}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Stammkunden</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                €{customers.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString('de-DE')}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Gesamtumsatz</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{customers.filter(c => c.benefits.birthdayVoucher).length}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Gutschein-berechtigt</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kunde</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kontakt</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statistik</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Vorteile</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Letzte Miete</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {customers.map((customer) => {
                                const TierIcon = getTierIcon(customer.tier);
                                return (
                                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        {/* Customer Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                    {customer.firstName[0]}{customer.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {customer.firstName} {customer.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Kunde seit {format(new Date(customer.createdAt), 'MMM yyyy', { locale: de })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                    <Mail className="h-3 w-3" />
                                                    {customer.email}
                                                </div>
                                                {customer.licenseNumber && (
                                                    <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                                                        <FileText className="w-3 h-3" />
                                                        {customer.licenseNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Tier */}
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm',
                                                getTierColor(customer.tier)
                                            )}>
                                                <TierIcon className="h-3 w-3" />
                                                {customer.tier}
                                            </span>
                                        </td>

                                        {/* Statistics */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {customer.totalRentals} Vermietungen
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    €{customer.totalRevenue.toLocaleString('de-DE')} Umsatz
                                                </p>
                                            </div>
                                        </td>

                                        {/* Benefits */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {customer.benefits.noDeposit && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                                        <Shield className="h-3 w-3" />
                                                        Keine Kaution
                                                    </span>
                                                )}
                                                {customer.benefits.birthdayVoucher && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
                                                        <Gift className="h-3 w-3" />
                                                        Geburtstagsgutschein
                                                    </span>
                                                )}
                                                {customer.benefits.loyaltyDiscount > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                                                        {customer.benefits.loyaltyDiscount}% Rabatt
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Last Rental */}
                                        <td className="px-6 py-4">
                                            {customer.lastRental ? (
                                                <div className="text-xs">
                                                    <p className="text-gray-900 dark:text-white font-medium">
                                                        {format(new Date(customer.lastRental.createdAt), 'dd.MM.yyyy', { locale: de })}
                                                    </p>
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        vor {customer.daysSinceLastRental} Tagen
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Keine Miete</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                    Profil
                                                </button>
                                                <button className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                    Historie
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
