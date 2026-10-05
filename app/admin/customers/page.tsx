/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';

import { Crown, Gift, TrendingUp, Star, Users, Plus } from 'lucide-react';
import { differenceInDays } from 'date-fns';
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
            label: '≥ 10 Mieten',
        },
        {
            name: 'Stammkunden',
            value: customers.filter(c => c.tier === 'Stammkunde').length.toString(),
            icon: Star,
            label: '3-9 Mieten',
        },
        {
            name: 'Gesamtumsatz Kunden',
            value: `€${customers.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString('de-AT')}`,
            icon: TrendingUp,
            label: 'Lebenszeitwert',
        },
        {
            name: 'Gutschein-berechtigt',
            value: customers.filter(c => c.benefits.birthdayVoucher).length.toString(),
            icon: Gift,
            label: 'Treuebonus aktiv',
        },
    ];

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Operativ · Kundenkartei
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Kundenverwaltung
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        {customers.length} registrierte Kunden · Treuestufen & CRM
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/customers/new"
                        className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-hm-accent-ink transition-colors shadow-xs"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Neuer Kunde
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule transition-colors hover:border-hm-rule-strong flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between">
                            <div className="rounded-[var(--hm-radius-input)] p-2 bg-hm-paper-2 border border-hm-rule text-hm-ink">
                                <stat.icon className="h-4 w-4" />
                            </div>
                            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 text-hm-muted border border-hm-rule">
                                {stat.label}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">{stat.name}</p>
                            <p className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink mt-1 hm-tnum">
                                {stat.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Customer List Table */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                <CustomerTable initialCustomers={customers as any} />
            </div>
        </div>
    );
}
