import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';

import { Search, Mail, Phone, MapPin, Crown, Gift, Shield, Calendar, TrendingUp, Star, Award, FileText, Users, Plus } from 'lucide-react';
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

    return customers.map(customer => {
        const totalRentals = customer._count.rentals;
        const totalRevenue = customer.rentals.reduce((sum, r) => sum + Number(r.totalAmount), 0);
        const lastRental = customer.rentals[0];
        const daysSinceLastRental = lastRental ? differenceInDays(new Date(), new Date(lastRental.createdAt)) : null;

        let tier: 'VIP' | 'Stammkunde' | 'Neukunde' = 'Neukunde';
        if (totalRentals >= 10) tier = 'VIP';
        else if (totalRentals >= 3) tier = 'Stammkunde';

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

    const stats = [
        {
            name: 'VIP Kunden',
            value: customers.filter(c => c.tier === 'VIP').length.toString(),
            icon: Crown,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50',
        },
        {
            name: 'Stammkunden',
            value: customers.filter(c => c.tier === 'Stammkunde').length.toString(),
            icon: Star,
            color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50',
        },
        {
            name: 'Gesamtumsatz',
            value: `€${customers.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString('de-AT')}`,
            icon: TrendingUp,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50',
        },
        {
            name: 'Gutschein-berechtigt',
            value: customers.filter(c => c.benefits.birthdayVoucher).length.toString(),
            icon: Gift,
            color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50',
        },
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-10 px-4 sm:px-6">
            
            {/* Header Area (Clean SaaS Style) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-gray-400" />
                        Kundenverwaltung
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Verwalten Sie Ihren Kundenstamm, Treuestufen ve Umsatzeinblicke.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/customers/new"
                        className="flex items-center gap-2 rounded-lg bg-gray-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Neuer Kunde
                    </Link>
                </div>
            </div>

            {/* Stats Grid (Minimalist Cards) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-700"
                    >
                        <div className="flex items-center justify-between">
                            <div className={clsx('rounded-lg p-2 border', stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1 tracking-tight">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Customer List Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <CustomerTable initialCustomers={customers as any} />
            </div>
        </div>
    );
}
