import prisma from '@/lib/prisma';
import MaintenanceForm from './MaintenanceForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getCars() {
    return await prisma.car.findMany({
        orderBy: { brand: 'asc' },
        select: { id: true, brand: true, model: true, plate: true }
    });
}

export default async function NewMaintenancePage() {
    const cars = await getCars();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Link
                    href="/admin/maintenance"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Neuer Wartungseintrag</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Erfassen Sie eine durchgeführte Wartung</p>
                </div>
            </div>

            <MaintenanceForm cars={cars} />
        </div>
    );
}
