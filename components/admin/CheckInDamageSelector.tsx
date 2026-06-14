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
import { toast } from 'sonner';

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

    const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 1920;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas to Blob failed'));
                    }, 'image/jpeg', 0.7);
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const compressedBlob = await compressImage(file);
            const formData = new FormData();
            formData.append('file', compressedBlob, 'damage.jpg');
            const res = await fetch('/api/admin/cars/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) setPhotoUrl(data.url);
            else throw new Error(data.error || 'Upload failed');
        } catch (error) {
            console.error('Damage Photo Upload Error:', error);
            toast.error('Upload fehlgeschlagen — das Bild ist evtl. zu groß.');
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
            <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Segmented View Selector Tabs */}
                <div className="flex bg-gray-50 dark:bg-gray-900/50 p-2 border-b border-gray-100 dark:border-gray-800/80 gap-1.5 overflow-x-auto hide-scrollbar">
                    {Object.keys(CAR_VIEW_LABELS).map((side) => {
                        const isActive = activeView === side;
                        return (
                            <button
                                key={side}
                                type="button"
                                onClick={() => setActiveView(side as any)}
                                className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-2xl transition-all whitespace-nowrap ${
                                    isActive
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-gray-700/50'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            >
                                {CAR_VIEW_LABELS[side as keyof typeof CAR_VIEW_LABELS]}
                            </button>
                        );
                    })}
                </div>

                {/* Damage Canvas */}
                <div className="p-6 flex justify-center items-center relative min-h-[320px] bg-gray-50/50 dark:bg-gray-900/10">
                    <div
                        className="relative cursor-crosshair group max-w-xl w-full border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-inner"
                        onClick={(e) => handleImageClick(e, activeView)}
                    >
                        <img
                            src={viewImages[activeView]}
                            alt={activeView}
                            className="w-full h-auto select-none"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/cars/skoda_superb.png'; // Fallback
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
                                <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white dark:border-gray-950 shadow-md flex items-center justify-center">
                                    <AlertCircle className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>
                        ))}

                        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity bg-blue-500" />
                    </div>
                </div>
            </div>

            {/* Damage Summary List */}
            {damages.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {damages.map((d) => (
                        <div key={d.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-150 dark:border-gray-850 shadow-sm">
                            {d.photoUrl ? (
                                <img src={d.photoUrl} className="w-12 h-12 rounded-xl object-cover border border-gray-100 dark:border-gray-800" />
                            ) : (
                                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                    <Camera className="w-5 h-5 text-gray-300 dark:text-gray-650" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{d.reason.toUpperCase()}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{d.location}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeDamage(d.id)}
                                className="p-2 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
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
                    <div className="absolute inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
                        <div className="relative h-28 bg-gray-900 dark:bg-gray-950 p-6 flex flex-col justify-end">
                            <button type="button" onClick={closeModal} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X className="w-4 h-4" /></button>
                            <h2 className="text-lg font-semibold text-white tracking-tight">Schaden dokumentieren</h2>

                            <div className="absolute bottom-4 right-6 w-12 h-12 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center p-1 border border-white/10">
                                <img src={viewImages[currentClick?.side || 'front']} className="w-full h-full object-contain rounded" />
                                <div className="absolute w-1.5 h-1.5 bg-red-500 rounded-full border border-white" style={{ left: `${currentClick?.x}%`, top: `${currentClick?.y}%` }} />
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Problem</label>
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {['Kratzer', 'Delle', 'Riss', 'Steinschlag', 'Sonstiges'].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setReason(r)}
                                            className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${
                                                reason === r 
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-200'
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Genaue Position</label>
                                <input
                                    type="text" 
                                    value={location} 
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="z.B. Kotflügel vorne links"
                                    className="w-full px-4 py-3 text-sm bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Foto aufnehmen</label>
                                <div
                                    onClick={() => !isUploading && fileInputRef.current?.click()}
                                    className={`relative h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                                        photoUrl 
                                            ? 'border-green-500/50 bg-green-50/10 dark:bg-green-950/10' 
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 bg-gray-50/50 dark:bg-gray-800/20'
                                    }`}
                                >
                                    {isUploading ? (
                                        <Loader2 className="animate-spin text-blue-600" />
                                    ) : photoUrl ? (
                                        <img src={photoUrl} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <>
                                            <Camera className="text-gray-350 dark:text-gray-600 w-5 h-5 mb-1" />
                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Klicken zum Fotografieren</span>
                                        </>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 pt-0">
                            <button 
                                type="button" 
                                onClick={handleAddDamage} 
                                disabled={!reason || !location || isUploading} 
                                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-30 transition-all shadow-sm"
                            >
                                SPEICHERN
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewingDamage && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/75 dark:bg-gray-950/80 backdrop-blur-md" onClick={() => setViewingDamage(null)} />
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-850 animate-in fade-in zoom-in duration-200">
                        <button type="button" onClick={() => setViewingDamage(null)} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white z-10 transition-colors"><X className="w-4 h-4" /></button>
                        <div className="h-60 bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center overflow-hidden">
                            {viewingDamage.photoUrl ? (
                                <img src={viewingDamage.photoUrl} className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="w-12 h-12 text-gray-200 dark:text-gray-700" />
                            )}
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">{CAR_VIEW_LABELS[viewingDamage.side]}</span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase mt-0.5">{viewingDamage.reason}</h3>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 block mb-1">POSITION</label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{viewingDamage.location}</p>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => { removeDamage(viewingDamage.id); setViewingDamage(null); }} 
                                className="w-full py-3 text-red-650 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-950/20 dark:hover:bg-red-950/40 font-semibold rounded-xl transition-all"
                            >
                                LÖSCHEN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
