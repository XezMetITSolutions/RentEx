
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
        <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#08080a] overflow-x-hidden selection:bg-indigo-500 selection:text-white">
            <div className="p-8 md:p-16 max-w-[1700px] mx-auto space-y-20">
                {/* ULTIMATE HEADER */}
                <div className="relative group p-14 md:p-20 rounded-[5rem] overflow-hidden bg-white dark:bg-gray-900 shadow-[0_60px_130px_-30px_rgba(0,0,0,0.08)] border border-white/60 dark:border-gray-800 animate-in fade-in slide-in-from-top-12 duration-1000">
                    <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-indigo-500/10 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/2 group-hover:scale-110 transition-transform duration-[3000ms]"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12">
                        <div className="flex items-center gap-10">
                            <div className="w-24 h-24 bg-gray-950 dark:bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-black/20 dark:shadow-white/10 group-hover:rotate-6 transition-transform duration-700">
                                <AlertTriangle className="w-12 h-12 text-white dark:text-gray-900" />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] opacity-80">Condition Intel Intelligence</span>
                                <h1 className="text-5xl md:text-7xl font-black text-gray-950 dark:text-white uppercase tracking-tighter leading-none">Fleet <span className="text-indigo-600">Damage</span> Control</h1>
                                <div className="flex items-center gap-4">
                                    <div className="h-0.5 w-12 bg-gray-100 dark:bg-gray-800"></div>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] opacity-50">Operational Diagnostic Dashboard v3.0</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 w-full xl:w-auto">
                            <Link 
                                href="/admin/damage/new" 
                                className="flex-1 xl:flex-none flex items-center justify-center gap-4 px-12 py-6 bg-indigo-600 text-white rounded-[2.25rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all shadow-2xl shadow-indigo-500/30 active:scale-95 group/btn"
                            >
                                <PlusIcon className="w-6 h-6 group-hover/btn:rotate-180 transition-transform duration-700" />
                                Initiate Report
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Ultimate Dashboard Content */}
                <DamageManager initialRecords={records} />
            </div>
        </div>
    );
}


