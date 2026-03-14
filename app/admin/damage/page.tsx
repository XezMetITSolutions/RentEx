
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Schadenmanagement</h1>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fahrzeugzustand & Protokollierung</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link 
                            href="/admin/damage/new" 
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-900/10"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Schaden melden
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <DamageManager initialRecords={records} />
            </div>
        </div>
    );
}
