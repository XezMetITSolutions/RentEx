import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';

import { Search, Mail, Phone, MapPin, Crown, Gift, Shield, Calendar, TrendingUp, Star, Award, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

import Link from 'next/link';
import CustomerTable from './CustomerTable';

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
            noDeposit: totalRentals >= 5 || customer.country === 'Österreich',
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
                    <Link
                        href="/admin/customers/new"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        + Neuer Kunde
                    </Link>
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
                                €{customers.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString('de-AT')}
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
            <CustomerTable initialCustomers={customers as any} />
        </div>
    );
}
