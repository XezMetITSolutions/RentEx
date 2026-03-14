
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
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0c0c0e] overflow-x-hidden">
            <div className="p-6 md:p-12 max-w-[1600px] mx-auto space-y-12">
                {/* Premium Header */}
                <div className="relative group p-10 md:p-14 rounded-[4rem] overflow-hidden bg-white dark:bg-gray-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-gray-100 dark:border-gray-800">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-indigo-600 rounded-[2.25rem] flex items-center justify-center shadow-2xl shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-700">
                                <AlertTriangle className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Schaden <span className="text-indigo-600">Protokoll</span></h1>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] opacity-60">Fleet Condition Management System v2.0</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 w-full md:w-auto">
                            <Link 
                                href="/admin/damage/new" 
                                className="flex-1 md:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-2xl shadow-black/10 active:scale-95 group/btn"
                            >
                                <PlusIcon className="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-500" />
                                Neuer Eintrag
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Content */}
                <DamageManager initialRecords={records} />
            </div>
        </div>
    );
}

