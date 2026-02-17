'use client';

import React, { useState, useRef } from 'react';
import {
    X,
    Upload,
    AlertCircle,
    Camera,
    Info,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Plus
} from 'lucide-react';
import Image from 'next/image';

interface Damage {
    id: string;
    side: 'front' | 'back' | 'left' | 'right';
    x: number; // percentage
    y: number; // percentage
    reason: string;
    location: string;
    photo?: string;
}

const CAR_VIEWS = [
    { id: 'front', title: 'Frontansicht', src: '/check-in/fiat-ducato/front.jpg' },
    { id: 'back', title: 'Heckansicht', src: '/check-in/fiat-ducato/back.jpg' },
    { id: 'left', title: 'Linke Seite', src: '/check-in/fiat-ducato/left.jpg' },
    { id: 'right', title: 'Rechte Seite', src: '/check-in/fiat-ducato/right.jpg' },
] as const;

export default function CheckInDebugPage() {
    const [damages, setDamages] = useState<Damage[]>([]);
    const [activeView, setActiveView] = useState<typeof CAR_VIEWS[number]['id']>('front');
    const [modalOpen, setModalOpen] = useState(false);
    const [viewingDamage, setViewingDamage] = useState<Damage | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>, side: Damage['side']) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setCurrentClick({ x, y, side });
        setModalOpen(true);
    };

    const handleAddDamage = () => {
        if (!currentClick) return;

        const newDamage: Damage = {
            id: Math.random().toString(36).substr(2, 9),
            side: currentClick.side,
            x: currentClick.x,
            y: currentClick.y,
            reason,
            location,
            photo: photo || undefined
        };

        setDamages([...damages, newDamage]);
        closeModal();
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentClick(null);
        setReason('');
        setLocation('');
        setPhoto(null);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Fiat Ducato <span className="text-blue-600">Check-In System</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Markieren Sie Schäden direkt am Fahrzeugmodell. Klicken Sie auf eine Stelle, um Details hinzuzufügen.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Interaction Area */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all">
                            {/* View Selector Tabs */}
                            <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto hide-scrollbar">
                                {CAR_VIEWS.map((view) => (
                                    <button
                                        key={view.id}
                                        onClick={() => setActiveView(view.id)}
                                        className={`flex-1 px-6 py-4 text-sm font-bold transition-all whitespace-nowrap ${activeView === view.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {view.title}
                                    </button>
                                ))}
                            </div>

                            {/* Damage Canvas */}
                            <div className="p-4 md:p-8 flex justify-center items-center relative min-h-[400px]">
                                <div
                                    className="relative cursor-crosshair group max-w-2xl w-full"
                                    onClick={(e) => handleImageClick(e, activeView)}
                                >
                                    <img
                                        src={CAR_VIEWS.find(v => v.id === activeView)?.src}
                                        alt={activeView}
                                        className="w-full h-auto rounded-xl select-none"
                                    />

                                    {/* Existing Damage Markers */}
                                    {damages.filter(d => d.side === activeView).map((damage) => (
                                        <div
                                            key={damage.id}
                                            className="absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center animate-pulse z-10 hover:scale-125 transition-transform cursor-pointer"
                                            style={{ left: `${damage.x}%`, top: `${damage.y}%` }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingDamage(damage);
                                            }}
                                        >
                                            <div className="w-full h-full bg-red-600 rounded-full border-4 border-white dark:border-gray-900 shadow-xl flex items-center justify-center">
                                                <AlertCircle className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Hover Target Indicator */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity bg-blue-500 rounded-xl" />
                                </div>
                            </div>
                        </div>

                        {/* View Grid (Quick Switch) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {CAR_VIEWS.map((view) => (
                                <button
                                    key={view.id}
                                    onClick={() => setActiveView(view.id)}
                                    className={`relative p-2 rounded-2xl border-2 transition-all overflow-hidden ${activeView === view.id
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                                        : 'border-transparent bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                                        }`}
                                >
                                    <div className="aspect-[4/3] relative">
                                        <img src={view.src} alt={view.title} className="w-full h-full object-cover rounded-lg" />
                                        <div className="absolute top-1 right-1">
                                            {damages.some(d => d.side === view.id) && (
                                                <div className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                    {damages.filter(d => d.side === view.id).length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider block mt-2 text-center text-gray-500">
                                        {view.title}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar: Log of Damages */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl h-full border border-gray-100 dark:border-gray-800 flex flex-col">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="font-extrabold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                                    <Info className="w-5 h-5 text-blue-600" />
                                    Schadensprotokoll
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">{damages.length} dokumentierte Schäden</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {damages.length === 0 ? (
                                    <div className="text-center py-12 px-6">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <p className="text-sm text-gray-500">Keine Schäden dokumentiert. Fahrzeug ist in einwandfreiem Zustand.</p>
                                    </div>
                                ) : (
                                    damages.map((d) => (
                                        <div key={d.id} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 group transition-all hover:shadow-md">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900 text-blue-600 px-2 py-0.5 rounded-full">
                                                    {CAR_VIEWS.find(v => v.id === d.side)?.title}
                                                </span>
                                                <button
                                                    onClick={() => setDamages(damages.filter(item => item.id !== d.id))}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{d.reason}</h3>
                                            <p className="text-xs text-gray-500 mt-1">{d.location}</p>
                                            {d.photo && (
                                                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                                    <img src={d.photo} alt="Schaden Foto" className="w-full h-auto object-cover max-h-24" />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
                                    Protokoll abschließen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Popup */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={closeModal} />

                    <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="relative h-40 bg-blue-600 p-8 flex flex-col justify-end">
                            <button
                                onClick={closeModal}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-2xl font-black text-white leading-tight">
                                Schaden <br />dokumentieren
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">Genaue Details helfen bei der Abwicklung</p>

                            {/* Visual Indicator of click location */}
                            <div className="absolute bottom-6 right-8 w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center p-2 opacity-50">
                                <img src={CAR_VIEWS.find(v => v.id === currentClick?.side)?.src} className="w-full h-full object-contain rounded" />
                                <div
                                    className="absolute w-2 h-2 bg-red-500 rounded-full border border-white"
                                    style={{ left: `${currentClick?.x}%`, top: `${currentClick?.y}%` }}
                                />
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6">
                            {/* Reason for Damage */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Grund des Schadens</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Kratzer', 'Delle', 'Riss', 'Steinschlag', 'Sonstiges'].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setReason(r)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${reason === r
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                                : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-200'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                {reason === 'Sonstiges' && (
                                    <input
                                        type="text"
                                        placeholder="Bitte beschreiben..."
                                        className="w-full mt-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                )}
                            </div>

                            {/* Precise Location */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Genaue Position</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="z.B. Kotflügel vorne links"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                                />
                            </div>

                            {/* Photo Upload */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Foto hinzufügen</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative h-32 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${photo
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 bg-gray-50 dark:bg-gray-800/50'
                                        }`}
                                >
                                    {photo ? (
                                        <>
                                            <img src={photo} className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="w-8 h-8 text-gray-300 mb-2" />
                                            <span className="text-xs font-bold text-gray-400">Tippen zum Hochladen</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 pt-0">
                            <button
                                onClick={handleAddDamage}
                                disabled={!reason || !location}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Eintrag Speichern
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Damage Detail View Modal */}
            {viewingDamage && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md" onClick={() => setViewingDamage(null)} />

                    <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setViewingDamage(null)}
                            className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-all z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Visual/Photo Section */}
                            <div className="bg-gray-100 dark:bg-gray-800 min-h-[300px] relative flex items-center justify-center">
                                {viewingDamage.photo ? (
                                    <img
                                        src={viewingDamage.photo}
                                        alt="Schaden Detail"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400 p-8 text-center">
                                        <Camera className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Kein Foto verfügbar</p>
                                    </div>
                                )}

                                {/* Location indicator on mini-car */}
                                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl p-1 border border-white/10">
                                    <img src={CAR_VIEWS.find(v => v.id === viewingDamage.side)?.src} className="w-full h-full object-contain opacity-50" />
                                    <div
                                        className="absolute w-1.5 h-1.5 bg-red-500 rounded-full border border-white"
                                        style={{ left: `${viewingDamage.x}%`, top: `${viewingDamage.y}%` }}
                                    />
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-8 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 block">
                                            {CAR_VIEWS.find(v => v.id === viewingDamage.side)?.title}
                                        </span>
                                        <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                            {viewingDamage.reason}
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Position</label>
                                            <p className="text-gray-900 dark:text-gray-100 font-medium">{viewingDamage.location}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        onClick={() => {
                                            setDamages(damages.filter(d => d.id !== viewingDamage.id));
                                            setViewingDamage(null);
                                        }}
                                        className="flex-1 py-4 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-2xl transition-all"
                                    >
                                        Löschen
                                    </button>
                                    <button
                                        onClick={() => setViewingDamage(null)}
                                        className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl transition-all"
                                    >
                                        Schließen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

