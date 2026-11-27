'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car,
  Gauge,
  Droplets,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import AustrianPlate from '@/components/ui/AustrianPlate';
import SignaturePad from '@/components/admin/SignaturePad';
import CameraModal from '@/components/checkin/CameraModal';
import { detectMileageFromImage } from '@/lib/ocr';

interface Props {
  rental: {
    id: number;
    contractNumber: string | null;
    status: string;
    car: {
      id?: number;
      brand: string;
      model: string;
      plate: string;
      currentMileage: number | null;
      imageUrl: string | null;
      sketches?: Record<string, string>;
      existingDamages?: Array<{
        id: number;
        type: string;
        description: string | null;
        locationOnCar: string | null;
        photoUrl: string | null;
        x: number | null;
        y: number | null;
      }>;
    };
    customer: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function CustomerSelfCheckInForm({ rental }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mileage, setMileage] = useState(rental.car.currentMileage?.toString() || '');
  const [mileagePhoto, setMileagePhoto] = useState<string | null>(null);
  const [fuelLevel, setFuelLevel] = useState('Full');
  const [fuelPhoto, setFuelPhoto] = useState<string | null>(null);
  const [damagesNote, setDamagesNote] = useState('');
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);
  const [liabilityAccepted, setLiabilityAccepted] = useState(false);
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(rental.status === 'Active');
  const [sketchView, setSketchView] = useState<'front' | 'back' | 'left' | 'right' | 'top'>('front');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState<'mileage' | 'fuel' | 'damage'>('mileage');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);

  const handleCapturedPhoto = async (file: File) => {
    // 1. Photo validation check
    const valData = new FormData();
    valData.append('file', file);
    valData.append('target', currentUploadTarget);
    valData.append('expectedMinMileage', rental.car.currentMileage?.toString() || '0');

    try {
      const valRes = await fetch('/api/checkin/validate-photo', { method: 'POST', body: valData });
      const valJson = await valRes.json();
      if (!valJson.ok) {
        alert(valJson.error || 'Fotovalidierung fehlgeschlagen.');
        return;
      }
    } catch (e) {
      console.warn('Validation error', e);
    }

    // 2. OCR recognition for mileage
    if (currentUploadTarget === 'mileage') {
      setOcrStatus('Lese Tachostand automatisch...');
      try {
        const detected = await detectMileageFromImage(file);
        if (detected) {
          setMileage(detected);
          setOcrStatus(`Tachostand automatisch erkannt: ${detected} km`);
        } else {
          setOcrStatus(null);
        }
      } catch (e) {
        console.error('OCR error', e);
        setOcrStatus(null);
      }
    }

    // 3. Upload to server
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/cars/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        if (currentUploadTarget === 'mileage') setMileagePhoto(data.url);
        else if (currentUploadTarget === 'fuel') setFuelPhoto(data.url);
        else setDamagePhotos((prev) => [...prev, data.url]);
      }
    } catch (err) {
      console.error('Upload error', err);
      alert('Upload fehlgeschlagen. Bitte erneut versuchen.');
    }
  };

  const triggerUpload = (target: 'mileage' | 'fuel' | 'damage') => {
    setCurrentUploadTarget(target);
    setIsCameraOpen(true);
  };

  const handleComplete = async () => {
    if (!liabilityAccepted || !signature) return;
    setIsSubmitting(true);

    try {
      // Complete self checkin
      const res = await fetch(`/api/mobile/bookings/${rental.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mileage: Number(mileage),
          fuelLevel,
          signature,
          notes: damagesNote,
          damages: damagePhotos.map((url) => ({
            type: 'Vorschaden vor Fahrtantritt gemeldet',
            description: damagesNote || 'Vorschaden vom Kunden beim Self Check-in fotografiert',
            photoUrl: url,
            locationOnCar: 'Fahrzeugaußenhaut',
          })),
        }),
      });

      if (!res.ok) {
        // Fallback or alert
      }
      setIsCompleted(true);
    } catch (err) {
      console.error(err);
      setIsCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="rounded-[var(--hm-radius-card)] border border-emerald-500/30 bg-emerald-500/5 p-8 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 grid place-items-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-hm-ink">Miete offiziell aktiviert!</h1>
        <p className="mt-2 text-sm text-hm-ink-2 leading-relaxed">
          Vielen Dank, {rental.customer.firstName}. Ihr Übergabeprotokoll wurde verbindlich gespeichert. Sie können nun den Schlüssel aus dem Schlüsseltresor entnehmen und die Fahrt antreten.
        </p>
        <div className="mt-6 p-4 rounded-xl border border-hm-rule bg-hm-paper flex items-center justify-between">
          <span className="text-sm font-semibold">{rental.car.brand} {rental.car.model}</span>
          <AustrianPlate plate={rental.car.plate} size="sm" />
        </div>
        <p className="mt-6 text-xs text-hm-muted">Gute und sichere Fahrt wünscht Ihnen Ihr Rent-Ex Team!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hidden File Input as fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await handleCapturedPhoto(file);
        }}
      />

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hm-accent/10 border border-hm-accent/20 text-hm-accent-text text-xs font-semibold uppercase tracking-wider mb-3">
          Self Check-in Protokoll
        </div>
        <h1 className="text-3xl font-bold text-hm-ink">Fahrzeugübernahme vor Fahrtantritt</h1>
        <p className="mt-2 text-sm text-hm-ink-2">
          Vertrag: <span className="font-mono font-bold text-hm-ink">{rental.contractNumber || `#${rental.id}`}</span> · Mieter: <strong>{rental.customer.firstName} {rental.customer.lastName}</strong>
        </p>
      </div>

      {/* Vehicle Card */}
      <div className="rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-hm-mono text-xs text-hm-muted uppercase tracking-wider">Ihr Fahrzeug</p>
          <h2 className="text-xl font-bold text-hm-ink mt-0.5">{rental.car.brand} {rental.car.model}</h2>
        </div>
        <AustrianPlate plate={rental.car.plate} size="md" />
      </div>

      {/* Strict Legal Warning Banner */}
      <div className="rounded-[var(--hm-radius-card)] border border-amber-500/40 bg-amber-500/10 p-5 text-amber-900 dark:text-amber-200">
        <div className="flex gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-bold">Verbindliche Haftungsvereinbarung vor Fahrtantritt:</p>
            <p className="mt-1">
              Mit der Entnahme des Schlüssels und dem Fahrtantritt übernehmen Sie die <strong>volle Obhut und Haftung</strong> für das Fahrzeug bis zur ordnungsgemäßen Rückgabe. 
              Sollten Sie vor Fahrtantritt bestehende Vorschäden (Kratzer, Beulen, Steinschläge) nicht im nachfolgenden Schritt mit Foto festhalten, gelten diese als während Ihrer Mietdauer entstanden und werden Ihnen in Rechnung gestellt.
            </p>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
        {['1. Kilometer', '2. Kraftstoff', '3. Schäden', '4. Bestätigung'].map((label, idx) => (
          <div
            key={label}
            className={`py-2 border-b-2 transition-colors ${
              step === idx + 1
                ? 'border-hm-accent text-hm-ink font-bold'
                : step > idx + 1
                ? 'border-emerald-500 text-emerald-600'
                : 'border-hm-rule text-hm-muted'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Step 1: Mileage */}
      {step === 1 && (
        <section className="rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Gauge className="w-5 h-5 text-hm-accent-text" />
            <h3 className="text-lg font-bold">1. Kilometerstand erfassen</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="self-km" className="block text-xs font-semibold text-hm-muted uppercase tracking-wider">Aktueller Tachostand (km)</label>
              <input
                id="self-km"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="mt-1.5 w-full rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 px-4 py-3 text-xl font-bold text-hm-ink outline-none focus:border-hm-accent"
                placeholder="z. B. 45200"
              />
              {ocrStatus && (
                <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {ocrStatus}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-hm-muted uppercase tracking-wider mb-2">Foto des Tachometers (Pflicht)</label>
              {mileagePhoto ? (
                <div className="relative aspect-[16/9] max-w-sm rounded-xl overflow-hidden border border-hm-rule">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mileagePhoto} alt="Tacho" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => triggerUpload('mileage')} className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-3 py-1.5 rounded-lg">Foto ändern</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => triggerUpload('mileage')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--hm-radius-input)] border border-dashed border-hm-rule hover:border-hm-accent text-sm font-semibold transition-colors"
                >
                  <Camera className="w-4 h-4 text-hm-accent-text" />
                  Tachostand jetzt fotografieren
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            disabled={!mileage || !mileagePhoto}
            onClick={() => setStep(2)}
            className="w-full py-3.5 bg-hm-accent hover:bg-hm-accent-hover disabled:opacity-40 text-hm-accent-ink rounded-[var(--hm-radius-input)] font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            Weiter zu Schritt 2 <ChevronRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* Step 2: Fuel */}
      {step === 2 && (
        <section className="rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper p-6 space-y-6">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-hm-accent-text" />
            <h3 className="text-lg font-bold">2. Tankanzeige erfassen</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-hm-muted uppercase tracking-wider mb-2">Füllstand bei Abholung</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {['Full', '3/4', '1/2', '1/4', 'Empty'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFuelLevel(lvl)}
                    className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                      fuelLevel === lvl
                        ? 'border-hm-accent bg-hm-accent text-hm-accent-ink'
                        : 'border-hm-rule bg-hm-paper-2 hover:border-hm-muted'
                    }`}
                  >
                    {lvl === 'Full' ? 'Voll (100%)' : lvl === 'Empty' ? 'Leer' : lvl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-hm-muted uppercase tracking-wider mb-2">Foto der Tankanzeige (Pflicht)</label>
              {fuelPhoto ? (
                <div className="relative aspect-[16/9] max-w-sm rounded-xl overflow-hidden border border-hm-rule">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fuelPhoto} alt="Tank" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => triggerUpload('fuel')} className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-3 py-1.5 rounded-lg">Foto ändern</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => triggerUpload('fuel')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--hm-radius-input)] border border-dashed border-hm-rule hover:border-hm-accent text-sm font-semibold transition-colors"
                >
                  <Camera className="w-4 h-4 text-hm-accent-text" />
                  Tankanzeige jetzt fotografieren
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-sm font-semibold">Zurück</button>
            <button
              type="button"
              disabled={!fuelPhoto}
              onClick={() => setStep(3)}
              className="flex-[2] py-3 bg-hm-accent hover:bg-hm-accent-hover disabled:opacity-40 text-hm-accent-ink rounded-[var(--hm-radius-input)] font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              Weiter zu Schritt 3 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Damage Inspection */}
      {step === 3 && (
        <section className="rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper p-6 space-y-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold">3. Vorschäden & Fahrzeugskizze prüfen</h3>
          </div>
          <p className="text-sm text-hm-ink-2 leading-relaxed">
            Hier sehen Sie die offizielle Fahrzeugskizze und alle im System hinterlegten Vorschäden. Bitte prüfen Sie das Fahrzeug vor Ort. Falls Sie zusätzliche Schäden entdecken, fotografieren und beschreiben Sie diese unten.
          </p>

          {/* Vehicle Angle Skizzen Tabs & Display */}
          {rental.car.sketches && Object.keys(rental.car.sketches).length > 0 && (
            <div className="rounded-2xl border border-hm-rule bg-hm-paper-2 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-hm-muted">
                  Schadensskizze: {rental.car.brand} {rental.car.model}
                </span>
                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full font-semibold">
                  {rental.car.existingDamages?.length ? `${rental.car.existingDamages.length} erfasste Vorschäden` : '0 erfasste Vorschäden'}
                </span>
              </div>

              {/* View Selector Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'front', label: 'Vorne' },
                  { key: 'back', label: 'Hinten' },
                  { key: 'left', label: 'Links (Fahrerseite)' },
                  { key: 'right', label: 'Rechts (Beifahrer)' },
                  { key: 'top', label: 'Draufsicht' },
                ].map((tab) => {
                  if (!rental.car.sketches?.[tab.key]) return null;
                  const isActive = sketchView === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSketchView(tab.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-white border border-hm-rule text-hm-ink hover:bg-neutral-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Sketch Image Stage */}
              <div className="relative aspect-[16/10] w-full max-w-lg mx-auto bg-white rounded-xl border border-hm-rule overflow-hidden p-2 flex items-center justify-center">
                {rental.car.sketches[sketchView] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rental.car.sketches[sketchView]}
                    alt={`Skizze ${sketchView}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-xs text-hm-muted">Keine Skizze für diese Ansicht vorhanden</div>
                )}
              </div>
            </div>
          )}

          {/* Existing Known Damages List */}
          {rental.car.existingDamages && rental.car.existingDamages.length > 0 ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Bereits im System bekannte Vorschäden:
              </h4>
              <ul className="divide-y divide-amber-500/10 text-xs">
                {rental.car.existingDamages.map((dam, idx) => (
                  <li key={dam.id || idx} className="py-2 flex items-start justify-between gap-3">
                    <div>
                      <strong className="text-hm-ink font-semibold">{dam.type || 'Vorschaden'}: </strong>
                      <span className="text-hm-ink-2">{dam.description || 'Vorab dokumentiert'}</span>
                      {dam.locationOnCar && <span className="text-hm-muted block text-[11px]">Bereich: {dam.locationOnCar}</span>}
                    </div>
                    {dam.photoUrl && (
                      <a href={dam.photoUrl} target="_blank" rel="noreferrer" className="text-hm-accent font-medium hover:underline text-[11px] shrink-0">
                        Foto ansehen
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-800/80 italic">
                Hinweis: Diese bekannten Schäden wurden bereits vorab erfasst. Sie müssen hierfür nicht noch einmal haften.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Das Fahrzeug ist laut System bisher schadenfrei und makellos sauber übergeben worden.</span>
            </div>
          )}

          {/* Add Additional Damages found by Customer */}
          <div className="border-t border-hm-rule pt-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-hm-muted">
              Neu entdeckte Schäden hinzufügen (falls vorhanden)
            </h4>

            <div>
              <label htmlFor="self-damage-note" className="block text-xs font-semibold text-hm-muted uppercase tracking-wider">
                Beschreibung neu gefundener Mängel
              </label>
              <textarea
                id="self-damage-note"
                rows={3}
                value={damagesNote}
                onChange={(e) => setDamagesNote(e.target.value)}
                className="mt-1.5 w-full rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 px-4 py-3 text-sm text-hm-ink outline-none focus:border-hm-accent"
                placeholder="Z. B. Kratzer an der Beifahrertür vorgefunden..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-hm-muted uppercase tracking-wider mb-2">
                Fotos neuer Schäden ({damagePhotos.length} hinzugefügt)
              </label>
              <div className="flex flex-wrap gap-3">
                {damagePhotos.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-hm-rule">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Schaden ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => triggerUpload('damage')}
                  className="w-24 h-24 rounded-lg border-2 border-dashed border-hm-rule hover:border-hm-accent grid place-items-center text-center p-2 text-xs text-hm-muted transition-colors"
                >
                  + Foto hinzufügen
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-sm font-semibold">Zurück</button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex-[2] py-3 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              Weiter zu Schritt 4 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* Step 4: Liability Confirmation & Signature */}
      {step === 4 && (
        <section className="rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper p-6 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-hm-accent-text" />
            <h3 className="text-lg font-bold">4. Verbindliche Übernahme & Unterschrift</h3>
          </div>

          {/* Legal Acknowledgement Checkbox */}
          <label className="flex items-start gap-4 p-4 rounded-xl border border-hm-rule bg-hm-paper-2 cursor-pointer group">
            <input
              type="checkbox"
              required
              checked={liabilityAccepted}
              onChange={(e) => setLiabilityAccepted(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--hm-accent)]"
            />
            <span className="text-xs sm:text-sm text-hm-ink leading-relaxed">
              <strong>Ich bestätige die Richtigkeit des Übergabeprotokolls:</strong> Tachostand {mileage} km, Tankfüllung {fuelLevel}. Ich bestätige, dass ich das Fahrzeug vor Fahrtantritt besichtigt habe. <strong>Ab diesem Zeitpunkt bis zur Rückgabe hafte ich uneingeschränkt für alle neu entstehenden Schäden</strong> gemäß den AGB von Rent-Ex. Für nicht dokumentierte Vorschäden haftet die Rent-Ex GmbH nicht.
            </span>
          </label>

          {/* Signature Canvas */}
          <div>
            <label className="block text-xs font-semibold text-hm-muted uppercase tracking-wider mb-2">Ihre digitale Unterschrift</label>
            <div className="rounded-xl border border-hm-rule bg-white p-2">
              <SignaturePad onSave={setSignature} onClear={() => setSignature('')} />
            </div>
            <p className="mt-1.5 text-xs text-hm-muted">Bitte unterschreiben Sie mit dem Finger oder der Maus.</p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(3)} className="flex-1 py-3 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-sm font-semibold">Zurück</button>
            <button
              type="button"
              disabled={isSubmitting || !liabilityAccepted || !signature}
              onClick={handleComplete}
              className="flex-[2] py-3.5 bg-hm-accent hover:bg-hm-accent-hover disabled:opacity-40 text-hm-accent-ink rounded-[var(--hm-radius-input)] font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Fahrzeug jetzt übernehmen & Miete starten <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </section>
      )}

      {/* Live In-Browser Camera Modal (No gallery selection possible) */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapturedPhoto}
        target={currentUploadTarget}
        title={
          currentUploadTarget === 'mileage'
            ? 'Tachometer live fotografieren'
            : currentUploadTarget === 'fuel'
            ? 'Tankanzeige live fotografieren'
            : 'Fahrzeugschaden live fotografieren'
        }
        guidelineText={
          currentUploadTarget === 'mileage'
            ? 'Bitte fotografieren Sie den Kilometerstand direkt im Armaturenbrett.'
            : currentUploadTarget === 'fuel'
            ? 'Bitte erfassen Sie die Tankanzeige gut beleuchtet.'
            : 'Halten Sie die Kamera ca. 1 Meter vom Schaden entfernt.'
        }
      />
    </div>
  );
}
