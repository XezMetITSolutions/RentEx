
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Car } from 'lucide-react';
import NewDamageForm from '@/components/admin/NewDamageForm';

async function getCars() {
    return await prisma.car.findMany({
        where: { isActive: true },
        select: {
            id: true,
            brand: true,
            model: true,
            plate: true,
            checkInTemplate: true
        }
    });
}

export default async function NewDamagePage() {
    const cars = await getCars();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <Link 
                    href="/admin/damage" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    ZURÜCK ZUR ÜBERSICHT
                </Link>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                            <Car className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Schaden Melden</h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Neuen Vorfall manuell erfassen</p>
                        </div>
                    </div>

                    <NewDamageForm cars={cars} />
                </div>
            </div>
        </div>
    );
}
