'use client';

import React, { useState, useEffect } from 'react';
import {
    Folder,
    Car,
    CheckCircle2,
    ChevronRight,
    Search,
    RefreshCw,
    Save,
    LayoutGrid,
    CheckSquare,
    Square
} from 'lucide-react';
import { getCheckInFolders, getCarsForMapping, assignTemplateToCars } from '@/app/actions/check-in-setup';

export default function CheckInSetupPage() {
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

    const handleSave = async () => {
        if (!selectedFolder && selectedCarIds.length > 0) {
            if (!confirm("Möchten Sie die Vorlage für diese Fahrzeuge entfernen?")) return;
        }

        setSaving(true);
        try {
            await assignTemplateToCars(selectedCarIds, selectedFolder);
            await loadData();
            setSelectedCarIds([]);
            alert("Erfolgreich gespeichert!");
        } catch (error) {
            alert("Fehler beim Speichern");
        } finally {
            setSaving(false);
        }
    };

    const filteredCars = cars.filter(c =>
        (c.brand + ' ' + c.model + ' ' + c.plate).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2">
                            Check-In <span className="text-blue-600 italic">Visuals</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Bilderordner mit Fahrzeugmodellen verknüpfen</p>
                    </div>
                    <button
                        onClick={loadData}
                        className="p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-blue-600 transition-all shadow-sm active:rotate-180 duration-500"
                    >
                        <RefreshCw className="w-6 h-6" />
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Folders List */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-blue-500/5 p-8 border border-gray-50 dark:border-gray-800">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <Folder className="w-5 h-5 text-blue-600" />
                                </div>
                                Bildervorlagen
                            </h2>
                            <div className="space-y-3">
                                {folders.map(folder => (
                                    <button
                                        key={folder}
                                        onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
                                        className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all border-2 ${selectedFolder === folder
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-2'
                                            : 'bg-gray-50 dark:bg-gray-800/50 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl ${selectedFolder === folder ? 'bg-white/20' : 'bg-white dark:bg-gray-700 shadow-sm'}`}>
                                                <Folder className={`w-5 h-5 ${selectedFolder === folder ? 'text-white' : 'text-blue-500'}`} />
                                            </div>
                                            <span className="font-extrabold text-sm">{folder}</span>
                                        </div>
                                        {selectedFolder === folder && <ChevronRight className="w-5 h-5" />}
                                    </button>
                                ))}
                                {folders.length === 0 && (
                                    <p className="text-xs text-center text-gray-400 py-10">Keine Ordner in /Check-in gefunden</p>
                                )}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black mb-4">Anleitung</h3>
                                <ul className="space-y-4 text-blue-100 text-sm font-medium">
                                    <li className="flex gap-4">
                                        <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
                                        <span>Wählen Sie links einen Bilderordner aus (z.B. Fiat Ducato).</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
                                        <span>Markieren Sie rechts alle Fahrzeuge, die diese Bilder nutzen sollen.</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
                                        <span>Klicken Sie auf "Zuweisen", um die Vorschau für den Check-In zu aktivieren.</span>
                                    </li>
                                </ul>
                            </div>
                            <Folder className="absolute -bottom-10 -right-10 w-48 h-48 text-blue-500/20 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                        </div>
                    </div>

                    {/* Cars List */}
                    <div className="lg:col-span-8 flex flex-col h-full">
                        <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl shadow-blue-500/5 border border-gray-50 dark:border-gray-800 flex flex-col h-[700px]">
                            {/* Header / Search */}
                            <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                                        <Car className="w-6 h-6 text-purple-600" />
                                    </div>
                                    Fahrzeugliste
                                </h2>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Marke, Modell oder Kennzeichen..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-[1.5rem] w-full md:w-80 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Scrolling Grid */}
                            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-4 hide-scrollbar">
                                {filteredCars.map(car => (
                                    <button
                                        key={car.id}
                                        onClick={() => toggleCarSelection(car.id)}
                                        className={`group relative text-left p-6 rounded-[2rem] border-2 transition-all ${selectedCarIds.includes(car.id)
                                            ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-500 shadow-lg'
                                            : 'bg-gray-50 dark:bg-gray-800/30 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">{car.brand}</p>
                                                <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight mb-2">{car.model}</h4>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-[10px] font-black">
                                                    {car.plate}
                                                </div>
                                            </div>
                                            <div className={`p-2 rounded-xl transition-all ${selectedCarIds.includes(car.id)
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-white dark:bg-gray-700 text-gray-300'
                                                }`}>
                                                {selectedCarIds.includes(car.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                            </div>
                                        </div>

                                        {car.checkInTemplate && (
                                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600">
                                                <Folder className="w-4 h-4" />
                                                <span>Vorlage: {car.checkInTemplate}</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                                {filteredCars.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-gray-400 font-bold">
                                        Keine Fahrzeuge gefunden
                                    </div>
                                )}
                            </div>

                            {/* Sticky Save Bar */}
                            <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-50 dark:border-gray-800 rounded-b-[3rem]">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || (selectedCarIds.length === 0)}
                                    className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-3xl shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale"
                                >
                                    {saving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                    {selectedFolder
                                        ? `ORDNER "${selectedFolder.toUpperCase()}" ZUWEISEN (${selectedCarIds.length} FAHRZEUGE)`
                                        : `VORLAGE ENTFERNEN`
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
