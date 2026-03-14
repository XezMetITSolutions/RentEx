
import prisma from '@/lib/prisma';
import DamageManager from '@/components/admin/DamageManager';
import { AlertTriangle, Plus as PlusIcon } from 'lucide-react';
import Link from 'next/link';


import DamageList from '@/components/admin/damage/DamageList';

async function getDamageRecords() {
    const rawRecords = await prisma.damageRecord.findMany({
        orderBy: { reportedDate: 'desc' },
        include: {
            car: {
                select: {
                    id: true,
                    brand: true,
                    model: true,
                    plate: true,
                    imageUrl: true,
                }
            },
            rental: {
                select: {
                    id: true,
                    customer: {
                        select: {
                            firstName: true,
                            lastName: true,
                        }
                    }
                }
            }
        }
    });

    return rawRecords.map(record => ({
        ...record,
        reportedDate: record.reportedDate.toISOString(),
    }));
}

export const dynamic = 'force-dynamic';

export default async function DamagePage() {
    const records = await getDamageRecords();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-rose-600" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Schaden Management</h1>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] opacity-60">Fleet Condition Overview</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                        <Link 
                            href="/admin/damage/new" 
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-900/10"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Schaden melden
                        </Link>
                    </div>
                </div>

                {/* Dashboard Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gesamtanzahl</p>
                        <p className="text-4xl font-black text-gray-900 dark:text-white">{records.length}</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Offene Fälle</p>
                        <p className="text-4xl font-black text-rose-600">{records.filter(r => r.status === 'open').length}</p>
                    </div>
                    <div className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Behoben</p>
                        <p className="text-4xl font-black text-emerald-600">{records.filter(r => r.status === 'repaired').length}</p>
                    </div>
                </div>

                {/* Damage Records List */}
                <DamageList records={records} />
            </div>
        </div>
    );
}
