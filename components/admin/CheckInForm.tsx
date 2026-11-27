'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Car,
    Gauge,
    Droplets,
    ClipboardCheck,
    ArrowLeft,
    CheckCircle,
    Info,
    Camera,
    Loader2,
    Check,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    ShieldCheck
} from 'lucide-react';
import OdometerOCR from '@/components/admin/OdometerOCR';
import SignaturePad from '@/components/admin/SignaturePad';
import CheckInDamageSelector, { Damage } from '@/components/admin/CheckInDamageSelector';
import CameraModal from '@/components/checkin/CameraModal';
import { performCheckIn } from '@/app/actions/check-in';
import { detectMileageFromImage } from '@/lib/ocr';
import { toast } from 'sonner';

type Step = 'SUMMARY' | 'MILEAGE' | 'FUEL' | 'DAMAGE' | 'SIGNATURE';

const STEP_LABELS: Record<Step, string> = {
    SUMMARY: 'Übersicht',
    MILEAGE: 'Kilometerstand',
    FUEL: 'Tankfüllung',
    DAMAGE: 'Zustand & Schäden',
    SIGNATURE: 'Unterschrift'
};

const STEPS: Step[] = ['SUMMARY', 'MILEAGE', 'FUEL', 'DAMAGE', 'SIGNATURE'];

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

    // Camera Modal State
    const [cameraTarget, setCameraTarget] = useState<'mileage' | 'fuel' | null>(null);

    const checkInTemplate = rental.car.checkInTemplate;
    const stepIndex = STEPS.indexOf(currentStep);

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
                    }, 'image/jpeg', 0.7);
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleCameraCapture = async (file: File, type: 'mileage' | 'fuel') => {
        setUploadingPhoto(type);
        try {
            if (type === 'mileage') {
                setIsRecognizing(true);
                detectMileageFromImage(file).then((detected: string | null) => {
                    if (detected) setMileage(detected);
                }).catch((err: unknown) => console.error("Auto-OCR failed", err))
                  .finally(() => setIsRecognizing(false));
            }

            const compressedBlob = await compressImage(file);
            const formData = new FormData();
            formData.append('file', compressedBlob, `${type}.jpg`);

            const res = await fetch('/api/admin/cars/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                if (type === 'mileage') setMileagePhoto(data.url);
                else setFuelPhoto(data.url);
                toast.success(type === 'mileage' ? 'Tachobild erfasst' : 'Tankstand-Foto erfasst');
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            toast.error('Foto-Upload fehlgeschlagen');
        } finally {
            setUploadingPhoto(null);
            setCameraTarget(null);
        }
    };

    const handleSubmit = async () => {
        if (!signature || !agbAccepted) return;

        setIsSubmitting(true);
        try {
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
            toast.success('Übergabe erfolgreich abgeschlossen');
            router.push(`/admin/reservations/${rental.id}`);
        } catch (error) {
            console.error(error);
            toast.error('Fehler beim Check-In');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-24 px-4 pt-4">
            {/* Header Navigation */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-4 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => stepIndex === 0 ? router.back() : prevStep()}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Zurück
                    </button>
                    <div className="text-center">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Übergabeprotokoll</span>
                        <h1 className="text-base font-bold text-gray-900 leading-tight">
                            {rental.car.brand} {rental.car.model} · {rental.car.plate}
                        </h1>
                    </div>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                        Schritt {stepIndex + 1} von {STEPS.length}
                    </span>
                </div>

                {/* Stepper Tabs */}
                <div className="grid grid-cols-5 gap-1 pt-2 border-t border-gray-100">
                    {STEPS.map((s, idx) => {
                        const isCurrent = currentStep === s;
                        const isPast = idx < stepIndex;
                        return (
                            <button
                                key={s}
                                type="button"
                                onClick={() => {
                                    if (idx <= stepIndex) setCurrentStep(s);
                                }}
                                className={`text-center py-1.5 px-1 rounded transition-colors ${
                                    isCurrent ? 'font-bold text-blue-700 bg-blue-50/80' :
                                    isPast ? 'text-gray-600 font-medium hover:bg-gray-50' :
                                    'text-gray-400 font-normal cursor-not-allowed'
                                }`}
                            >
                                <div className={`h-1 w-full rounded-full mb-1.5 ${
                                    isCurrent ? 'bg-blue-600' :
                                    isPast ? 'bg-green-600' :
                                    'bg-gray-200'
                                }`} />
                                <span className="text-[11px] block truncate">{STEP_LABELS[s]}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-sm">
                {/* 1. ÜBERSICHT */}
                {currentStep === 'SUMMARY' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mb-2">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Übergabe vor Ort
                                </span>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {rental.car.brand} {rental.car.model}
                                </h2>
                                <p className="text-sm text-gray-500">Amtliches Kennzeichen: <span className="font-bold text-gray-900">{rental.car.plate}</span></p>
                            </div>
                            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 text-right sm:text-left">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Mieter</span>
                                <span className="text-base font-bold text-gray-900 block">{rental.customer.firstName} {rental.customer.lastName}</span>
                                <span className="text-xs text-gray-500">{rental.customer.phone || rental.customer.email}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Letzter Kilometerstand</span>
                                <div className="flex items-center gap-2">
                                    <Gauge className="w-5 h-5 text-gray-500" />
                                    <span className="text-xl font-black text-gray-900">{rental.car.currentMileage?.toLocaleString() || '0'} km</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Kautionsstatus</span>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm font-bold text-gray-900">Vor Ort zu hinterlegen / autorisiert</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                            <strong>Ablauf der Übergabe:</strong> Erfassen Sie in den folgenden Schritten gemeinsam mit dem Kunden den aktuellen Kilometerstand, den Tankstand sowie vorhandene Vorschäden. Am Ende unterzeichnet der Mieter das digitale Protokoll.
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={nextStep}
                                className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-sm inline-flex items-center justify-center gap-2 transition-colors"
                            >
                                Übergabe starten
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. KILOMETERSTAND */}
                {currentStep === 'MILEAGE' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">1. Kilometerstand dokumentieren</h2>
                            <p className="text-xs text-gray-500 mt-1">Fotografieren Sie den Tacho und tragen Sie den abgelesenen Wert ein.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                                    Aktueller Kilometerstand (km)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={mileage}
                                        onChange={(e) => setMileage(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-2xl font-black text-gray-900 outline-none focus:border-blue-600 transition-colors"
                                        placeholder="z. B. 45200"
                                    />
                                    {isRecognizing && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md text-xs font-semibold text-blue-700 border border-blue-200">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Lese Tacho...
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <OdometerOCR onDetected={setMileage} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors border border-gray-200" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                                    Tacho-Foto (Live-Kamera)
                                </label>
                                <div
                                    onClick={() => setCameraTarget('mileage')}
                                    className={`h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                                        mileagePhoto ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-300 hover:border-blue-500 bg-gray-50'
                                    }`}
                                >
                                    {uploadingPhoto === 'mileage' ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                    ) : mileagePhoto ? (
                                        <div className="relative w-full h-full p-2 flex items-center justify-center">
                                            <img src={mileagePhoto} className="max-h-full max-w-full rounded-lg object-contain" alt="Tacho" />
                                            <span className="absolute bottom-3 right-3 text-[10px] font-bold bg-white/90 text-emerald-800 px-2 py-0.5 rounded shadow">Neu aufnehmen</span>
                                        </div>
                                    ) : (
                                        <div className="text-center p-4">
                                            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-1.5" />
                                            <span className="text-xs font-bold text-gray-700 block">Kamera öffnen</span>
                                            <span className="text-[10px] text-gray-400">Live-Foto vom Tacho aufnehmen</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-between gap-3 border-t border-gray-100">
                            <button
                                onClick={prevStep}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Zurück
                            </button>
                            <button
                                disabled={!mileage}
                                onClick={nextStep}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-1.5 transition-colors"
                            >
                                Weiter zum Tankstand
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. TANKFÜLLUNG */}
                {currentStep === 'FUEL' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">2. Tankfüllung dokumentieren</h2>
                            <p className="text-xs text-gray-500 mt-1">Wählen Sie den Füllstand aus und machen Sie optional ein Foto der Tankanzeige.</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                            {[
                                { key: 'Full', label: 'Voll (100%)' },
                                { key: '3/4', label: '3/4 Voll' },
                                { key: '1/2', label: '1/2 Voll' },
                                { key: '1/4', label: '1/4 Voll' },
                                { key: 'Empty', label: 'Reserve / Leer' },
                            ].map((lvl) => (
                                <button
                                    key={lvl.key}
                                    type="button"
                                    onClick={() => setFuelLevel(lvl.key)}
                                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                                        fuelLevel === lvl.key
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {lvl.label}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                                Foto der Tankanzeige (optional)
                            </label>
                            <div
                                onClick={() => setCameraTarget('fuel')}
                                className={`h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                                    fuelPhoto ? 'border-emerald-500 bg-emerald-50/40' : 'border-gray-300 hover:border-blue-500 bg-gray-50'
                                }`}
                            >
                                {uploadingPhoto === 'fuel' ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                ) : fuelPhoto ? (
                                    <div className="relative w-full h-full p-2 flex items-center justify-center">
                                        <img src={fuelPhoto} className="max-h-full max-w-full rounded-lg object-contain" alt="Tank" />
                                        <span className="absolute bottom-3 right-3 text-[10px] font-bold bg-white/90 text-emerald-800 px-2 py-0.5 rounded shadow">Neu aufnehmen</span>
                                    </div>
                                ) : (
                                    <div className="text-center p-4">
                                        <Camera className="w-7 h-7 text-gray-400 mx-auto mb-1" />
                                        <span className="text-xs font-bold text-gray-700 block">Kamera öffnen</span>
                                        <span className="text-[10px] text-gray-400">Tankanzeige fotografieren</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-between gap-3 border-t border-gray-100">
                            <button
                                onClick={prevStep}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Zurück
                            </button>
                            <button
                                onClick={nextStep}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-1.5 transition-colors"
                            >
                                Weiter zur Zustandsskizze
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* 4. SCHÄDEN & KROKI */}
                {currentStep === 'DAMAGE' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">3. Fahrzeugzustand & Vorschäden</h2>
                            <p className="text-xs text-gray-500 mt-1">
                                Wählen Sie die Ansicht (Front, Heck, Links, Rechts) und tippen Sie auf die Skizze, um einen Schaden zu markieren.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
                            <CheckInDamageSelector
                                templateFolder={checkInTemplate || 'Seat Ibiza'}
                                onChange={setDamages}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                                Zusätzliche Bemerkungen / Notizen zum Zustand
                            </label>
                            <textarea
                                value={damageNotes}
                                onChange={(e) => setDamageNotes(e.target.value)}
                                rows={2}
                                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none focus:border-blue-600 transition-colors"
                                placeholder="z. B. Fahrzeug frisch gereinigt, leichter Steinschlag Windschutzscheibe außerhalb Sichtfeld..."
                            />
                        </div>

                        <div className="pt-4 flex justify-between gap-3 border-t border-gray-100">
                            <button
                                onClick={prevStep}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Zurück
                            </button>
                            <button
                                onClick={nextStep}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-1.5 transition-colors"
                            >
                                Weiter zur Unterschrift
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* 5. UNTERSCHRIFT & ABSCHLUSS */}
                {currentStep === 'SIGNATURE' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">4. Protokoll & Kundenunterschrift</h2>
                            <p className="text-xs text-gray-500 mt-1">Prüfen Sie die Zusammenfassung und lassen Sie den Mieter digital gegenzeichnen.</p>
                        </div>

                        {/* Protokoll Card */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                <span className="font-bold text-gray-900">Mietvertrag {rental.id} · {rental.car.brand} {rental.car.model}</span>
                                <span className="font-bold text-gray-900">{rental.car.plate}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                <div>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Kilometerstand</span>
                                    <span className="font-bold text-gray-900">{mileage || '—'} km</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Tankstand</span>
                                    <span className="font-bold text-gray-900">{fuelLevel}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block">Erfasste Schäden</span>
                                    <span className="font-bold text-gray-900">{damages.length} Markierung(en)</span>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                                Der Mieter bestätigt den ordnungsgemäßen Empfang des Fahrzeugs im dokumentierten Zustand gemäß den Allgemeinen Geschäftsbedingungen von Rent-Ex.
                            </p>
                        </div>

                        {/* AGB Checkbox */}
                        <label className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agbAccepted}
                                onChange={(e) => setAgbAccepted(e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium text-gray-700">
                                Ich bestätige die Richtigkeit aller protokollierten Angaben und akzeptiere die geltenden Mietbedingungen.
                            </span>
                        </label>

                        {/* Signature Pad */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                                Digitale Unterschrift des Mieters
                            </label>
                            <div className="bg-white rounded-xl border border-gray-300 overflow-hidden shadow-inner">
                                <SignaturePad
                                    onSave={setSignature}
                                    onClear={() => setSignature('')}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-between gap-3 border-t border-gray-100">
                            <button
                                onClick={prevStep}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Zurück
                            </button>
                            <button
                                disabled={isSubmitting || !signature || !agbAccepted}
                                onClick={handleSubmit}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-sm inline-flex items-center gap-1.5 transition-colors"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Übergabe abschließen & Fahrzeug aktivieren
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Camera Modal */}
            {cameraTarget && (
                <CameraModal
                    isOpen={true}
                    onClose={() => setCameraTarget(null)}
                    onCapture={(file) => handleCameraCapture(file, cameraTarget)}
                    target={cameraTarget}
                    title={cameraTarget === 'mileage' ? 'Kilometerstand fotografieren' : 'Tankanzeige fotografieren'}
                    guidelineText={cameraTarget === 'mileage' ? 'Halten Sie den Tacho gut lesbar in den Rahmen.' : 'Fotografieren Sie die Tankanzeige im Cockpit.'}
                />
            )}
        </div>
    );
}
