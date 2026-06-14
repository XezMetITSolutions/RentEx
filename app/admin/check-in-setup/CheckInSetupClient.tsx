'use client';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import {
    Folder,
    Car,
    ChevronRight,
    Search,
    RefreshCw,
    Save,
    LayoutGrid,
    CheckSquare,
    Square,
    Sparkles,
    Check,
    HelpCircle,
    ArrowRightLeft,
    Image as ImageIcon
} from 'lucide-react';
import { getCheckInFolders, getCarsForMapping, assignTemplateToCars } from '@/app/actions/check-in-setup';

export default function CheckInSetupClient() {
    const [folders, setFolders] = useState<string[]>([]);
    const [cars, setCars] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [selectedCarIds, setSelectedCarIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const f = await getCheckInFolders();
        const c = await getCarsForMapping();
        setFolders(f);
        setCars(c);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleCarSelection = (id: number) => {
        setSelectedCarIds(prev =>
            prev.includes(id) ? prev.filter(carId => carId !== id) : [...prev, id]
        );
    };

    const selectAllCars = () => {
        const filteredIds = filteredCars.map(c => c.id);
        const allAlreadySelected = filteredIds.every(id => selectedCarIds.includes(id));
        
        if (allAlreadySelected) {
            setSelectedCarIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            setSelectedCarIds(prev => Array.from(new Set([...prev, ...filteredIds])));
        }
    };

    const handleSave = async () => {
        if (!selectedFolder && selectedCarIds.length > 0) {
            if (!confirm("Möchten Sie die Vorlage für diese Fahrzeuge entfernen?")) return;
        }

        setSaving(true);
        try {
            await assignTemplateToCars(selectedCarIds, selectedFolder);
            await loadData();
            setSelectedCarIds([]);
            toast.success('Erfolgreich gespeichert!');
        } catch (error) {
            toast.error('Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    const filteredCars = cars.filter(c =>
        (c.brand + ' ' + c.model + ' ' + c.plate).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans selection:bg-indigo-500/30">
            {/* Top Decorative Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-slate-800/80 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <ArrowRightLeft className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                                    Check-In <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Visuals</span>
                                </h1>
                                <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase">Setup</span>
                            </div>
                            <p className="text-xs md:text-sm text-slate-400 mt-1">Bilderordner mit aktiven Fahrzeugmodellen verknüpfen</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="self-start md:self-auto flex items-center gap-2 px-5 py-3 bg-slate-800/80 hover:bg-slate-700/80 text-sm font-bold text-slate-200 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer shadow-md disabled:opacity-40"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Aktualisieren
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Folders & Info */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Templates Card */}
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-[2.2rem] p-6 border border-slate-800/80 shadow-2xl">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-black text-white flex items-center gap-2.5">
                                    <Folder className="w-5 h-5 text-indigo-400" />
                                    Bildervorlagen
                                </h2>
                                <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700/40">
                                    {folders.length} Ordner
                                </span>
                            </div>

                            {loading ? (
                                <div className="space-y-3 py-10">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-slate-800/30 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                                    {folders.map(folder => {
                                        const isSelected = selectedFolder === folder;
                                        return (
                                            <button
                                                key={folder}
                                                onClick={() => setSelectedFolder(isSelected ? null : folder)}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border text-left cursor-pointer group ${isSelected
                                                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-500/40 text-white shadow-lg shadow-indigo-600/10'
                                                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white/10' : 'bg-slate-800 border border-slate-700/50'}`}>
                                                        <ImageIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-400 group-hover:scale-110 transition-transform'}`} />
                                                    </div>
                                                    <span className="font-extrabold text-sm truncate">{folder}</span>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-slate-500'}`} />
                                            </button>
                                        );
                                    })}
                                    {folders.length === 0 && (
                                        <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                                            <Folder className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                            <p className="text-xs text-slate-500">Keine Ordner in /Check-in gefunden</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Guide Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/50 via-slate-900/90 to-slate-900/80 backdrop-blur-md rounded-[2.2rem] p-8 border border-slate-800/60 shadow-2xl">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="relative z-10 space-y-5">
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-400" />
                                    Kurzanleitung
                                </h3>
                                <ul className="space-y-4 text-xs font-semibold text-slate-300">
                                    <li className="flex gap-3.5">
                                        <div className="shrink-0 w-5 h-5 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center font-black">1</div>
                                        <span className="leading-relaxed">Wählen Sie oben eine **Bildervorlage** aus der Liste (z.B. Fiat Ducato).</span>
                                    </li>
                                    <li className="flex gap-3.5">
                                        <div className="shrink-0 w-5 h-5 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center font-black">2</div>
                                        <span className="leading-relaxed">Wählen Sie rechts die **Fahrzeuge** aus, die dieses Schema erhalten sollen.</span>
                                    </li>
                                    <li className="flex gap-3.5">
                                        <div className="shrink-0 w-5 h-5 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center font-black">3</div>
                                        <span className="leading-relaxed">Klicken Sie unten rechts auf **Zuweisen**, um die Konfiguration zu speichern.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Fleet Grid */}
                    <div className="lg:col-span-8 flex flex-col">
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col h-[700px]">
                            
                            {/* Search & Actions Panel */}
                            <div className="p-6 md:p-8 border-b border-slate-800/80 bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center justify-between sm:justify-start gap-4">
                                    <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                                        <Car className="w-5 h-5 text-violet-400" />
                                        Fahrzeugliste
                                    </h2>
                                    {filteredCars.length > 0 && (
                                        <button
                                            onClick={selectAllCars}
                                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 bg-slate-800/40 rounded-lg border border-slate-700/30 transition-all cursor-pointer"
                                        >
                                            Alle filtern / wählen
                                        </button>
                                    )}
                                </div>
                                <div className="relative group shrink-0">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Marke, Modell oder Plate..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-11 pr-5 py-3.5 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-2xl w-full sm:w-64 text-xs font-bold focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Scrolling Vehicle Grid */}
                            <div className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar bg-slate-950/20">
                                {loading ? (
                                    [1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-28 bg-slate-800/20 rounded-2xl animate-pulse" />
                                    ))
                                ) : filteredCars.map(car => {
                                    const isSelected = selectedCarIds.includes(car.id);
                                    return (
                                        <button
                                            key={car.id}
                                            onClick={() => toggleCarSelection(car.id)}
                                            className={`group relative text-left p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 cursor-pointer ${isSelected
                                                ? 'bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border-indigo-500/80 shadow-lg shadow-indigo-500/5'
                                                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80 hover:bg-slate-800/30'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between w-full gap-2">
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-extrabold text-white truncate max-w-[180px]">{car.brand} {car.model}</h4>
                                                    <div className="inline-block px-2 py-0.5 bg-slate-950 rounded border border-slate-800 font-mono text-[9px] font-bold text-indigo-300">
                                                        {car.plate}
                                                    </div>
                                                </div>

                                                <div className={`p-1.5 rounded-lg transition-all ${isSelected ? 'text-indigo-400' : 'text-slate-700'}`}>
                                                    {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                </div>
                                            </div>

                                            <div className="w-full flex items-center justify-between border-t border-slate-800/40 pt-3 text-[10px]">
                                                <span className="text-slate-500 font-bold">SCHEMAVORLAGE</span>
                                                {car.checkInTemplate ? (
                                                    <div className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded-md font-extrabold">
                                                        <Folder className="w-3 h-3 shrink-0" />
                                                        <span className="truncate max-w-[120px]">{car.checkInTemplate}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 font-medium italic">Nicht definiert</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                                {!loading && filteredCars.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-slate-500 border border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
                                        <Car className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                                        <p className="text-sm font-bold">Keine Fahrzeuge gefunden</p>
                                    </div>
                                )}
                            </div>

                            {/* Floating Save Actions Bar */}
                            <div className="p-6 md:p-8 bg-slate-900/60 border-t border-slate-800/80 backdrop-blur-md">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || selectedCarIds.length === 0}
                                    className="w-full py-4.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-30 disabled:grayscale hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {selectedFolder
                                        ? `Zuweisen: "${selectedFolder.toUpperCase()}" (${selectedCarIds.length} Fahrzeuge)`
                                        : `Zuweisung entfernen (${selectedCarIds.length} Fahrzeuge)`
                                    }
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
