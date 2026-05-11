import prisma from '@/lib/prisma';
import CustomerForm from '@/components/admin/CustomerForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewCustomerPage() {
    const countries = await prisma.country.findMany({
        orderBy: { nicename: 'asc' }
    });

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/customers"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Neuer Kunde</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Erstellen Sie einen neuen Kundendatensatz</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                <CustomerForm countries={countries} />
            </div>
        </div>
    );
}
