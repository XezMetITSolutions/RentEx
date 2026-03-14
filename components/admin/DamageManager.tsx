'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Camera,
    X,
    Trash2,
    ChevronRight,
    MapPin,
    Calendar,
    User,
    ArrowRight,
    Loader2,
    Plus,
    Maximize2,
    ArrowUpRight,
    ShieldAlert,
    CircleDashed,
    Wrench,
    Image as ImageIcon,
    LayoutDashboard,
    CarFront,
    Activity,
    Navigation,
    ScanLine,
    ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
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

interface Props {
    initialRecords: DamageRecord[];
}

export default function DamageManager({ initialRecords }: Props) {
    const [records, setRecords] = useState<DamageRecord[]>(initialRecords);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
    const [activeView, setActiveView] = useState<'summary' | 'front' | 'back' | 'left' | 'right'>('summary');
    const [viewImages, setViewImages] = useState<Record<string, string>>({});
    const [loadingImages, setLoadingImages] = useState(false);

    const selectedRecord = useMemo(() => 
        records.find(r => r.id === selectedRecordId), 
    [records, selectedRecordId]);

    useEffect(() => {
        setRecords(initialRecords);
    }, [initialRecords]);

    useEffect(() => {
        if (selectedRecord?.car.checkInTemplate) {
            const load = async () => {
                setLoadingImages(true);
                try {
                    const mapping = await getTemplateMapping(selectedRecord.car.checkInTemplate!);
                    setViewImages(mapping);
                } catch (error) {
                    console.error("Failed to load template images");
                } finally {
                    setLoadingImages(false);
                }
            };
            load();
        } else {
            setViewImages({});
        }
    }, [selectedRecord?.car.id]);

    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesSearch = 
                r.car.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (r.rental?.customer && `${r.rental.customer.firstName} ${r.rental.customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [records, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        const open = initialRecords.filter(r => r.status === 'open').length;
        const total = initialRecords.length;
        const repairCost = initialRecords.reduce((acc, curr) => acc + (Number(curr.repairCost) || 0), 0);
        return { open, total, repairCost };
    }, [initialRecords]);

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await updateDamageStatus(id, newStatus);
            setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            alert("Fehler beim Status-Update");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Datensatz permanent löschen?")) return;
        try {
            await deleteDamageRecord(id);
            setRecords(prev => prev.filter(r => r.id !== id));
            if (selectedRecordId === id) setSelectedRecordId(null);
        } catch (error) {
            alert("Löschen fehlgeschlagen");
        }
    };

    const handleCostUpdate = async (id: number, cost: number) => {
        try {
            await updateDamageRepairCost(id, cost);
            setRecords(prev => prev.map(r => r.id === id ? { ...r, repairCost: cost } : r));
        } catch (error) {
            alert("Kosten konnten nicht aktualisiert werden");
        }
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-1000">
            {/* Minimalist Glass Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Offene Fälle', val: stats.open, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50/30' },
                    { label: 'Fahrzeuge im Check', val: stats.total, icon: ScanLine, color: 'text-indigo-500', bg: 'bg-indigo-50/30' },
                    { label: 'Gesch. Gesamtkosten', val: `${stats.repairCost.toLocaleString()} €`, icon: Wrench, color: 'text-emerald-500', bg: 'bg-emerald-50/30' }
                ].map((s, i) => (
                    <div key={i} className={`p-8 rounded-[3rem] ${s.bg} backdrop-blur-3xl border border-white/40 dark:border-gray-800 flex items-center justify-between transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/[0.03]`}>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{s.label}</p>
                            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{s.val}</p>
                        </div>
                        <div className="w-16 h-16 rounded-[1.75rem] bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                            <s.icon className={`w-7 h-7 ${s.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 min-h-[800px] items-start pb-20">
                {/* MODERN LIST SIDEBAR */}
                <div className="xl:col-span-4 flex flex-col gap-6 h-[calc(100vh-18rem)]">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-gray-100 dark:border-gray-800 space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Suchen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </div>
                        <div className="flex gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                             {['all', 'open', 'repaired'].map(f => (
                                 <button
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${statusFilter === f ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-lg shadow-black/5' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                                 >
                                     {f}
                                 </button>
                             ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                        {filteredRecords.map((record) => (
                            <div 
                                key={record.id}
                                onClick={() => setSelectedRecordId(record.id)}
                                className={`p-8 rounded-[3rem] cursor-pointer transition-all relative overflow-hidden group ${selectedRecordId === record.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30' : 'bg-white dark:bg-gray-900 shadow-xl shadow-black/[0.01] hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:border-indigo-100 dark:hover:border-indigo-900'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h4 className={`font-black uppercase tracking-tighter text-lg leading-none ${selectedRecordId === record.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                            {record.car.brand} {record.car.model}
                                        </h4>
                                        <span className={`text-[10px] font-black tracking-widest uppercase opacity-60 ${selectedRecordId === record.id ? 'text-white/80' : 'text-gray-400'}`}>{record.car.plate}</span>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                        selectedRecordId === record.id ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                        {record.severity || 'Medium'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-6">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedRecordId === record.id ? 'bg-white/20' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'}`}>
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedRecordId === record.id ? 'text-white/70' : 'text-gray-400'}`}>
                                        {format(new Date(record.reportedDate), 'dd.MM.yyyy')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* VISUAL & INTERACTIVE AREA */}
                <div className="xl:col-span-8 flex flex-col gap-8">
                    {selectedRecord ? (
                        <>
                            {/* Blueprint View Container */}
                            <div className="bg-white dark:bg-gray-900 rounded-[4rem] shadow-2xl shadow-black/[0.03] border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-700">
                                <div className="flex p-4 gap-4 border-b border-gray-50 dark:border-gray-800">
                                    {['summary', 'front', 'back', 'left', 'right'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setActiveView(v as any)}
                                            className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-[1.75rem] ${
                                                activeView === v 
                                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' 
                                                : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                            }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-20 flex items-center justify-center relative min-h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
                                    {activeView === 'summary' ? (
                                        <div className="relative w-full max-w-2xl group/car">
                                            {/* Artful Car Layout SVG */}
                                            <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full scale-150 animate-pulse group-hover/car:opacity-100 opacity-60"></div>
                                            <svg viewBox="0 0 500 280" className="w-full h-full relative z-10 transition-all duration-1000 group-hover/car:scale-110">
                                                <defs>
                                                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="transparent" />
                                                        <stop offset="50%" stopColor="currentColor" />
                                                        <stop offset="100%" stopColor="transparent" />
                                                    </linearGradient>
                                                </defs>
                                                <path d="M50,140 C50,220 120,260 250,260 C380,260 450,220 450,140 C450,60 380,20 250,20 C120,20 50,60 50,140 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-100 dark:text-gray-800" />
                                                <path d="M80,140 L420,140" stroke="url(#lineGrad)" strokeWidth="0.5" className="text-indigo-500/20" />
                                                <path d="M250,30 L250,250" stroke="url(#lineGrad)" strokeWidth="0.5" className="text-indigo-500/20" transform="rotate(90, 250, 140)" />
                                                <rect x="150" y="80" width="200" height="120" rx="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-100/30 dark:text-indigo-900/20" />
                                                {/* Modern Stylized Hubs */}
                                                <circle cx="120" cy="80" r="12" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-gray-800" />
                                                <circle cx="380" cy="80" r="12" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-gray-800" />
                                                <circle cx="120" cy="200" r="12" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-gray-800" />
                                                <circle cx="380" cy="200" r="12" fill="none" stroke="currentColor" strokeWidth="4" className="text-gray-100 dark:text-gray-800" />
                                            </svg>
                                            
                                            {selectedRecord && (
                                                <div 
                                                    className="absolute w-20 h-20 -ml-10 -mt-10 flex items-center justify-center z-20 group-hover/car:scale-125 transition-all duration-700"
                                                    style={{ left: `${selectedRecord.xPosition || 50}%`, top: `${selectedRecord.yPosition || 50}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping duration-[3000ms]"></div>
                                                    <div className="w-full h-full bg-rose-600 rounded-full border-[8px] border-white dark:border-gray-900 shadow-2xl shadow-rose-500/40 flex items-center justify-center text-white ring-[15px] ring-rose-500/5">
                                                        <AlertTriangle className="w-8 h-8 animate-pulse" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative max-w-2xl w-full">
                                            {loadingImages ? (
                                                <div className="flex flex-col items-center gap-8">
                                                    <Loader2 className="w-16 h-16 animate-spin text-indigo-500" />
                                                    <p className="text-[12px] font-black text-gray-400 uppercase tracking-[0.4em]">Loading Module...</p>
                                                </div>
                                            ) : viewImages[activeView] ? (
                                                <div className="relative animate-in slide-in-from-bottom-12 duration-1000 group/img">
                                                    <img 
                                                        src={viewImages[activeView]} 
                                                        className="w-full h-auto rounded-[4rem] shadow-[-30px_60px_100px_rgba(0,0,0,0.1)] border-[20px] border-white dark:border-gray-800 bg-white" 
                                                        alt={activeView}
                                                    />
                                                    {selectedRecord.locationOnCar === activeView && (
                                                        <div 
                                                            className="absolute w-24 h-24 -ml-12 -mt-12 flex items-center justify-center z-20"
                                                            style={{ left: `${selectedRecord.xPosition}%`, top: `${selectedRecord.yPosition}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-rose-500/30 rounded-full animate-ping"></div>
                                                            <div className="w-full h-full bg-rose-600 rounded-full border-[10px] border-white dark:border-gray-900 shadow-[0_0_100px_rgba(225,29,72,0.8)] flex items-center justify-center text-white ring-[30px] ring-rose-500/10">
                                                                <AlertTriangle className="w-10 h-10" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-40 px-10 bg-gray-50/50 dark:bg-gray-800/30 rounded-[5rem] border-4 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center gap-8 hover:scale-[0.98] transition-all cursor-pointer">
                                                    <Camera className="w-16 h-16 text-gray-200 dark:text-gray-700 opacity-50" />
                                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">No Visual Assets Available</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="absolute bottom-10 left-10">
                                        <div className="bg-indigo-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl shadow-indigo-500/30 flex items-center gap-4">
                                            <Navigation className="w-5 h-5 text-indigo-300" />
                                            <div>
                                                <p className="text-[8px] font-black text-indigo-200 uppercase tracking-widest mb-0.5">Location Anchor</p>
                                                <p className="text-sm font-black uppercase tracking-tighter">{selectedRecord.locationOnCar || 'External Zone'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MODERN DETAILS GRID */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                                {/* MAIN INFO CARD */}
                                <div className="lg:col-span-12 xl:col-span-7 bg-white dark:bg-gray-900 p-12 rounded-[4rem] shadow-2xl shadow-black/[0.04] border border-gray-100 dark:border-gray-800 space-y-12 animate-in slide-in-from-left-8 duration-1000 bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-900/50">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4">
                                            <div className="inline-flex items-center gap-2 px-6 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-full border border-rose-100 dark:border-rose-800">
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{selectedRecord.severity || 'Normal'} Priority</span>
                                            </div>
                                            <h3 className="text-6xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none break-words">
                                                {selectedRecord.type}
                                            </h3>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(selectedRecord.id)}
                                            className="w-20 h-20 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-rose-600 hover:text-white rounded-[2.5rem] transition-all flex items-center justify-center hover:shadow-2xl hover:shadow-rose-500/30 group"
                                        >
                                            <Trash2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                        </button>
                                    </div>

                                    <div className="p-10 bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-gray-50 dark:border-gray-700/50 relative">
                                        <p className="text-lg font-bold text-gray-600 dark:text-gray-300 leading-relaxed italic opacity-90 indent-10 relative z-10">
                                            "{selectedRecord.description || 'No descriptive summary provided by the field technician.'}"
                                        </p>
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <Activity className="w-32 h-32 text-indigo-600 rotate-12" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] px-4">Life-Cycle Status</label>
                                            <div className="relative group">
                                                <select 
                                                    value={selectedRecord.status}
                                                    onChange={(e) => handleStatusChange(selectedRecord.id, e.target.value)}
                                                    className={`w-full px-10 py-6 rounded-[2.5rem] border-none text-[11px] font-black uppercase tracking-[0.2em] focus:ring-[15px] focus:ring-current/10 transition-all appearance-none cursor-pointer shadow-xl ${
                                                        selectedRecord.status === 'repaired' ? 'bg-emerald-600 text-white' : 
                                                        selectedRecord.status === 'ignored' ? 'bg-slate-800 text-white' : 'bg-rose-600 text-white'
                                                    }`}
                                                >
                                                    <option value="open">❌ Active Case</option>
                                                    <option value="repaired">✅ Resolved</option>
                                                    <option value="ignored">➖ Archives</option>
                                                </select>
                                                <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 rotate-90" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] px-4 flex justify-between">Financial Impact <span className="text-[10px] opacity-40">EUR</span></label>
                                            <div className="relative group">
                                                <input 
                                                    type="number"
                                                    defaultValue={selectedRecord.repairCost ? Number(selectedRecord.repairCost) : ''}
                                                    onBlur={(e) => handleCostUpdate(selectedRecord.id, Number(e.target.value))}
                                                    placeholder="0.00"
                                                    className="w-full px-10 py-6 bg-gray-50 dark:bg-gray-800 border-none rounded-[2.5rem] text-xl font-black text-gray-900 dark:text-white focus:ring-[15px] focus:ring-indigo-500/10 transition-all outline-none shadow-inner group-hover:bg-white dark:group-hover:bg-gray-700"
                                                />
                                                <ArrowDownRight className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 text-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* MEDIA & CONTEXT SECTION */}
                                <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-8 h-full animate-in slide-in-from-right-8 duration-1000 delay-300">
                                    <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-xl shadow-black/[0.04] border border-gray-100 dark:border-gray-800 space-y-10 flex-1 flex flex-col">
                                        <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.5em]">Field Evidence</p>
                                        
                                        {selectedRecord.photoUrl ? (
                                            <div className="relative group rounded-[3.5rem] overflow-hidden bg-gray-50 dark:bg-gray-800 aspect-[5/4] shadow-2xl ring-[12px] ring-white dark:ring-gray-800">
                                                <img 
                                                    src={selectedRecord.photoUrl} 
                                                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-125" 
                                                    alt="Field Proof"
                                                />
                                                <a 
                                                    href={selectedRecord.photoUrl} 
                                                    target="_blank" 
                                                    className="absolute inset-0 bg-indigo-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 backdrop-blur-xl"
                                                >
                                                    <div className="w-24 h-24 bg-white/20 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 flex items-center justify-center text-white scale-50 group-hover:scale-100 transition-transform duration-500">
                                                        <Maximize2 className="w-10 h-10" />
                                                    </div>
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="aspect-[5/4] flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/50 rounded-[3.5rem] border-4 border-dashed border-gray-100 dark:border-gray-700 opacity-50 group hover:opacity-100 hover:scale-[0.98] transition-all">
                                                <ImageIcon className="w-20 h-20 text-gray-200 dark:text-gray-600 mb-6 group-hover:rotate-6 transition-transform" />
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">No Evidence File Attached</p>
                                            </div>
                                        )}

                                        <div className="space-y-6 pt-4 flex-1">
                                             <div className="flex items-center gap-8 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-[3rem] border border-gray-100 dark:border-gray-800 group hover:bg-white dark:hover:bg-gray-800 transition-all hover:translate-x-2">
                                                <div className="w-24 h-24 rounded-[2.25rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40 relative overflow-hidden">
                                                    <User className="w-10 h-10 relative z-10" />
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Operator Profile</p>
                                                    <p className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                                        {selectedRecord.rental?.customer 
                                                            ? `${selectedRecord.rental.customer.firstName} ${selectedRecord.rental.customer.lastName}`
                                                            : 'Fleet System'
                                                        }
                                                    </p>
                                                </div>
                                             </div>

                                             <div className="pt-4 h-full">
                                                {selectedRecord.rentalId ? (
                                                    <Link 
                                                        href={`/admin/reservations/${selectedRecord.rentalId}`}
                                                        className="group flex flex-col gap-4 p-10 bg-gray-950 text-white rounded-[3.5rem] hover:bg-indigo-600 transition-all duration-700 shadow-2xl shadow-black/20 hover:shadow-indigo-500/40 relative overflow-hidden"
                                                    >
                                                        <div className="flex items-center justify-between relative z-10">
                                                            <div className="flex items-center gap-4">
                                                                <Calendar className="w-8 h-8 opacity-40 group-hover:translate-x-1 transition-transform" />
                                                                <span className="text-xl font-black uppercase tracking-tighter">Rental Case #{selectedRecord.rentalId}</span>
                                                            </div>
                                                            <ArrowUpRight className="w-10 h-10 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2 opacity-30 group-hover:opacity-100" />
                                                        </div>
                                                        <p className="text-[10px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-[0.4em] relative z-10">View Full Transaction Context</p>
                                                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[60px] group-hover:bg-white/10 transition-all duration-1000"></div>
                                                    </Link>
                                                ) : (
                                                    <div className="p-10 bg-amber-50 dark:bg-amber-900/10 rounded-[3.5rem] border border-amber-100 dark:border-amber-800 text-center flex items-center justify-center flex-col gap-4 group hover:scale-[1.02] transition-transform">
                                                        <ShieldAlert className="w-10 h-10 text-amber-500 opacity-40 group-hover:scale-110 transition-transform" />
                                                        <p className="text-[11px] font-black text-amber-600 uppercase tracking-[0.3em]">Standalone Record / No Transaction ID</p>
                                                    </div>
                                                )}
                                             </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-12 bg-white/30 dark:bg-gray-950/30 backdrop-blur-2xl rounded-[6rem] border-2 border-white/60 dark:border-gray-800 border-dashed animate-in fade-in zoom-in-95 duration-1000">
                             <div className="relative group/wait cursor-pointer">
                                 <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full scale-150 animate-pulse group-hover/wait:scale-175 transition-transform duration-1000"></div>
                                 <div className="w-40 h-40 bg-white dark:bg-gray-900 rounded-[4rem] shadow-2xl flex items-center justify-center text-indigo-500 border border-indigo-50 dark:border-indigo-950/50 relative z-10 group-hover/wait:rotate-12 transition-transform duration-700">
                                     <CarFront className="w-20 h-20" />
                                 </div>
                             </div>
                             <div className="text-center space-y-6">
                                 <h2 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Diagnostic Center</h2>
                                 <p className="text-[12px] text-gray-400 font-bold uppercase tracking-[0.5em] max-w-[380px] mx-auto leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-8 opacity-40 italic">Initialize system by selecting an asset from the fleet database to load full telemetry and condition reports.</p>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
