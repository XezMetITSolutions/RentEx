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

type Step = 'SUMMARY' | 'MILEAGE' | 'FUEL' | 'DAMAGE_FRONT' | 'DAMAGE_BACK' | 'DAMAGE_LEFT' | 'DAMAGE_RIGHT' | 'SIGNATURE';

const STEPS: Step[] = ['SUMMARY', 'MILEAGE', 'FUEL', 'DAMAGE_FRONT', 'DAMAGE_BACK', 'DAMAGE_LEFT', 'DAMAGE_RIGHT', 'SIGNATURE'];

export default function CheckInForm({ rental }: { rental: any }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>('SUMMARY');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'mileage' | 'fuel') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPhoto(type);
        try {
            // Compress image if it's too large or just as a precaution
            const compressedBlob = await compressImage(file);

            const formData = new FormData();
            formData.append('file', compressedBlob, 'upload.jpg');

            const res = await fetch('/api/admin/cars/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                if (type === 'mileage') setMileagePhoto(data.url);
                else setFuelPhoto(data.url);
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Upload fehlgeschlagen - Das Bild ist evtl. zu groß.');
        } finally {
            setUploadingPhoto(null);
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
            alert('Fehler beim Check-In');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Professional Progress Bar */}
            <div className="mb-8 sticky top-0 z-50 bg-gray-50/80 backdrop-blur-md pt-4 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => stepIndex === 0 ? router.back() : prevStep()} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-400" />
                    </button>
                    <div className="text-center">
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Check-In Funnel</h2>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Schritt {stepIndex + 1} von {STEPS.length}</p>
                    </div>
                    <div className="w-10" />
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {currentStep === 'SUMMARY' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                <Car className="w-3 h-3" />
                                Bereit für Übergabe
                            </div>
                            <h1 className="text-5xl font-black text-gray-900 leading-none mb-6 tracking-tighter">
                                {rental.car.brand} <br />
                                <span className="text-blue-600 font-outline-2">{rental.car.model}</span>
                            </h1>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Gauge className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Letzter KM-Stand</p>
                                        <p className="text-xl font-black text-gray-900">{rental.car.currentMileage?.toLocaleString()} km</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><Droplets className="w-6 h-6" /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kunde</p>
                                        <p className="text-xl font-black text-gray-900">{rental.customer.firstName} {rental.customer.lastName}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={nextStep}
                                className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                            >
                                CHECK-IN STARTEN
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="relative group">
                            <img src={rental.car.imageUrl || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800"} className="w-full h-auto rounded-[3rem] shadow-2xl transition-transform group-hover:scale-[1.02] duration-700" alt="Car" />
                            <div className="absolute top-8 right-8 px-6 py-3 bg-white/90 backdrop-blur rounded-full shadow-lg font-black text-gray-900 tracking-tighter">
                                {rental.car.plate}
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 'MILEAGE' && (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Gauge className="w-10 h-10 text-blue-600" />
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Kilometerstand</h2>
                            <p className="text-gray-500 font-medium">Bitte fotografieren Sie das Dashboard und bestätigen Sie den Wert.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Aktueller Wert (km)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={mileage}
                                        onChange={(e) => setMileage(e.target.value)}
                                        className="flex-1 px-8 py-6 bg-white border-2 border-gray-100 rounded-[2rem] text-3xl font-black text-gray-900 outline-none focus:border-blue-500 transition-all placeholder:text-gray-200"
                                        placeholder="00000"
                                    />
                                    <OdometerOCR onDetected={setMileage} className="p-6 bg-blue-50 text-blue-600 rounded-[2rem] hover:bg-blue-100 transition-colors border-2 border-blue-100" />
                                </div>
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                                    <Info className="w-5 h-5 text-amber-600 shrink-0" />
                                    <p className="text-xs text-amber-800 font-bold">Bitte stellen Sie sicher, dass der Kilometerstand korrekt gelesen wurde.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Fotonachweis</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative h-[200px] rounded-[2.5rem] border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all ${mileagePhoto ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400 bg-white'}`}
                                >
                                    {uploadingPhoto === 'mileage' ? (
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                    ) : mileagePhoto ? (
                                        <>
                                            <img src={mileagePhoto} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <Camera className="w-8 h-8 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tippen zum Fotografieren</p>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'mileage')} />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={!mileage || !mileagePhoto}
                            onClick={nextStep}
                            className="w-full py-6 bg-gray-900 rounded-[2rem] text-white font-black text-xl flex items-center justify-center gap-3 disabled:opacity-30 transition-all hover:bg-black"
                        >
                            WEITER
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {currentStep === 'FUEL' && (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Droplets className="w-10 h-10 text-blue-600" />
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Tankfüllung</h2>
                            <p className="text-gray-500 font-medium">Wählen Sie den Füllstand und machen Sie ein Beweisfoto.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {['Full', '3/4', '1/2', '1/4', 'Empty'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setFuelLevel(level)}
                                    className={`py-6 rounded-[2rem] text-xl font-black border-4 transition-all ${fuelLevel === level ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/30 scale-[1.02]' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-100'}`}
                                >
                                    {level === 'Full' ? 'VOLL (100%)' : level === 'Empty' ? 'LEER' : level}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Fotonachweis (Tankanzeige)</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative h-[200px] rounded-[2.5rem] border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all ${fuelPhoto ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400 bg-white'}`}
                            >
                                {uploadingPhoto === 'fuel' ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                ) : fuelPhoto ? (
                                    <>
                                        <img src={fuelPhoto} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <Camera className="w-8 h-8 text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tippen zum Fotografieren</p>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'fuel')} />
                            </div>
                        </div>

                        <button
                            disabled={!fuelPhoto}
                            onClick={nextStep}
                            className="w-full py-6 bg-gray-900 rounded-[2rem] text-white font-black text-xl flex items-center justify-center gap-3 disabled:opacity-30 transition-all hover:bg-black"
                        >
                            WEITER
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {currentStep.startsWith('DAMAGE_') && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">
                                {currentStep === 'DAMAGE_FRONT' && 'Vorderseite'}
                                {currentStep === 'DAMAGE_BACK' && 'Rückseite'}
                                {currentStep === 'DAMAGE_LEFT' && 'Linke Seite'}
                                {currentStep === 'DAMAGE_RIGHT' && 'Rechte Seite'}
                            </h2>
                            <p className="text-gray-500 font-medium">Markieren Sie vorhandene oder neue Schäden durch Tippen auf das Bild.</p>
                        </div>

                        <div className="bg-white p-4 rounded-[3rem] shadow-xl border border-gray-100">
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

                        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <button
                                onClick={prevStep}
                                className="py-6 bg-gray-100 rounded-[2rem] text-gray-500 font-black text-xl flex items-center justify-center gap-3 hover:bg-gray-200"
                            >
                                <ChevronLeft className="w-6 h-6" />
                                ZURÜCK
                            </button>
                            <button
                                onClick={nextStep}
                                className="py-6 bg-gray-900 rounded-[2rem] text-white font-black text-xl flex items-center justify-center gap-3 hover:bg-black"
                            >
                                WEITER
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'SIGNATURE' && (
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="text-center">
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-4 tracking-tighter">Abschluss & Unterschrift</h2>
                            <div className="prose prose-sm max-w-none text-left bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 max-h-[300px] overflow-y-auto mb-8 shadow-inner">
                                <h3 className="text-xl font-black uppercase mb-4 text-gray-900">Mietvertragsprotokoll</h3>
                                <div className="space-y-4 text-gray-600 leading-relaxed font-medium">
                                    <p>Der Mieter bestätigt den Erhalt des Fahrzeugs <strong>{rental.car.brand} {rental.car.model} ({rental.car.plate})</strong> im protokollierten Zustand.</p>
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Kilometerstand</p>
                                            <p className="text-lg font-black text-gray-900">{mileage} km</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Tankfüllung</p>
                                            <p className="text-lg font-black text-gray-900">{fuelLevel}</p>
                                        </div>
                                    </div>
                                    <p>Die Allgemeinen Geschäftsbedingungen wurden zur Kenntnis genommen. Der Mieter haftet für alle nicht im Protokoll vermerkten Schäden bei Rückgabe.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="flex items-start gap-5 cursor-pointer group p-6 bg-white rounded-[2rem] border-2 border-transparent hover:border-blue-100 transition-all">
                                <input
                                    type="checkbox"
                                    required
                                    checked={agbAccepted}
                                    onChange={(e) => setAgbAccepted(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="w-8 h-8 border-4 border-gray-100 rounded-xl group-hover:border-blue-200 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all shadow-sm">
                                    <Check className="w-6 h-6 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-sm font-bold text-gray-600 leading-relaxed pt-1">
                                    Ich bestätige die Richtigkeit der Angaben und akzeptiere die geltenden AGB sowie die Datenschutzerklärung.
                                </span>
                            </label>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Unterschrift des mieters</label>
                                <div className="bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-xl">
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
                                className="flex-1 py-6 bg-gray-100 rounded-[2rem] text-gray-500 font-black text-xl flex items-center justify-center gap-3 hover:bg-gray-200"
                            >
                                <ChevronLeft className="w-6 h-6" />
                                ZURÜCK
                            </button>
                            <button
                                disabled={isSubmitting || !signature || !agbAccepted}
                                onClick={handleSubmit}
                                className="flex-[2] py-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-black text-xl rounded-[2rem] shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle className="w-6 h-6" /> CHECK-IN ABSCHLIESSEN</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Hidden damage notes field for internal use */}
            {currentStep === 'SIGNATURE' && (
                <div className="mt-8 max-w-3xl mx-auto">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Interne Notizen / Schäden Beschreibung</label>
                    <textarea
                        value={damageNotes}
                        onChange={(e) => setDamageNotes(e.target.value)}
                        rows={3}
                        className="w-full px-8 py-6 bg-white border-2 border-gray-100 rounded-[2rem] text-sm font-medium text-gray-700 outline-none focus:border-blue-500 transition-all mt-2"
                        placeholder="Zusätzliche Anmerkungen zum Fahrzeugzustand..."
                    />
                </div>
            )}
        </div>
    );
}
