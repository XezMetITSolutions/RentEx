'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    AlertCircle,
    Camera,
    Info,
    CheckCircle2,
    Plus,
    Loader2
} from 'lucide-react';
import { getTemplateMapping } from '@/app/actions/check-in-setup';

export interface Damage {
    id: string;
    side: 'front' | 'back' | 'left' | 'right';
    x: number; // percentage
    y: number; // percentage
    reason: string;
    location: string;
    photoUrl?: string;
}

interface Props {
    templateFolder: string;
    onChange: (damages: Damage[]) => void;
    externalView?: 'front' | 'back' | 'left' | 'right';
}

export default function CheckInDamageSelector({ templateFolder, onChange, externalView }: Props) {
    const [damages, setDamages] = useState<Damage[]>([]);
    const [activeView, setActiveView] = useState<'front' | 'back' | 'left' | 'right'>(externalView || 'front');

    useEffect(() => {
        if (externalView) setActiveView(externalView);
    }, [externalView]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentClick, setCurrentClick] = useState<{ x: number, y: number, side: Damage['side'] } | null>(null);
    const [viewingDamage, setViewingDamage] = useState<Damage | null>(null);
    const [viewImages, setViewImages] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // Form state
    const [reason, setReason] = useState('');
    const [location, setLocation] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Effort to map folder contents to front/back/left/right automatically
    // In this premium version, we'll use our pre-mapped logic or a convention
    useEffect(() => {
        const loadImages = async () => {
            setLoading(true);
            try {
                const mapping = await getTemplateMapping(templateFolder);
                setViewImages(mapping);
            } catch (error) {
                console.error("Failed to load template images");
            } finally {
                setLoading(false);
            }
        };
        loadImages();
    }, [templateFolder]);

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
            photoUrl: photoUrl || undefined
        };

        const updated = [...damages, newDamage];
        setDamages(updated);
        onChange(updated);
        closeModal();
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentClick(null);
        setReason('');
        setLocation('');
        setPhotoUrl(null);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/admin/cars/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) setPhotoUrl(data.url);
        } catch (error) {
            alert('Upload fehlgeschlagen');
        } finally {
            setIsUploading(false);
        }
    };

    const removeDamage = (id: string) => {
        const updated = damages.filter(d => d.id !== id);
        setDamages(updated);
        onChange(updated);
    };

    const CAR_VIEW_LABELS = {
        front: 'Frontansicht',
        back: 'Heckansicht',
        left: 'Linke Seite',
        right: 'Rechte Seite'
    };

    if (loading) return (
        <div className="h-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-3xl animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <p className="text-sm font-bold text-gray-400">Lade Visuals...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                {/* View Selector Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto hide-scrollbar">
                    {Object.keys(CAR_VIEW_LABELS).map((side) => (
                        <button
                            key={side}
                            type="button"
                            onClick={() => setActiveView(side as any)}
                            className={`flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === side
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            {CAR_VIEW_LABELS[side as keyof typeof CAR_VIEW_LABELS]}
                        </button>
                    ))}
                </div>

                {/* Damage Canvas */}
                <div className="p-4 flex justify-center items-center relative min-h-[300px] bg-gray-50 dark:bg-gray-900/50">
                    <div
                        className="relative cursor-crosshair group max-w-xl w-full"
                        onClick={(e) => handleImageClick(e, activeView)}
                    >
                        <img
                            src={viewImages[activeView]}
                            alt={activeView}
                            className="w-full h-auto rounded-xl select-none"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800'; // Fallback
                            }}
                        />

                        {/* Existing Damage Markers */}
                        {damages.filter(d => d.side === activeView).map((damage) => (
                            <div
                                key={damage.id}
                                className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center animate-pulse z-10 hover:scale-125 transition-transform cursor-pointer"
                                style={{ left: `${damage.x}%`, top: `${damage.y}%` }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingDamage(damage);
                                }}
                            >
                                <div className="w-full h-full bg-red-600 rounded-full border-2 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
                                    <AlertCircle className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        ))}

                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity bg-blue-500 rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Damage Summary List */}
            {damages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {damages.map((d) => (
                        <div key={d.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                            {d.photoUrl ? (
                                <img src={d.photoUrl} className="w-12 h-12 rounded-xl object-cover" />
                            ) : (
                                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                    <Camera className="w-5 h-5 text-gray-300" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-gray-900 dark:text-white truncate">{d.reason.toUpperCase()}</p>
                                <p className="text-[10px] text-gray-500 truncate">{d.location}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeDamage(d.id)}
                                className="p-2 text-gray-200 hover:text-red-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Same Modals (Add/View) as before but generic labels */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-200">
                        <div className="relative h-32 bg-blue-600 p-6 flex flex-col justify-end">
                            <button type="button" onClick={closeModal} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><X className="w-4 h-4" /></button>
                            <h2 className="text-xl font-black text-white">Schaden dokumentieren</h2>

                            <div className="absolute bottom-4 right-6 w-12 h-12 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center p-1 opacity-50">
                                <img src={viewImages[currentClick?.side || 'front']} className="w-full h-full object-contain rounded" />
                                <div className="absolute w-1.5 h-1.5 bg-red-500 rounded-full border border-white" style={{ left: `${currentClick?.x}%`, top: `${currentClick?.y}%` }} />
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Problem</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Kratzer', 'Delle', 'Riss', 'Steinschlag', 'Sonstiges'].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setReason(r)}
                                            className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${reason === r ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 hover:border-blue-200'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Genaue Position</label>
                                <input
                                    type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                                    placeholder="z.B. Kotflügel vorne links"
                                    className="w-full px-5 py-3 text-sm bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 outline-none focus:ring-4 focus:ring-blue-500/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Foto</label>
                                <div
                                    onClick={() => !isUploading && fileInputRef.current?.click()}
                                    className={`relative h-24 rounded-[1.5rem] border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${photoUrl ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 hover:border-blue-400'
                                        }`}
                                >
                                    {isUploading ? <Loader2 className="animate-spin" /> : photoUrl ? <img src={photoUrl} className="w-full h-full object-cover rounded-[1.5rem]" /> : <Camera className="text-gray-300" />}
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 pt-0">
                            <button type="button" onClick={handleAddDamage} disabled={!reason || !location || isUploading} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl transition-all">SPEICHERN</button>
                        </div>
                    </div>
                </div>
            )}

            {viewingDamage && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-md" onClick={() => setViewingDamage(null)} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <button type="button" onClick={() => setViewingDamage(null)} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 z-10"><X className="w-4 h-4" /></button>
                        <div className="h-64 bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center overflow-hidden">
                            {viewingDamage.photoUrl ? <img src={viewingDamage.photoUrl} className="w-full h-full object-cover" /> : <Camera className="w-16 h-16 text-gray-200" />}
                        </div>
                        <div className="p-8 space-y-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{CAR_VIEW_LABELS[viewingDamage.side]}</span>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase">{viewingDamage.reason}</h3>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <label className="text-[10px] font-bold text-gray-400 block mb-1">POSITION</label>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{viewingDamage.location}</p>
                            </div>
                            <button type="button" onClick={() => { removeDamage(viewingDamage.id); setViewingDamage(null); }} className="w-full py-4 text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded-2xl transition-all">LÖSCHEN</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
