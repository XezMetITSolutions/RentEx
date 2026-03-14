
import prisma from '@/lib/prisma';
import DamageManager from '@/components/admin/DamageManager';
import { AlertTriangle, Plus as PlusIcon } from 'lucide-react';
import Link from 'next/link';

async function getDamageRecords() {
    const rawRecords = await prisma.damageRecord.findMany({
        where: {
            NOT: {
                type: {
                    in: ['PROOF_MILEAGE', 'PROOF_FUEL']
                }
            }
        },
        include: {
            car: {
                select: {
                    brand: true,
                    model: true,
                    plate: true,
                    imageUrl: true,
                    checkInTemplate: true,
                    id: true
                }
            },
            rental: {
                include: {
                    customer: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        },
        orderBy: { reportedDate: 'desc' }
    });

    // Serialize Decimal and Dates for Client Component
    return rawRecords.map(r => ({
        ...r,
        repairCost: r.repairCost ? Number(r.repairCost) : null,
        reportedDate: r.reportedDate.toISOString(),
        accidentDate: r.accidentDate ? r.accidentDate.toISOString() : null,
    }));
}

export const dynamic = 'force-dynamic';



export default async function DamagePage() {
    const records = await getDamageRecords();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10">
            <div className="max-w-[1400px] mx-auto space-y-8">
                {/* Minimalist Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">Schadenmanagement</h1>
                        </div>
                        <p className="text-sm text-gray-400 font-medium px-1">Fahrzeugzustand & Protokollierung</p>
                    </div>
                    
                    <Link 
                        href="/admin/damage/new" 
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold hover:scale-[1.02] transition-all shadow-md"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Schaden melden
                    </Link>
                </div>

                {/* Main Content */}
                <DamageManager initialRecords={records} />
            </div>
        </div>
    );
}



