'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    Filter,
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
    RotateCcw,
    Plus,
    Maximize2,
    ArrowUpRight,
    ShieldAlert,
    CircleDashed,
    Wrench,
    Image as ImageIcon,
    AlertCircle,
    Info,
    LayoutDashboard,
    CarFront
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
    const [severityFilter, setSeverityFilter] = useState('all');
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
            const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;

            return matchesSearch && matchesStatus && matchesSeverity;
        });
    }, [records, searchQuery, statusFilter, severityFilter]);

    const stats = useMemo(() => {
        const total = initialRecords.length;
        const open = initialRecords.filter(r => r.status === 'open').length;
        const high = initialRecords.filter(r => r.severity === 'High').length;
        const repaired = initialRecords.filter(r => r.status === 'repaired').length;
        return { total, open, high, repaired };
    }, [initialRecords]);

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await updateDamageStatus(id, newStatus);
            setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            alert("Fehler beim Aktualisieren des Status");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Eintrag unwiderruflich löschen?")) return;
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
            alert("Kosten-Update fehlgeschlagen");
        }
    };

    return (
        <div className="flex flex-col gap-8 h-full animate-in fade-in duration-700">
            {/* Glossy Dashboard Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Analyse Gesamt', count: stats.total, icon: LayoutDashboard, color: 'text-indigo-500', bg: 'bg-indigo-50/50', border: 'border-indigo-100' },
                    { label: 'Unbearbeitet', count: stats.open, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50/50', border: 'border-rose-100' },
                    { label: 'Kristisch (Hoch)', count: stats.high, icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-100' },
                    { label: 'Status Erledigt', count: stats.repaired, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
                ].map((stat, i) => (
                    <div key={i} className={`p-6 ${stat.bg} dark:bg-gray-800/40 rounded-[2.5rem] border ${stat.border} dark:border-gray-800 flex items-center justify-between transition-all hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-current/5 cursor-default`}>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{stat.label}</p>
                            <div className="flex items-baseline gap-1">
                                <p className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">{stat.count}</p>
                                <span className="text-[10px] font-bold text-gray-400 opacity-50 uppercase tracking-widest">%</span>
                            </div>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg.replace('/50', '/80')} shadow-inner`}>
                            <stat.icon className={`w-7 h-7 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 flex-1 min-h-[700px] items-start pb-12">
                {/* GLASSMOPHISM SIDEBAR */}
                <div className="xl:col-span-4 flex flex-col bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-white/60 dark:border-gray-800 h-[calc(100vh-20rem)] overflow-hidden">
                    <div className="p-10 border-b border-gray-100/50 dark:border-gray-800/50 space-y-8">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-all" />
                            <input
                                type="text"
                                placeholder="Suche nach Daten..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 bg-white dark:bg-gray-800 border-none rounded-[2rem] text-sm font-bold text-gray-900 dark:text-white shadow-inner focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                            />
                        </div>
                        
                        {/* Quick filter chips */}
                        <div className="flex flex-wrap gap-2">
                             {['all', 'open', 'repaired'].map(f => (
                                 <button
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200'}`}
                                 >
                                     {f === 'all' ? 'Alle Fälle' : f}
                                 </button>
                             ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-4">
                        {filteredRecords.map((record) => (
                            <div 
                                key={record.id}
                                onClick={() => setSelectedRecordId(record.id)}
                                className={`p-8 rounded-[2.5rem] cursor-pointer transition-all relative overflow-hidden group ${selectedRecordId === record.id ? 'bg-white dark:bg-gray-800 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] ring-2 ring-indigo-500/10' : 'hover:bg-white/50 dark:hover:bg-gray-800/30'}`}
                            >
                                {selectedRecordId === record.id && <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-600"></div>}
                                
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <h4 className={`font-black uppercase tracking-tighter text-base transition-colors ${selectedRecordId === record.id ? 'text-indigo-600' : 'text-gray-900 dark:text-white'}`}>
                                            {record.car.brand} {record.car.model}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-[9px] font-black text-gray-400 tracking-widest leading-none">{record.car.plate}</div>
                                            <div className={`w-1.5 h-1.5 rounded-full ${record.status === 'repaired' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                        record.severity === 'High' ? 'bg-rose-100 text-rose-600' : 
                                        record.severity === 'Medium' ? 'bg-amber-100 text-amber-600' : 
                                        'bg-sky-100 text-sky-600'
                                    }`}>
                                        {record.severity || 'Normal'}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-6 text-[10px] font-black uppercase tracking-[0.15em] text-gray-300">
                                    <div className="flex items-center gap-2 group-hover:text-indigo-500 transition-colors">
                                        <ImageIcon className="w-3.5 h-3.5 opacity-40" />
                                        {record.photoUrl ? 'Foto vorhanden' : 'Kein Foto'}
                                    </div>
                                    <ArrowRight className={`w-4 h-4 transition-transform ${selectedRecordId === record.id ? 'translate-x-0 opacity-100 text-indigo-600' : '-translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-50'}`} />
                                </div>
                            </div>
                        ))}
                        {filteredRecords.length === 0 && (
                            <div className="py-24 text-center">
                                <Info className="w-12 h-12 text-gray-200 mx-auto mb-4 opacity-20" />
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Keine Daten gefunden</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* VISUAL REPORTING AREA */}
                <div className="xl:col-span-8 flex flex-col gap-10">
                    {selectedRecord ? (
                        <>
                            <div className="bg-white dark:bg-gray-900 rounded-[4rem] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.06)] border border-gray-50 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                                <div className="flex p-3 gap-2 bg-gray-50/50 dark:bg-gray-900/50">
                                    {['summary', 'front', 'back', 'left', 'right'].map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setActiveView(v as any)}
                                            className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-[1.5rem] ${
                                                activeView === v 
                                                ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-xl shadow-black/5 ring-1 ring-black/[0.02] dark:ring-white/10' 
                                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            {v === 'summary' ? <><CarFront className="w-3.5 h-3.5 inline mr-2 -mt-0.5" /> Overview</> : v}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-16 flex items-center justify-center relative min-h-[500px] bg-gradient-to-b from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-900/80">
                                    {activeView === 'summary' ? (
                                        <div className="relative w-full max-w-2xl group/car">
                                            <div className="absolute inset-x-20 inset-y-10 bg-indigo-500/10 blur-[120px] rounded-full scale-150 animate-pulse transition-opacity group-hover/car:opacity-100 opacity-40"></div>
                                            <svg viewBox="0 0 500 280" className="w-full h-full drop-shadow-[0_40px_60px_rgba(0,0,0,0.12)] relative z-10 filter dark:brightness-125">
                                                <path d="M50,140 C50,210 120,250 250,250 C380,250 450,210 450,140 C450,70 380,30 250,30 C120,30 50,70 50,140 Z" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-100 dark:text-gray-800" />
                                                <path d="M60,140 C60,200 125,235 250,235 C375,235 440,200 440,140 C440,80 375,45 250,45 C125,45 60,80 60,140 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" className="text-gray-200 dark:text-gray-700" />
                                                {/* Generic Car Layout Elements */}
                                                <rect x="130" y="70" width="240" height="140" rx="20" fill="none" stroke="currentColor" strokeWidth="1" className="text-indigo-100/50 dark:text-indigo-900/20" />
                                                <circle cx="100" cy="80" r="15" className="fill-gray-100 dark:fill-gray-800" />
                                                <circle cx="400" cy="80" r="15" className="fill-gray-100 dark:fill-gray-800" />
                                                <circle cx="100" cy="200" r="15" className="fill-gray-100 dark:fill-gray-800" />
                                                <circle cx="400" cy="200" r="15" className="fill-gray-100 dark:fill-gray-800" />
                                            </svg>
                                            
                                            {selectedRecord && (
                                                <div 
                                                    className="absolute w-16 h-16 -ml-8 -mt-8 flex items-center justify-center z-20 group-hover/car:scale-125 transition-all duration-700"
                                                    style={{ left: `${selectedRecord.xPosition || 50}%`, top: `${selectedRecord.yPosition || 50}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-rose-500/30 rounded-full animate-ping"></div>
                                                    <div className="w-full h-full bg-rose-600 rounded-full border-[6px] border-white dark:border-gray-900 shadow-2xl shadow-rose-500/40 flex items-center justify-center text-white ring-[12px] ring-rose-500/10">
                                                        <AlertTriangle className="w-6 h-6 animate-pulse" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative max-w-2xl w-full">
                                            {loadingImages ? (
                                                <div className="flex flex-col items-center gap-6">
                                                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 dark:bg-gray-800 flex items-center justify-center shadow-inner">
                                                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                                                    </div>
                                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Synchronisiere Daten</p>
                                                </div>
                                            ) : viewImages[activeView] ? (
                                                <div className="relative animate-in slide-in-from-bottom-8 duration-700">
                                                    <img 
                                                        src={viewImages[activeView]} 
                                                        className="w-full h-auto rounded-[3.5rem] shadow-[-20px_40px_80px_rgba(0,0,0,0.1)] border-[12px] border-white dark:border-gray-800 bg-white dark:bg-gray-800" 
                                                        alt={activeView}
                                                    />
                                                    {selectedRecord.locationOnCar === activeView && (
                                                        <div 
                                                            className="absolute w-20 h-20 -ml-10 -mt-10 flex items-center justify-center z-20 pointer-events-none"
                                                            style={{ left: `${selectedRecord.xPosition}%`, top: `${selectedRecord.yPosition}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping duration-[3000ms]"></div>
                                                            <div className="w-full h-full bg-rose-600 rounded-full border-[8px] border-white dark:border-gray-900 shadow-[0_0_80px_rgba(225,29,72,0.6)] flex items-center justify-center text-white ring-[20px] ring-rose-500/5">
                                                                <AlertTriangle className="w-8 h-8" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-32 px-12 bg-white dark:bg-gray-800/80 rounded-[4rem] border-2 border-gray-50 dark:border-gray-800 border-dashed group hover:scale-[0.99] transition-transform cursor-pointer">
                                                    <Camera className="w-20 h-20 text-gray-100 dark:text-gray-700 mx-auto mb-8 opacity-40 group-hover:rotate-12 transition-transform" />
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 leading-relaxed">Perspektive nicht konfiguriert</p>
                                                    <span className="px-6 py-2 bg-gray-50 dark:bg-gray-900 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-full opacity-60">Blueprint fehlt</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="absolute top-10 right-10">
                                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl px-8 py-5 rounded-[2rem] shadow-2xl shadow-black/5 border border-white/20 dark:border-gray-800/50">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Status</p>
                                            <p className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{selectedRecord.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MASTER-DETAIL GRID */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                                {/* INFO CARD */}
                                <div className="bg-white dark:bg-gray-900 p-12 rounded-[4rem] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.06)] border border-gray-50 dark:border-gray-800 space-y-10 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                                    {selectedRecord.type}
                                                </h3>
                                            </div>
                                            <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.25em] bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full inline-block border border-indigo-100 dark:border-indigo-800">
                                                {selectedRecord.locationOnCar || 'EXTERN / UNBEKANNT'}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(selectedRecord.id)}
                                            className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500/20 rounded-[2.25rem] transition-all flex items-center justify-center group/del shadow-inner"
                                        >
                                            <Trash2 className="w-7 h-7 group-hover/del:scale-110 transition-transform" />
                                        </button>
                                    </div>

                                    <div className="bg-gray-50/50 dark:bg-gray-800/50 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-700/50 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                                            <Wrench className="w-12 h-12 text-indigo-500 -rotate-12" />
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-base font-bold text-gray-700 dark:text-gray-300 leading-relaxed italic opacity-90 indent-4">
                                                "{selectedRecord.description || 'Der Vorfall wurde ohne zusätzliche Beschreibung protokolliert.'}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] px-2">Work-Status</label>
                                            <select 
                                                value={selectedRecord.status}
                                                onChange={(e) => handleStatusChange(selectedRecord.id, e.target.value)}
                                                className={`w-full px-6 py-5 rounded-[1.75rem] border-none text-xs font-black uppercase tracking-widest focus:ring-8 focus:ring-current/10 transition-all appearance-none cursor-pointer shadow-sm ${
                                                    selectedRecord.status === 'repaired' ? 'bg-emerald-500 text-white' : 
                                                    selectedRecord.status === 'ignored' ? 'bg-gray-400 text-white' : 'bg-rose-500 text-white'
                                                }`}
                                            >
                                                <option value="open">❌ Unbearbeitet</option>
                                                <option value="repaired">✅ Instandgesetzt</option>
                                                <option value="ignored">➖ Ignoriert</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] px-2 flex items-center justify-between">Kalkulierte Kosten <span className="opacity-40">€</span></label>
                                            <input 
                                                type="number"
                                                defaultValue={selectedRecord.repairCost ? Number(selectedRecord.repairCost) : ''}
                                                onBlur={(e) => handleCostUpdate(selectedRecord.id, Number(e.target.value))}
                                                placeholder="--- EUR"
                                                className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-none rounded-[1.75rem] text-sm font-black text-gray-900 dark:text-white focus:ring-8 focus:ring-indigo-500/10 transition-all outline-none shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* MEDIA & CONTEXT CARD */}
                                <div className="bg-white dark:bg-gray-900 p-12 rounded-[4rem] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.06)] border border-gray-50 dark:border-gray-800 flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
                                    <div className="flex items-center justify-between">
                                         <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em]">Beweissicherung</p>
                                         <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                    </div>
                                    
                                    {selectedRecord.photoUrl ? (
                                        <div className="relative group rounded-[3.5rem] overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-[5/4] shadow-inner">
                                            <img 
                                                src={selectedRecord.photoUrl} 
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                                alt="Damage Evidence"
                                            />
                                            <a 
                                                href={selectedRecord.photoUrl} 
                                                target="_blank" 
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md"
                                            >
                                                <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/20 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
                                                    <Maximize2 className="w-8 h-8" />
                                                </div>
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="aspect-[5/4] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-[3.5rem] border-4 border-gray-100 dark:border-gray-700 border-dashed group transition-all cursor-default">
                                            <ImageIcon className="w-20 h-20 text-gray-100 dark:text-gray-700 mb-6 group-hover:scale-110 transition-transform opacity-30" />
                                            <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] opacity-60">Sicherung nicht verfügbar</p>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                         <div className="flex items-center gap-6 p-1 bg-gray-50/50 dark:bg-gray-800/30 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 pr-8 shadow-sm">
                                            <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-gray-800 flex items-center justify-center text-indigo-500 shadow-xl shadow-black/[0.03] border border-gray-100 dark:border-gray-700">
                                                <User className="w-9 h-9" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 opacity-50">Melder / Protokollant</p>
                                                <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                                    {selectedRecord.rental?.customer 
                                                        ? `${selectedRecord.rental.customer.firstName} ${selectedRecord.rental.customer.lastName}`
                                                        : 'LOKALER ADMIN'
                                                    }
                                                </p>
                                            </div>
                                         </div>

                                         <div className="flex flex-col gap-4">
                                            {selectedRecord.rentalId ? (
                                                <Link 
                                                    href={`/admin/reservations/${selectedRecord.rentalId}`}
                                                    className="flex items-center justify-between p-8 bg-indigo-600 text-white rounded-[2.5rem] hover:bg-indigo-700 transition-all group shadow-2xl shadow-indigo-500/20 active:scale-95"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Calendar className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                        <span className="text-xs font-black uppercase tracking-[0.2em]">Referenz: Miete #{selectedRecord.rentalId}</span>
                                                    </div>
                                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-lg">
                                                        <ArrowUpRight className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-900 text-center flex items-center justify-center gap-3">
                                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                                    <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest">Keine aktive Miete verknüpft</p>
                                                </div>
                                            )}
                                         </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl rounded-[5rem] border-2 border-white/60 dark:border-gray-800 border-dashed animate-in fade-in zoom-in-95 duration-1000">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-[60px] opacity-20 rounded-full scale-150 animate-pulse"></div>
                                <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-[3.5rem] shadow-2xl flex items-center justify-center text-indigo-500 relative z-10 border border-indigo-50 dark:border-indigo-900/30">
                                    <ShieldAlert className="w-16 h-16" />
                                </div>
                            </div>
                            <div className="text-center space-y-4">
                                <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Status Abfrage</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.3em] max-w-[320px] mx-auto leading-relaxed opacity-60 italic">Wählen Sie einen Datensatz aus der Liste aus, um die detaillierte Zustandsprognose zu laden.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
