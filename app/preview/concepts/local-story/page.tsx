import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Phone, ShieldCheck, Clock, KeyRound, CalendarCheck, CheckCircle2, Sparkles } from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import AustrianPlate from '@/components/ui/AustrianPlate';
import ConceptSwitcher from '@/components/preview/ConceptSwitcher';

export default function ConceptLocalStory() {
  const localHighlights = [
    { title: 'Feldkirch Illstraße 75a', sub: 'Direkt erreichbar im Rheintal mit Kundenparkplätzen vor Ort.' },
    { title: '24/7 Schlüsseltresor', sub: 'Schlüsselabholung & Rückgabe jederzeit digital per PIN-Code.' },
    { title: 'Schweiz & Liechtenstein', sub: 'Auslandsfahrten in die Nachbarländer ohne Zusatzaufschlag erlaubt.' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-[#1D1D1F] font-sans selection:bg-[#E31E24]/20">
      <Navbar />
      <ConceptSwitcher current="local-story" />

      <main className="pt-28 pb-32">
        {/* HERO SECTION */}
        <section className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E31E24]/10 border border-[#E31E24]/20 text-[#E31E24] text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" /> Vorarlbergs moderne Autovermietung
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#111] leading-[1.05]">
                Mieten vor Ort in Feldkirch. <br />
                <span className="text-[#E31E24]">Einfach, fair & direkt.</span>
              </h1>

              <p className="text-lg sm:text-xl text-black/70 font-normal leading-relaxed max-w-xl">
                Ob für den Umzug, den Geschäftstermin oder die Wochenendfahrt: 14 gepflegte Fahrzeuge stehen in Feldkirch für Sie bereit. Mit persönlichem Service oder 24/7 kontaktloser Übergabe.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/fleet"
                  className="px-8 py-4 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold rounded-2xl text-base shadow-lg shadow-[#E31E24]/25 transition-all inline-flex items-center gap-2"
                >
                  Flotte ansehen & buchen <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="tel:+43552212345"
                  className="px-8 py-4 bg-white border border-black/10 hover:border-black/25 text-black font-semibold rounded-2xl text-base shadow-sm transition-all inline-flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#E31E24]" /> +43 (0) 5522 ...
                </a>
              </div>

              <div className="pt-6 border-t border-black/10 grid grid-cols-3 gap-4 text-xs font-mono text-black/60">
                <div><strong className="text-black block text-sm">14 Autos</strong> Vor Ort verfügbar</div>
                <div><strong className="text-black block text-sm">24/7 Keybox</strong> Jederzeit abholen</div>
                <div><strong className="text-black block text-sm">AT · CH · FL</strong> Grenznah fahren</div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[2.5rem] bg-white border border-black/10 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-black/5">
                  <AustrianPlate plate="FK-REX 1" size="md" />
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    Sofort verfügbar
                  </span>
                </div>
                <div className="relative aspect-[16/11] w-full">
                  <Image
                    src="/assets/cars/Seat_Leon_Kombi.png"
                    alt="Seat Leon Kombi"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
                <div className="pt-2">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-xl font-bold text-black">Seat Leon Kombi</h3>
                    <span className="text-xl font-black text-black">ab € 79,- <span className="text-xs font-normal text-black/50">/ Tag</span></span>
                  </div>
                  <p className="text-xs text-black/60">Perfekt für Familie & Reise. Sparsam, geräumig mit 250 Freikilometern.</p>
                </div>
                <Link
                  href="/fleet/2"
                  className="w-full py-3 bg-black hover:bg-[#E31E24] text-white font-bold rounded-xl text-xs uppercase tracking-wider text-center block transition-colors"
                >
                  Fahrzeug reservieren
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* THREE STEPS: BORDERED EDITORIAL CARDS WITH ICONS (GÖPSELİN GELİŞMİŞ VERSİYONU) */}
        <section className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#E31E24] font-bold block mb-2">
              Der Rent-Ex Ablauf
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-black tracking-tight">
              Drei Schritte bis zum Schlüssel.
            </h2>
            <p className="text-black/60 text-base mt-3">
              Klar und unkompliziert. So einfach mieten Sie bei uns in Feldkirch:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-black/10 shadow-sm hover:shadow-md transition-shadow">
              <span className="font-mono text-sm font-bold text-[#E31E24] block mb-4">1.0</span>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 grid place-items-center mb-6">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Fahrzeug wählen.</h3>
              <p className="text-black/65 text-sm leading-relaxed mb-6">
                Zeitraum eingeben und aus 14 gepflegten Modellen das passende aussuchen. Live-Preise ohne versteckte Gebühren.
              </p>
              <div className="text-xs font-mono text-black/40 border-t border-black/5 pt-4">
                Transparente Tagespreise
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-black/10 shadow-sm hover:shadow-md transition-shadow">
              <span className="font-mono text-sm font-bold text-[#E31E24] block mb-4">2.0</span>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 grid place-items-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Online buchen.</h3>
              <p className="text-black/65 text-sm leading-relaxed mb-6">
                Reservierung und sichere Zahlung in wenigen Klicks – Ihre Bestätigung und Mietunterlagen erhalten Sie sofort per E-Mail.
              </p>
              <div className="text-xs font-mono text-black/40 border-t border-black/5 pt-4">
                Faire AGB §7 Stornoregelung
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-black/10 shadow-sm hover:shadow-md transition-shadow">
              <span className="font-mono text-sm font-bold text-[#E31E24] block mb-4">3.0</span>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-[#E31E24] grid place-items-center mb-6">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">Abholen & losfahren.</h3>
              <p className="text-black/65 text-sm leading-relaxed mb-6">
                Schlüssel in der Illstraße 75a in Feldkirch abholen – während der Öffnungszeiten persönlich oder 24/7 über unseren Schlüsseltresor.
              </p>
              <div className="text-xs font-mono text-black/40 border-t border-black/5 pt-4">
                24/7 Key Safe vor Ort
              </div>
            </div>
          </div>
        </section>

        {/* LOCAL ADVANTAGES */}
        <section className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
          <div className="rounded-[2.5rem] bg-[#111] text-white p-10 sm:p-14">
            <h3 className="text-3xl font-extrabold mb-8">Warum Rent-Ex in Vorarlberg?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {localHighlights.map((h, i) => (
                <div key={i} className="border-l-2 border-[#E31E24] pl-6 space-y-2">
                  <h4 className="text-lg font-bold text-white">{h.title}</h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">{h.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
