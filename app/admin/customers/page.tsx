import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Search, Mail, Phone, MoreVertical, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

async function getCustomers() {
    return await prisma.customer.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            _count: {
                select: { rentals: true }
            }
        }
    });
}

export default async function CustomersPage() {
    const customers = await getCustomers();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Kunden</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Verwalten Sie Ihre Kundenbasis</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin/customers/new"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Neuer Kunde
                    </Link>
                </div>
            </div>

            {/* Search Bar - Visual only for now, could be made functional with URL search params */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Suchen nach Name, Email oder Telefon..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase font-medium text-zinc-500 dark:text-zinc-400">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Kontakt</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Mieten</th>
                                <th className="px-6 py-3">Registriert am</th>
                                <th className="px-6 py-3 text-right">Aktion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                            {customer.firstName} {customer.lastName}
                                        </div>
                                        {customer.driverLicense && (
                                            <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                                                <FileText className="w-3 h-3" />
                                                {customer.driverLicense}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs">
                                                <Mail className="w-3 h-3" />
                                                {customer.email}
                                            </div>
                                            {customer.phone && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Phone className="w-3 h-3" />
                                                    {customer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                                            Aktiv
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-zinc-900 dark:text-zinc-100 font-medium">{customer._count.rentals}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {format(new Date(customer.createdAt), 'dd.MM.yyyy', { locale: de })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/customers/${customer.id}`}
                                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full inline-flex transition-colors text-zinc-500"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                                        Keine Kunden gefunden.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
