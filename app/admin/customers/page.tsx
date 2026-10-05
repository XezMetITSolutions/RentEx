/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';

import { Plus } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import Link from 'next/link';
import CustomerTable, { Customer } from './CustomerTable';

async function getCustomers(): Promise<Customer[]> {
    const customers = await prisma.customer.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            rentals: {
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    car: {
                        select: {
                            id: true,
                            brand: true,
                            model: true,
                            plate: true,
                        }
                    }
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
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            licenseNumber: customer.licenseNumber,
            createdAt: customer.createdAt,
            isActive: customer.isActive,
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
        <div className="max-w-[1440px] mx-auto space-y-6 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-hm-rule">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Operativ · Kundenkartei & CRM
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Kundenverwaltung
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        {customers.length} registrierte Kunden · Treuestufen & CRM-Management
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/customers/new"
                        className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-sm shadow-hm-accent/20"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Neuer Kunde</span>
                    </Link>
                </div>
            </div>

            {/* Interactive Customer Manager (Table, Cards, Filters, Search) */}
            <CustomerTable initialCustomers={customers} />
        </div>
    );
}
