'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Car,
    Gauge,
    Droplets,
    ClipboardCheck,
    PenTool,
    ArrowLeft,
    CheckCircle,
    Info
} from 'lucide-react';
import Link from 'next/link';
import SignaturePad from '@/components/admin/SignaturePad';
import FiatDucatoDamageSelector, { Damage } from '@/components/admin/FiatDucatoDamageSelector';
import { performCheckIn } from '@/app/actions/check-in';

export default function CheckInForm({ rental }: { rental: any }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mileage, setMileage] = useState(rental.car.currentMileage || '');
    const [fuelLevel, setFuelLevel] = useState('Full');
    const [damageNotes, setDamageNotes] = useState('');
    const [damages, setDamages] = useState<Damage[]>([]);
    const [signature, setSignature] = useState('');
    const [agbAccepted, setAgbAccepted] = useState(false);

    const carBrand = rental.car.brand?.toLowerCase() || '';
    const carModel = rental.car.model?.toLowerCase() || '';
    const isFiatDucato = carBrand.includes('fiat') || carModel.includes('ducato');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signature || !agbAccepted) return;

        setIsSubmitting(true);
        try {
            await performCheckIn(rental.id, {
                mileage: Number(mileage),
                fuelLevel,
                damageNotes,
                signature,
                damages: isFiatDucato ? damages.map(d => ({
                    type: d.reason,
                    description: d.location,
                    photoUrl: d.photoUrl,
                    locationOnCar: d.side,
                    xPosition: d.x,
                    yPosition: d.y
                })) : undefined
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
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/admin/reservations/${rental.id}`} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Digitaler Check-In</h1>
                    <p className="text-sm text-gray-500">Übergabeprotokoll & Mietvertrag für #{rental.id.toString().padStart(4, '0')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Vehicle Stats */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center gap-2 text-gray-900 font-bold mb-2">
                        <Car className="w-5 h-5 text-blue-500" />
                        Fahrzeugzustand
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Gauge className="w-4 h-4" />
                                Kilometerstand (aktuell: {rental.car.currentMileage?.toLocaleString()} km)
                            </label>
                            <input
                                required
                                type="number"
                                value={mileage}
                                onChange={(e) => setMileage(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                placeholder="z.B. 12500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                <Droplets className="w-4 h-4" />
                                Tankfüllung bei Übergabe
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {['Full', '3/4', '1/2', '1/4'].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFuelLevel(level)}
                                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${fuelLevel === level
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200'
                                            }`}
                                    >
                                        {level === 'Full' ? 'VOLL' : level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Damage Notes & Interactive Selector */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-center gap-2 text-gray-900 font-bold mb-2">
                        <ClipboardCheck className="w-5 h-5 text-blue-500" />
                        Schadenskontrolle
                    </div>

                    {isFiatDucato && (
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-600">Visuelle Schadensmarkierung</label>
                            <FiatDucatoDamageSelector onChange={setDamages} />
                            <div className="border-t border-gray-100 my-4" />
                        </div>
                    )}

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-600">Zusätzliche Anmerkungen</label>
                        <textarea
                            value={damageNotes}
                            onChange={(e) => setDamageNotes(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            placeholder="Weitere Details zum Zustand dokumentieren..."
                        />
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                            <Info className="w-5 h-5 text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                {isFiatDucato
                                    ? "Markieren Sie alle sichtbaren Schäden auf dem Modell oben. Fotos sind dringend empfohlen."
                                    : "Bitte prüfen Sie das Fahrzeug gemeinsam mit dem Kunden auf Kratzer, Dellen oder andere Mängel."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contract & Signature */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
                <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <PenTool className="w-5 h-5 text-blue-500" />
                    Vertragsbestätigung & Unterschrift
                </div>

                <div className="prose prose-sm max-w-none text-gray-500 max-h-48 overflow-y-auto p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="text-gray-900 font-bold">Mietvertrag - Kurzfassung</h3>
                    <p>
                        Der Mieter bestätigt den Erhalt des oben genannten Fahrzeugs im beschriebenen Zustand.
                        Die Allgemeinen Geschäftsbedingungen (AGB) von Rent-Ex wurden gelesen und akzeptiert.
                        Der Mieter verpflichtet sich zur Einhaltung aller vertraglichen Vereinbarungen, insbesondere der Tankregelung und der Rückgabefristen.
                    </p>
                    <p>
                        <strong>Kunde:</strong> {rental.customer.firstName} {rental.customer.lastName}<br />
                        <strong>Fahrzeug:</strong> {rental.car.brand} {rental.car.model} ({rental.car.plate})<br />
                        <strong>Datum:</strong> {new Date().toLocaleDateString('de-DE')}
                    </p>
                </div>

                <div className="space-y-6">
                    <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative flex items-center pt-0.5">
                            <input
                                type="checkbox"
                                required
                                checked={agbAccepted}
                                onChange={(e) => setAgbAccepted(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="w-6 h-6 border-2 border-gray-200 rounded-lg group-hover:border-blue-500 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all"></div>
                            <CheckCircle className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 left-1 transition-opacity" />
                        </div>
                        <span className="text-sm text-gray-600 leading-relaxed">
                            Der Mieter bestätigt hiermit die Richtigkeit der Angaben und akzeptiert die geltenden
                            <a href="/agb" className="text-blue-600 hover:underline mx-1">AGB</a> sowie die
                            <a href="/datenschutz" className="text-blue-600 hover:underline ml-1">Datenschutzerklärung</a>.
                        </span>
                    </label>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900">Unterschrift des Mieters</label>
                        <SignaturePad
                            onSave={setSignature}
                            onClear={() => setSignature('')}
                        />
                    </div>
                </div>

                <button
                    disabled={isSubmitting || !signature || !agbAccepted}
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] text-lg"
                >
                    {isSubmitting ? 'Wird gespeichert...' : 'Check-In abschließen & Vertrag unterzeichnen'}
                </button>
            </div>
        </form>
    );
}
