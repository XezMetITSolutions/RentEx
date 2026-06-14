'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Car,
    Gauge,
    Droplets,
    ClipboardCheck,
    PenTool,
    ArrowLeft,
    CheckCircle,
    Info,
    Camera,
    Loader2,
    Check,
    ChevronRight,
    ChevronLeft,
    AlertCircle
} from 'lucide-react';
import OdometerOCR from '@/components/admin/OdometerOCR';
import Link from 'next/link';
import SignaturePad from '@/components/admin/SignaturePad';
import CheckInDamageSelector, { Damage } from '@/components/admin/CheckInDamageSelector';
import { performCheckIn } from '@/app/actions/check-in';
import { detectMileageFromImage } from '@/lib/ocr';
import { toast } from 'sonner';

type Step = 'SUMMARY' | 'MILEAGE' | 'FUEL' | 'DAMAGE_FRONT' | 'DAMAGE_BACK' | 'DAMAGE_LEFT' | 'DAMAGE_RIGHT' | 'SIGNATURE';

const STEPS: Step[] = ['SUMMARY', 'MILEAGE', 'FUEL', 'DAMAGE_FRONT', 'DAMAGE_BACK', 'DAMAGE_LEFT', 'DAMAGE_RIGHT', 'SIGNATURE'];

export default function CheckInForm({ rental }: { rental: any }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>('SUMMARY');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRecognizing, setIsRecognizing] = useState(false);

    // Form State
    const [mileage, setMileage] = useState(rental.car.currentMileage?.toString() || '');
    const [mileagePhoto, setMileagePhoto] = useState<string | null>(null);
    const [fuelLevel, setFuelLevel] = useState('Full');
    const [fuelPhoto, setFuelPhoto] = useState<string | null>(null);
    const [damageNotes, setDamageNotes] = useState('');
    const [damages, setDamages] = useState<Damage[]>([]);
    const [signature, setSignature] = useState('');
    const [agbAccepted, setAgbAccepted] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
    const [isDragOverMileage, setIsDragOverMileage] = useState(false);
    const [isDragOverFuel, setIsDragOverFuel] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const checkInTemplate = rental.car.checkInTemplate;
    const stepIndex = STEPS.indexOf(currentStep);
    const progress = ((stepIndex + 1) / STEPS.length) * 100;

    const nextStep = () => {
        const nextIdx = stepIndex + 1;
        if (nextIdx < STEPS.length) setCurrentStep(STEPS[nextIdx]);
    };

    const prevStep = () => {
        const prevIdx = stepIndex - 1;
        if (prevIdx >= 0) setCurrentStep(STEPS[prevIdx]);
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

                    // Max dimensions 1920px
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1920;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas to Blob failed'));
                    }, 'image/jpeg', 0.7); // 70% quality
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const processFile = async (file: File, type: 'mileage' | 'fuel') => {
        setUploadingPhoto(type);
        try {
            if (type === 'mileage') {
                setIsRecognizing(true);
                detectMileageFromImage(file).then((detected: string | null) => {
                    if (detected) {
                        setMileage(detected);
                    }
                })
                    .catch((err: unknown) => console.error("Auto-OCR failed", err))
                    .finally(() => setIsRecognizing(false));
            }

            const compressedBlob = await compressImage(file);

            const formData = new FormData();
            formData.append('file', compressedBlob, 'upload.jpg');

            const res = await fetch('/api/admin/cars/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                if (type === 'mileage') setMileagePhoto(data.url);
                else setFuelPhoto(data.url);
                toast.success('Foto erfolgreich hochgeladen.');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('Upload fehlgeschlagen — das Bild ist evtl. zu groß.');
            setIsRecognizing(false);
        } finally {
            setUploadingPhoto(null);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'mileage' | 'fuel') => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFile(file, type);
    };

    const handleDragOver = (e: React.DragEvent, type: 'mileage' | 'fuel') => {
        e.preventDefault();
        if (type === 'mileage') setIsDragOverMileage(true);
        else setIsDragOverFuel(true);
    };

    const handleDragLeave = (type: 'mileage' | 'fuel') => {
        if (type === 'mileage') setIsDragOverMileage(false);
        else setIsDragOverFuel(false);
    };

    const handleDrop = async (e: React.DragEvent, type: 'mileage' | 'fuel') => {
        e.preventDefault();
        if (type === 'mileage') setIsDragOverMileage(false);
        else setIsDragOverFuel(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            await processFile(file, type);
        }
    };

    const handleSubmit = async () => {
        if (!signature || !agbAccepted) return;

        setIsSubmitting(true);
        try {
            // Combine proof photos with damages for record keeping
            const allDamages = [...damages];
            if (mileagePhoto) {
                allDamages.push({ id: 'proof-mileage', side: 'front', x: 0, y: 0, reason: 'PROOF_MILEAGE', location: `Kilometerstand Foto: ${mileage} km`, photoUrl: mileagePhoto });
            }
            if (fuelPhoto) {
                allDamages.push({ id: 'proof-fuel', side: 'front', x: 0, y: 0, reason: 'PROOF_FUEL', location: `Tankfüllung Foto: ${fuelLevel}`, photoUrl: fuelPhoto });
            }

            await performCheckIn(rental.id, {
                mileage: Number(mileage),
                fuelLevel,
                damageNotes,
                signature,
                mileagePhoto: mileagePhoto || undefined,
                fuelPhoto: fuelPhoto || undefined,
                damages: allDamages.map(d => ({
                    type: d.reason,
                    description: d.location,
                    photoUrl: d.photoUrl,
                    locationOnCar: d.side,
                    xPosition: d.x,
                    yPosition: d.y
                }))
            });
            router.push(`/admin/reservations/${rental.id}`);
        } catch (error) {
            console.error(error);
            toast.error('Fehler beim Check-In');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto pb-20 px-4 sm:px-6 space-y-8">
            {/* Header / Step Bar */}
            <div className="sticky top-0 z-50 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-md pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex items-center justify-between mb-4">
                    <button 
                        onClick={() => stepIndex === 0 ? router.back() : prevStep()} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2 justify-center">
                            <ClipboardCheck className="w-5 h-5 text-gray-400" />
                            Check-In Übergabeprotokoll
                        </h2>
                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">
                            Schritt {stepIndex + 1} von {STEPS.length} — {currentStep}
                        </p>
                    </div>
                    <div className="w-9" />
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Main Form Box */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm transition-colors animate-in fade-in duration-300">
                {currentStep === 'SUMMARY' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-100/30 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                <Car className="w-3.5 h-3.5" />
                                Bereit für Übergabe
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                                {rental.car.brand} <span className="text-blue-600 dark:text-blue-400">{rental.car.model}</span>
                            </h1>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-300 border border-gray-100 dark:border-gray-600">
                                        <Gauge className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Letzter KM-Stand</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{rental.car.currentMileage?.toLocaleString()} km</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-300 border border-gray-100 dark:border-gray-600">
                                        <Car className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kennzeichen</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{rental.car.plate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kunde / Mieter</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{rental.customer.firstName} {rental.customer.lastName}</p>
                            </div>

                            <button
                                onClick={nextStep}
                                className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
                            >
                                CHECK-IN STARTEN
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="relative flex justify-center items-center">
                            {/* Sleek backdrop gradient */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-3xl dark:from-blue-500/10 dark:to-purple-500/10" />
                            <div className="relative p-4">
                                <img 
                                    src={rental.car.imageUrl || "/assets/cars/skoda_superb.png"} 
                                    className="w-full max-h-[320px] object-contain rounded-2xl drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_20px_35px_rgba(255,255,255,0.05)] transition-transform hover:scale-[1.01] duration-500" 
                                    alt="Car" 
                                />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 'MILEAGE' && (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30">
                                <Gauge className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Kilometerstand erfassen</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Tragen Sie den aktuellen Tachostand ein. Nutzen Sie OCR oder fotografieren Sie das Dashboard.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Aktueller Wert (km)</label>
                                <div className="flex gap-2 relative items-stretch">
                                    <input
                                        type="number"
                                        value={mileage}
                                        onChange={(e) => setMileage(e.target.value)}
                                        className="flex-1 px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xl font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                                        placeholder="z.B. 45000"
                                    />
                                    {isRecognizing && (
                                        <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 animate-in fade-in zoom-in duration-300">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Erkenne...</span>
                                        </div>
                                    )}
                                    <OdometerOCR onDetected={setMileage} className="px-5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors border border-blue-100 dark:border-blue-900/30 flex items-center justify-center" />
                                </div>
                                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100/50 dark:border-amber-900/30 flex gap-3">
                                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">Bitte vergleichen Sie das ausgelesene bzw. eingegebene Ergebnis noch einmal mit dem Tacho.</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Fotonachweis</label>
                                <div
                                    onDragOver={(e) => handleDragOver(e, 'mileage')}
                                    onDragLeave={() => handleDragLeave('mileage')}
                                    onDrop={(e) => handleDrop(e, 'mileage')}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative h-[200px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                                        isDragOverMileage ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 scale-[1.01]' :
                                        mileagePhoto ? 'border-green-500/50 bg-green-50/10 dark:bg-green-950/5' : 'border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-900 bg-gray-50/30 dark:bg-gray-800/20 hover:scale-[1.005]'
                                    }`}
                                >
                                    {uploadingPhoto === 'mileage' ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wird hochgeladen...</p>
                                        </div>
                                    ) : mileagePhoto ? (
                                        <>
                                            <img src={mileagePhoto} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-2">
                                                <Camera className="w-6 h-6 text-white" />
                                                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Ersetzen</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-6">
                                            <Camera className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Bild per Drag & Drop oder Klick</p>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Tachometer gut lesbar fotografieren</p>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'mileage')} />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={!mileage || !mileagePhoto}
                            onClick={nextStep}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-sm"
                        >
                            WEITER
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {currentStep === 'FUEL' && (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30">
                                <Droplets className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Tankfüllung protokollieren</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Geben Sie den aktuellen Kraftstoff- oder Ladestand an.</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {[
                                { val: 'Full', label: '100% (Voll)' },
                                { val: '3/4', label: '75% (3/4)' },
                                { val: '1/2', label: '50% (1/2)' },
                                { val: '1/4', label: '25% (1/4)' },
                                { val: 'Empty', label: '0% (Leer)' }
                            ].map((item) => {
                                const isSelected = fuelLevel === item.val;
                                return (
                                    <button
                                        key={item.val}
                                        type="button"
                                        onClick={() => setFuelLevel(item.val)}
                                        className={`py-4 px-2 rounded-2xl text-xs font-semibold border transition-all ${
                                            isSelected 
                                                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm scale-[1.01]' 
                                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Fotonachweis (Tankanzeige)</label>
                            <div
                                onDragOver={(e) => handleDragOver(e, 'fuel')}
                                onDragLeave={() => handleDragLeave('fuel')}
                                onDrop={(e) => handleDrop(e, 'fuel')}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative h-[200px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all ${
                                    isDragOverFuel ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 scale-[1.01]' :
                                    fuelPhoto ? 'border-green-500/50 bg-green-50/10 dark:bg-green-950/5' : 'border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-900 bg-gray-50/30 dark:bg-gray-800/20 hover:scale-[1.005]'
                                }`}
                            >
                                {uploadingPhoto === 'fuel' ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wird hochgeladen...</p>
                                    </div>
                                ) : fuelPhoto ? (
                                    <>
                                        <img src={fuelPhoto} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity gap-2">
                                            <Camera className="w-6 h-6 text-white" />
                                            <span className="text-[10px] text-white font-bold uppercase tracking-wider">Ersetzen</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <Camera className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Bild per Drag & Drop oder Klick</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Armaturenbrett / Reichweite fotografieren</p>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'fuel')} />
                            </div>
                        </div>

                        <button
                            disabled={!fuelPhoto}
                            onClick={nextStep}
                            className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-sm"
                        >
                            WEITER
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {currentStep.startsWith('DAMAGE_') && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Schäden dokumentieren: {
                                    currentStep === 'DAMAGE_FRONT' ? 'Vorderseite' :
                                    currentStep === 'DAMAGE_BACK' ? 'Rückseite' :
                                    currentStep === 'DAMAGE_LEFT' ? 'Linke Seite' : 'Rechte Seite'
                                }
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Klicken Sie auf das Bild, um an dieser Stelle einen neuen Schaden hinzuzufügen.</p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-950 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-inner">
                            <CheckInDamageSelector
                                templateFolder={checkInTemplate || 'default'}
                                onChange={setDamages}
                                externalView={
                                    currentStep === 'DAMAGE_FRONT' ? 'front' :
                                    currentStep === 'DAMAGE_BACK' ? 'back' :
                                    currentStep === 'DAMAGE_LEFT' ? 'left' : 'right'
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
                            <button
                                onClick={prevStep}
                                className="py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                ZURÜCK
                            </button>
                            <button
                                onClick={nextStep}
                                className="py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-sm"
                            >
                                WEITER
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'SIGNATURE' && (
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight text-center">Abschluss & Unterschrift</h2>
                            
                            {/* Borderless legal prose container */}
                            <div className="text-left bg-transparent max-h-[250px] overflow-y-auto mb-8 pr-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                                <h3 className="text-sm font-semibold uppercase mb-3 text-gray-900 dark:text-white">Mietvertragsprotokoll</h3>
                                <div className="space-y-4 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                    <p>Der Mieter bestätigt den Erhalt des Fahrzeugs <strong>{rental.car.brand} {rental.car.model} ({rental.car.plate})</strong> im protokollierten Zustand.</p>
                                    
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kilometerstand</p>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{mileage} km</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tankfüllung</p>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{fuelLevel}</p>
                                        </div>
                                    </div>
                                    <p>Die Allgemeinen Geschäftsbedingungen wurden zur Kenntnis genommen. Der Mieter haftet für alle nicht im Protokoll vermerkten Schäden bei Rückgabe.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="flex items-start gap-4 cursor-pointer group p-5 bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                                <input
                                    type="checkbox"
                                    required
                                    checked={agbAccepted}
                                    onChange={(e) => setAgbAccepted(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 rounded-md group-hover:border-blue-400 peer-checked:border-blue-600 peer-checked:bg-blue-600 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500 transition-all flex items-center justify-center shadow-sm">
                                    <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 leading-normal select-none">
                                    Ich bestätige die Richtigkeit der Angaben und akzeptiere die geltenden AGB sowie die Datenschutzerklärung.
                                </span>
                            </label>

                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Unterschrift des Mieters</label>
                                <div className="bg-white dark:bg-gray-950 p-2 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md">
                                    <SignaturePad
                                        onSave={setSignature}
                                        onClear={() => setSignature('')}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={prevStep}
                                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                ZURÜCK
                            </button>
                            <button
                                disabled={isSubmitting || !signature || !agbAccepted}
                                onClick={handleSubmit}
                                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:pointer-events-none text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/15 dark:shadow-blue-500/5 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> CHECK-IN ABSCHLIESSEN</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden damage notes field for internal use */}
            {currentStep === 'SIGNATURE' && (
                <div className="max-w-3xl mx-auto space-y-2">
                    <label className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider">Interne Notizen / Schäden Beschreibung</label>
                    <textarea
                        value={damageNotes}
                        onChange={(e) => setDamageNotes(e.target.value)}
                        rows={3}
                        className="w-full px-5 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-700 dark:text-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all mt-1"
                        placeholder="Zusätzliche Anmerkungen zum Fahrzeugzustand..."
                    />
                </div>
            )}
        </div>
    );
}
