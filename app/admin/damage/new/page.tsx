
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
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0c0c0e] p-6 md:p-12 overflow-x-hidden">
            <div className="max-w-5xl mx-auto space-y-10">
                <div className="flex items-center justify-between">
                    <Link 
                        href="/admin/damage" 
                        className="group inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 rounded-2xl text-[10px] font-black text-gray-400 hover:text-indigo-600 transition-all border border-gray-100 dark:border-gray-800 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        ZURÜCK ZUR ÜBERSICHT
                    </Link>
                    
                    <div className="hidden md:block">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Protokoll-Entwurf v2.0</p>
                    </div>
                </div>

                <div className="relative group p-12 md:p-16 rounded-[4rem] overflow-hidden bg-white dark:bg-gray-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-700">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="relative z-10 space-y-12">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-indigo-600 rounded-[2.25rem] flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                                <Car className="w-10 h-10 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Vorfall <span className="text-indigo-600">Erfassen</span></h1>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] opacity-60">Manueller Schadensbericht für die Flotte</p>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 dark:bg-gray-800/50 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800">
                            <NewDamageForm cars={cars} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

