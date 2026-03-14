'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Camera,
    Trash2,
    ChevronRight,
    MapPin,
    Calendar,
    User,
    Loader2,
    Plus,
    Maximize2,
    Info,
    Car,
    CreditCard,
    Settings2,
    Filter
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
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(initialRecords[0]?.id || null);
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
                    console.error("Failed to load images");
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
                r.car.model.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [records, searchQuery, statusFilter]);

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await updateDamageStatus(id, newStatus);
            setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            alert("Fehler");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Löschen?")) return;
        try {
            await deleteDamageRecord(id);
            setRecords(prev => prev.filter(r => r.id !== id));
            if (selectedRecordId === id) setSelectedRecordId(null);
        } catch (error) {
            alert("Fehler");
        }
    };

    const handleCostUpdate = async (id: number, cost: number) => {
        try {
            await updateDamageRepairCost(id, cost);
            setRecords(prev => prev.map(r => r.id === id ? { ...r, repairCost: cost } : r));
        } catch (error) {
            alert("Fehler");
        }
    };

    return (
        <div className="flex bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden h-[800px]">
            {/* Sidebar List */}
            <div className="w-[380px] border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/30 dark:bg-gray-900/50">
                <div className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schäden</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'open', 'repaired'].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === f ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100 border border-gray-200 dark:border-gray-700'}`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-6">
                    {filteredRecords.map((record) => (
                        <div 
                            key={record.id}
                            onClick={() => setSelectedRecordId(record.id)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedRecordId === record.id ? 'bg-white dark:bg-gray-800 border-blue-500 shadow-md ring-4 ring-blue-500/5' : 'bg-transparent border-transparent hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{record.car.brand} {record.car.model}</h4>
                                    <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{record.car.plate}</span>
                                </div>
                                <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    record.status === 'open' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                }`}>
                                    {record.status}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic">"{record.type}"</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                {selectedRecord ? (
                    <div className="p-8 space-y-8 animate-in fade-in duration-300">
                        {/* Header Detail */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedRecord.type}</h2>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedRecord.locationOnCar || 'Unbekannt'}</span>
                                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(new Date(selectedRecord.reportedDate), 'dd.MM.yyyy')}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDelete(selectedRecord.id)}
                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <select 
                                    value={selectedRecord.status}
                                    onChange={(e) => handleStatusChange(selectedRecord.id, e.target.value)}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl text-sm font-bold outline-none cursor-pointer"
                                >
                                    <option value="open">Offen</option>
                                    <option value="repaired">Repariert</option>
                                    <option value="ignored">Ignoriert</option>
                                </select>
                            </div>
                        </div>

                        {/* Visuals Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Car Diagram */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-800">
                                <div className="flex gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                                    {['summary', 'front', 'back', 'left', 'right'].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => setActiveView(v as any)}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === v ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative aspect-video flex items-center justify-center">
                                    {activeView === 'summary' ? (
                                        <svg viewBox="0 0 400 200" className="w-full h-full text-gray-200 dark:text-gray-700 stroke-current fill-none">
                                            <rect x="50" y="40" width="300" height="120" rx="40" strokeWidth="2" />
                                            <path d="M100 40 L120 70 L280 70 L300 40" strokeWidth="2" />
                                            <path d="M100 160 L120 130 L280 130 L300 160" strokeWidth="2" />
                                            {selectedRecord && (
                                                <circle 
                                                    cx={`${selectedRecord.xPosition || 50}%`} 
                                                    cy={`${selectedRecord.yPosition || 50}%`} 
                                                    r="10" 
                                                    className="fill-red-500 animate-pulse" 
                                                />
                                            )}
                                        </svg>
                                    ) : (
                                        <div className="w-full h-full">
                                            {loadingImages ? (
                                                <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                                            ) : viewImages[activeView] ? (
                                                <img src={viewImages[activeView]} className="w-full h-full object-contain rounded-2xl" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-400"><Camera className="w-8 h-8" /></div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="space-y-6">
                                <section className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> Beschreibung</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed italic">
                                        "{selectedRecord.description || 'Keine Beschreibung vorhanden.'}"
                                    </p>
                                </section>

                                <section className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-500" /> Kosten</h3>
                                    <div className="relative">
                                        <input 
                                            type="number"
                                            defaultValue={selectedRecord.repairCost || ''}
                                            onBlur={(e) => handleCostUpdate(selectedRecord.id, Number(e.target.value))}
                                            placeholder="0.00"
                                            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                                    </div>
                                </section>

                                {selectedRecord.photoUrl && (
                                    <section>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Fotos</h3>
                                        <div className="relative group rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <img src={selectedRecord.photoUrl} className="w-full h-48 object-cover" alt="" />
                                            <a href={selectedRecord.photoUrl} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"><Maximize2 className="w-8 h-8" /></a>
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white"><User className="w-6 h-6" /></div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest">Kunde / Mieter</p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {selectedRecord.rental?.customer ? `${selectedRecord.rental.customer.firstName} ${selectedRecord.rental.customer.lastName}` : 'Nicht zugeordnet'}
                                </p>
                            </div>
                            {selectedRecord.rentalId && (
                                <Link href={`/admin/reservations/${selectedRecord.rentalId}`} className="p-3 bg-white dark:bg-gray-800 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><ChevronRight className="w-5 h-5" /></Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center text-gray-300 mb-6"><AlertTriangle className="w-10 h-10" /></div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Kein Schaden ausgewählt</h3>
                        <p className="text-gray-500 text-sm max-w-xs">Wählen Sie einen Eintrag aus der Liste links aus, um die Details zu sehen.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
