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
    Maximize2
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
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
    reportedDate: Date;
    status: string;
    repairCost: any; // Decimal
    car: {
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

    // Load template images when a record is selected (based on its car's template)
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

    // Grouping by car for a more structured view if needed? 
    // For now we'll stick to a list but maybe highlight the car.

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            await updateDamageStatus(id, newStatus);
            setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        } catch (error) {
            alert("Fehler beim Aktualisieren des Status");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Sind Sie sicher, dass Sie diesen Schadenseintrag löschen möchten?")) return;
        try {
            await deleteDamageRecord(id);
            setRecords(prev => prev.filter(r => r.id !== id));
            if (selectedRecordId === id) setSelectedRecordId(null);
        } catch (error) {
            alert("Fehler beim Löschen");
        }
    };

    const handleCostUpdate = async (id: number, cost: number) => {
        try {
            await updateDamageRepairCost(id, cost);
            setRecords(prev => prev.map(r => r.id === id ? { ...r, repairCost: cost } : r));
        } catch (error) {
            alert("Fehler beim Aktualisieren der Kosten");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
            {/* LEFT SIDEBAR: LIST & SEARCH */}
            <div className="lg:col-span-4 flex flex-col bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 font-bold" />
                        <input
                            type="text"
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs font-bold text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">Alle Status</option>
                            <option value="open">Offen</option>
                            <option value="repaired">Repariert</option>
                            <option value="ignored">Ignoriert</option>
                        </select>
                        <select 
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-xs font-bold text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="all">Alle Schweregrade</option>
                            <option value="High">Hoch (Priorität)</option>
                            <option value="Medium">Mittel</option>
                            <option value="Low">Gering</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/50 scrollbar-hide">
                    {filteredRecords.map((record) => (
                        <div 
                            key={record.id}
                            onClick={() => setSelectedRecordId(record.id)}
                            className={`p-5 cursor-pointer transition-all hover:bg-blue-50/50 dark:hover:bg-blue-900/10 border-l-4 ${selectedRecordId === record.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600' : 'border-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="space-y-0.5">
                                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-sm flex items-center gap-2">
                                        {record.car.brand} {record.car.model}
                                        {record.status === 'open' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                                    </h4>
                                    <p className="text-[10px] font-black text-blue-600 tracking-widest uppercase">{record.car.plate}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    record.severity === 'High' ? 'bg-red-100 text-red-700' : 
                                    record.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {record.severity || 'Medium'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-3">{record.description || record.type}</p>
                            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(record.reportedDate), 'dd. MMM yyyy', { locale: de })}
                                </div>
                                <div className={`flex items-center gap-1.5 ${record.status === 'repaired' ? 'text-green-500' : 'text-amber-500'}`}>
                                    {record.status === 'repaired' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {record.status.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredRecords.length === 0 && (
                        <div className="p-12 text-center space-y-3">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                                <Search className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-gray-400">Keine Einträge gefunden</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT MAIN AREA: VISUAL & DETAILS */}
            <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
                {selectedRecord ? (
                    <>
                        {/* Visual Board */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                            <div className="flex border-b border-gray-100 dark:border-gray-700">
                                {['summary', 'front', 'back', 'left', 'right'].map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setActiveView(v as any)}
                                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                                            activeView === v 
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-b-2 border-blue-600' 
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        {v === 'summary' ? 'Top View' : v}
                                    </button>
                                ))}
                            </div>

                            <div className="p-8 flex items-center justify-center relative min-h-[400px] bg-gray-50 dark:bg-gray-900/50 group">
                                {activeView === 'summary' ? (
                                    <div className="relative w-full max-w-lg aspect-[1.8/1]">
                                        <svg viewBox="0 0 500 280" className="w-full h-full drop-shadow-2xl text-gray-200 dark:text-gray-700 fill-white dark:fill-gray-800 stroke-gray-300 dark:stroke-gray-600 stroke-2">
                                            <path d="M60,140 C60,200 120,240 250,240 C380,240 440,200 440,140 C440,80 380,40 250,40 C120,40 60,80 60,140 Z" />
                                            <path d="M150,60 L350,60 L340,220 L160,220 Z" className="fill-blue-50/50 dark:fill-blue-900/20" />
                                            <rect x="100" y="20" width="60" height="30" rx="5" className="fill-gray-800" />
                                            <rect x="340" y="20" width="60" height="30" rx="5" className="fill-gray-800" />
                                            <rect x="100" y="230" width="60" height="30" rx="5" className="fill-gray-800" />
                                            <rect x="340" y="230" width="60" height="30" rx="5" className="fill-gray-800" />
                                        </svg>
                                        
                                        {/* Show marker if summary or we want general overview */}
                                        {selectedRecord && (
                                            <div 
                                                className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center animate-bounce z-10"
                                                style={{ 
                                                    left: `${selectedRecord.xPosition || 50}%`, 
                                                    top: `${selectedRecord.yPosition || 50}%` 
                                                }}
                                            >
                                                <div className="w-full h-full bg-red-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
                                                    <AlertTriangle className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative max-w-xl w-full">
                                        {loadingImages ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                                <p className="text-xs font-bold text-gray-400 uppercase">Lade Visual...</p>
                                            </div>
                                        ) : viewImages[activeView] ? (
                                            <div className="relative">
                                                <img 
                                                    src={viewImages[activeView]} 
                                                    className="w-full h-auto rounded-3xl shadow-lg" 
                                                    alt={activeView}
                                                />
                                                {selectedRecord.locationOnCar === activeView && (
                                                    <div 
                                                        className="absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center animate-pulse z-20"
                                                        style={{ left: `${selectedRecord.xPosition}%`, top: `${selectedRecord.yPosition}%` }}
                                                    >
                                                        <div className="w-full h-full bg-red-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                                                            <AlertTriangle className="w-5 h-5 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center p-12 bg-gray-100 dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                                <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm font-bold text-gray-400">Kein Blueprint für diese Ansicht verfügbar</p>
                                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Wählen Sie oben eine andere Ansicht oder Summary</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">#{selectedRecord.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail Info & Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Damage Details */}
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                                            {selectedRecord.type}
                                        </h3>
                                        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                                            {selectedRecord.locationOnCar || 'Position unbekannt'}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(selectedRecord.id)}
                                        className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic italic-style">
                                        "{selectedRecord.description || 'Keine Beschreibung angegeben.'}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status</label>
                                        <select 
                                            value={selectedRecord.status}
                                            onChange={(e) => handleStatusChange(selectedRecord.id, e.target.value)}
                                            className={`w-full px-4 py-3 rounded-2xl border-none text-sm font-black uppercase tracking-tight focus:ring-2 focus:ring-blue-500 transition-all ${
                                                selectedRecord.status === 'repaired' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-600'
                                            }`}
                                        >
                                            <option value="open">Offen</option>
                                            <option value="repaired">Repariert</option>
                                            <option value="ignored">Ignoriert</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Reparaturkosten</label>
                                        <div className="relative">
                                            <input 
                                                type="number"
                                                defaultValue={selectedRecord.repairCost ? Number(selectedRecord.repairCost) : ''}
                                                onBlur={(e) => handleCostUpdate(selectedRecord.id, Number(e.target.value))}
                                                placeholder="0.00"
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">€</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Assets & Photos */}
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fotonachweis</h4>
                                {selectedRecord.photoUrl ? (
                                    <div className="relative group flex-1 rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 min-h-[200px]">
                                        <img 
                                            src={selectedRecord.photoUrl} 
                                            className="w-full h-full object-cover" 
                                            alt="Damage Photo"
                                        />
                                        <a 
                                            href={selectedRecord.photoUrl} 
                                            target="_blank" 
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <div className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white">
                                                <Maximize2 className="w-6 h-6" />
                                            </div>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
                                        <Camera className="w-12 h-12 text-gray-200 mb-2" />
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Kein Foto verfügbar</p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gemeldet von</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {selectedRecord.rental?.customer 
                                                    ? `${selectedRecord.rental.customer.firstName} ${selectedRecord.rental.customer.lastName}`
                                                    : 'System/Admin'
                                                }
                                            </p>
                                        </div>
                                     </div>
                                     {selectedRecord.rentalId && (
                                         <Link 
                                            href={`/admin/reservations/${selectedRecord.rentalId}`}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-blue-50 transition-all group"
                                         >
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs font-bold text-gray-600">Miete #{selectedRecord.rentalId}</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                         </Link>
                                     )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 border-dashed">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center text-blue-400 mb-2">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Schadendetails</h2>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Wählen Sie einen Eintrag aus der Liste links</p>
                    </div>
                )}
            </div>
        </div>
    );
}
