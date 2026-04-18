"use client";

import React, { useState } from 'react';
import { Globe, MapPin, CheckCircle2 } from 'lucide-react';

export default function AGBPage() {
    const [selectedCountry, setSelectedCountry] = useState<'AT' | 'DE' | 'CH'>('AT');

    const countries = [
        { id: 'AT', name: 'Österreich', icon: '🇦🇹' },
        { id: 'DE', name: 'Deutschland', icon: '🇩🇪' },
        { id: 'CH', name: 'Schweiz', icon: '🇨🇭' },
    ] as const;

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            <div className="max-w-4xl mx-auto py-12 px-6 sm:px-8">
                
                {/* Header & Country Selector */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-black pb-8 mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-black uppercase">
                            Geschäftsbedingungen
                        </h1>
                        <p className="text-xs font-bold text-black/40 mt-2 uppercase tracking-[3px]">
                            Rechtliche Grundlagen & AGB
                        </p>
                    </div>

                    <div className="flex bg-black/5 p-1 rounded-2xl">
                        {countries.map((country) => (
                            <button
                                key={country.id}
                                onClick={() => setSelectedCountry(country.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                                    selectedCountry === country.id 
                                    ? 'bg-black text-white shadow-lg' 
                                    : 'text-black/40 hover:text-black hover:bg-black/5'
                                }`}
                            >
                                <span className="text-lg">{country.icon}</span>
                                {country.name}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedCountry === 'AT' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 text-black/80 text-[15px] leading-relaxed">
                        
                        <div className="flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-full w-fit">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Gültig für Österreich (AT)</span>
                        </div>

                        {/* Section 1 */}
                        <section>
                            <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                1. ALLGEMEINES
                            </h2>
                            <div className="space-y-4">
                                <p>a) Dem zwischen der <strong>Firma Rent-Ex GmbH</strong> (im Folgenden als „Vermieter“ bezeichnet) und dem Mieter abgeschlossenen Mietvertrag liegen ausschließlich die folgenden Geschäfts- und Vertragsbedingungen zugrunde.</p>
                                <p>b) Der Abschluss des Mietvertrages bedarf der Schriftform. Zusätzlich getroffene Vereinbarungen sind deshalb vom Vermieter vollständig und ausnahmslos bei der Vertragsausfertigung schriftlich niederzulegen.</p>
                                <p>c) Mieter bzw. Lenker erklären mit ihrer Unterschrift Ihre Kenntnisnahme von und ihr Einverständnis mit den gegenständlichen Geschäfts- und Vertragsbedingungen.</p>
                                <p>d) Mieter bzw. Lenker haften für alle Schäden im Zusammenhang mit fehlerhaften oder unvollständigen Angaben.</p>
                                <p>e) Der Mieter nimmt zur Kenntnis, dass unsere Fahrzeuge mit einer GPS-Ortungssystem ausgestattet sind.</p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                2. WEITERGABE / AUSDEHNUNG
                            </h2>
                            <p>Der Mieter darf das Mietfahrzeug nur selbst lenken oder im Mietvertrag namentlich genannten Personen überlassen. Jeder mit dem Mieter nicht idente Lenker tritt dem Vertrag als Mitmieter bei.</p>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                3. FAHRZEUGÜBERNAHME
                            </h2>
                            <div className="space-y-4">
                                <p>Der Mieter bestätigt den ordnungsgemäßen Zustand des Fahrzeugs bei Übernahme. Das Fahrzeug wird vollgetankt/vollgeladen übergeben.</p>
                                <div className="bg-black text-white p-6 rounded-[32px] border-l-8 border-red-600">
                                    <h3 className="text-red-500 font-black uppercase text-[10px] tracking-widest mb-3">Service Pauschale</h3>
                                    <p className="text-xl font-bold">€ 18,00 inkl. MwSt.</p>
                                    <p className="text-[10px] text-white/40 mt-1 uppercase">Wird bei nicht erfolgter Betankung/Ladung bei Rückgabe fällig.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section>
                            <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                4. AUSLANDSFAHRTEN
                            </h2>
                            <p>Fahrten ins Ausland sind nur mit Genehmigung zulässig. In bestimmten Ländern (IT, PL, TR, Balkan, etc.) verliert die Diebstahl-Haftungsreduzierung ihre Wirksamkeit.</p>
                        </section>

                        {/* Section 5 */}
                        <section>
                            <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                5. PFLICHTEN & LIMITS
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="p-6 bg-black/[0.02] border border-black/5 rounded-[32px]">
                                    <h3 className="font-bold text-[10px] uppercase mb-4 text-black/40 tracking-widest">Maximalgeschwindigkeit</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center"><span className="text-xs font-bold">Lieferwagen</span><span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black">120 KM/H</span></div>
                                        <div className="flex justify-between items-center"><span className="text-xs font-bold">Bus</span><span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black">130 KM/H</span></div>
                                        <div className="flex justify-between items-center"><span className="text-xs font-bold">Kleinwagen</span><span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black">140 KM/H</span></div>
                                        <div className="flex justify-between items-center"><span className="text-xs font-bold">Sonstige PKW</span><span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black">160 KM/H</span></div>
                                    </div>
                                </div>
                                <div className="p-6 bg-black/[0.02] border border-black/5 rounded-[32px] flex flex-col justify-center">
                                    <h3 className="font-bold text-[10px] uppercase mb-4 text-black/40 tracking-widest">Schadensbearbeitung</h3>
                                    <p className="text-2xl font-black">€ 58,00</p>
                                    <p className="text-[10px] text-black/40 mt-1 uppercase font-bold">Pauschalgebühr pro Schadensfall</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section>
                            <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                6. HAFTUNG (ÖSTERREICH)
                            </h2>
                            <div className="bg-red-600 text-white p-8 rounded-[40px] shadow-2xl shadow-red-600/20">
                                <h3 className="font-black uppercase text-[10px] tracking-widest mb-4 opacity-60">Selbstbehalt Regelfall</h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black">5%</p>
                                    <p className="text-sm font-bold">der Schadenshöhe</p>
                                </div>
                                <p className="text-xs mt-4 font-bold opacity-80 italic">Mindestens EUR 1.500,00 netto je Schadensereignis.</p>
                            </div>
                        </section>

                        <section className="border-t border-black/10 pt-8 text-center text-[10px] font-bold text-black/30 uppercase tracking-[4px]">
                            Feldkirch, Österreich – Gerichtsstand: Feldkirch
                        </section>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-[400px] flex flex-col items-center justify-center bg-black/5 rounded-[40px] border-2 border-dashed border-black/10">
                        <Globe className="h-12 w-12 text-black/10 mb-4" />
                        <h3 className="text-lg font-black text-black uppercase">In Kürze verfügbar</h3>
                        <p className="text-sm text-black/40 font-bold max-w-[280px] text-center mt-2">
                            Die spezifischen AGB für dieses Land werden aktuell rechtlich geprüft und bald veröffentlicht.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
