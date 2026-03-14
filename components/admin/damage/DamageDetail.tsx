'use client';

import React, { useState, useEffect } from 'react';
import { 
    AlertTriangle, 
    Calendar, 
    ChevronLeft, 
    MapPin, 
    User,
    Trash2,
    Camera,
    CreditCard,
    Info,
    Loader2,
    Maximize2,
    CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateDamageStatus, deleteDamageRecord, updateDamageRepairCost } from '@/app/actions/damage-admin';
import { getTemplateMapping } from '@/app/actions/check-in-setup';

interface DamageRecord {
    id: number;
    carId: number;
    rentalId: number | null;
    type: string;
    description: string | null;
    severity: string | null;
    photoUrl: string | null;
    locationOnCar: string | null;
    xPosition: number | null;
    yPosition: number | null;
    reportedDate: string | Date;
    status: string;
    repairCost: number | null;
    car: {
        id: number;
        brand: string;
        model: string;
        plate: string;
        imageUrl: string | null;
        checkInTemplate: string | null;
    };
    rental: {
        customer: {
            firstName: string;
            lastName: string;
        } | null;
    } | null;
}

export default function DamageDetail({ initialRecord }: { initialRecord: DamageRecord }) {
    const [record, setRecord] = useState<DamageRecord>(initialRecord);
    const [activeView, setActiveView] = useState<'summary' | 'front' | 'back' | 'left' | 'right'>('summary');
    const [viewImages, setViewImages] = useState<Record<string, string>>({});
    const [loadingImages, setLoadingImages] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (record.car.checkInTemplate) {
            const load = async () => {
                setLoadingImages(true);
                try {
                    const mapping = await getTemplateMapping(record.car.checkInTemplate!);
                    setViewImages(mapping);
                } catch (error) {
                    console.error("Failed to load images");
                } finally {
                    setLoadingImages(false);
                }
            };
            load();
        }
    }, [record.car.id]);

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateDamageStatus(record.id, newStatus);
            setRecord(prev => ({ ...prev, status: newStatus }));
            router.refresh();
        } catch (error) {
            alert("Fehler");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Löschen?")) return;
        try {
            await deleteDamageRecord(record.id);
            router.push('/admin/damage');
            router.refresh();
        } catch (error) {
            alert("Fehler");
        }
    };

    const handleCostUpdate = async (cost: number) => {
        try {
            await updateDamageRepairCost(record.id, cost);
            setRecord(prev => ({ ...prev, repairCost: cost }));
            router.refresh();
        } catch (error) {
            alert("Fehler");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
            <Link 
                href="/admin/damage" 
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-500 transition-colors uppercase tracking-widest"
            >
                <ChevronLeft className="w-5 h-5" />
                Zurück zur Übersicht
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Area */}
                <div className="lg:col-span-12 xl:col-span-7 bg-white dark:bg-gray-900 rounded-[3rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                        {['summary', 'front', 'back', 'left', 'right'].map(v => (
                            <button
                                key={v}
                                onClick={() => setActiveView(v as any)}
                                className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest whitespace-nowrap ${
                                    activeView === v ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    <div className="relative aspect-video flex items-center justify-center bg-gray-50/50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8">
                        {activeView === 'summary' ? (
                            <div className="relative w-full max-w-xl aspect-video flex items-center justify-center">
                                <svg viewBox="0 0 400 200" className="w-full h-full text-gray-200 dark:text-gray-700 stroke-current fill-none">
                                    <path d="M50,100 C50,150 80,180 200,180 C320,180 350,150 350,100 C350,50 320,20 200,20 C80,20 50,50 50,100 Z" strokeWidth="2" />
                                    <rect x="120" y="50" width="160" height="100" rx="20" strokeWidth="1" className="opacity-30" />
                                    {record && (
                                        <circle 
                                            cx={`${record.xPosition || 50}%`} 
                                            cy={`${record.yPosition || 50}%`} 
                                            r="12" 
                                            className="fill-red-600 animate-pulse ring-8 ring-red-500/10" 
                                        />
                                    )}
                                </svg>
                            </div>
                        ) : (
                            <div className="w-full h-full relative flex items-center justify-center">
                                {loadingImages ? (
                                    <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                                ) : viewImages[activeView] ? (
                                    <div className="relative w-full h-full">
                                        <img src={viewImages[activeView]} className="w-full h-full object-contain rounded-2xl" alt="" />
                                        {record.locationOnCar === activeView && (
                                            <div 
                                                className="absolute w-12 h-12 -ml-6 -mt-6 bg-red-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white ring-8 ring-red-500/10"
                                                style={{ left: `${record.xPosition}%`, top: `${record.yPosition}%` }}
                                            >
                                                <AlertTriangle className="w-6 h-6 animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4 text-gray-300">
                                        <Camera className="w-16 h-16 mx-auto opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-50">Kein Foto verfügbar</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-8">
                    {/* Header Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight break-words">
                                    {record.type}
                                </h1>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-2">#{record.id.toString().padStart(4, '0')}</p>
                            </div>
                            <button onClick={handleDelete} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-1">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Fahrzeug</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{record.car.brand} {record.car.model}</p>
                                <p className="text-[10px] font-bold text-blue-600 uppercase">{record.car.plate}</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-1">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Datum</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{format(new Date(record.reportedDate), 'dd.MM.yyyy')}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Status & Abwicklung</label>
                                <select 
                                    value={record.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className={`w-full p-4 rounded-2xl border-none outline-none text-xs font-black uppercase tracking-widest cursor-pointer transition-all ${
                                        record.status === 'repaired' ? 'bg-green-600 text-white shadow-xl shadow-green-500/20' : 'bg-rose-600 text-white shadow-xl shadow-rose-500/20'
                                    }`}
                                >
                                    <option value="open">⚠️ Offen / Ausstehend</option>
                                    <option value="repaired">✅ Instandgesetzt</option>
                                    <option value="ignored">➖ Abgehakt / Ignoriert</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Geschätzte Kosten (€)</label>
                                <div className="relative group">
                                    <input 
                                        type="number"
                                        defaultValue={record.repairCost || ''}
                                        onBlur={(e) => handleCostUpdate(Number(e.target.value))}
                                        placeholder="0.00"
                                        className="w-full pl-6 pr-12 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-xl font-black text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                    <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-500 opacity-20" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                        <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2"><Info className="w-4 h-4" /> Protokoll-Details</h3>
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-l-[6px] border-indigo-600 italic text-sm text-gray-600 dark:text-gray-300 leading-relaxed shadow-inner">
                            "{record.description || 'Der Vorfall wurde ohne zusätzliche Beschreibung im Protokoll erfasst.'}"
                        </div>
                    </div>

                    {/* Customer Linked */}
                    <div className="bg-gray-900 text-white p-8 rounded-[3rem] flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-transform">
                                <User className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Erfasst durch</p>
                                <p className="text-xl font-black uppercase tracking-tighter">
                                    {record.rental?.customer ? `${record.rental.customer.firstName} ${record.rental.customer.lastName}` : 'System Admin'}
                                </p>
                            </div>
                        </div>
                        {record.rentalId && (
                            <Link href={`/admin/reservations/${record.rentalId}`} className="p-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-xl backdrop-blur-xl transition-all">
                                <Maximize2 className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Evidence Photo */}
            {record.photoUrl && (
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4">Beweissicherung / Foto</h3>
                    <div className="relative group rounded-[3.5rem] overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-xl aspect-[16/10]">
                        <img src={record.photoUrl} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110" alt="Beweis" />
                        <a href={record.photoUrl} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                            <div className="p-6 bg-white/20 rounded-full text-white"><Maximize2 className="w-10 h-10" /></div>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
