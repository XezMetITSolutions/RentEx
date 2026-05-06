import prisma from '@/lib/prisma';
import CustomerForm from '@/components/admin/CustomerForm';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customer = await prisma.customer.findUnique({
        where: { id: parseInt(id) }
    });

    if (!customer) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link 
                    href="/admin/customers"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Profil: {customer.firstName} {customer.lastName}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Kundendaten bearbeiten und verwalten
                    </p>
                </div>
            </div>

            <CustomerForm customer={customer} />
        </div>
    );
}
