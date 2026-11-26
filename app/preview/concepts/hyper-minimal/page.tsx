import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, ShieldCheck, Zap, KeyRound, Sparkles, Phone, MapPin } from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import AustrianPlate from '@/components/ui/AustrianPlate';
import ConceptSwitcher from '@/components/preview/ConceptSwitcher';

export default function ConceptHyperMinimal() {
  const steps = [
    { num: '01', title: 'Fahrzeug wählen', desc: '14 transparente Modelle in Feldkirch – ohne versteckte Kosten oder Upselling.' },
    { num: '02', title: '2-Klick Reservierung', desc: 'Datum wählen, Führerschein angeben, fertig. Sofortige Bestätigung.' },
    { num: '03', title: '24/7 Abholung', desc: 'Schlüsselsafe in der Illstraße 75a – losfahren wann immer Sie wollen.' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#EDEDED] font-sans selection:bg-[#E31E24] selection:text-white">
      <Navbar />
      <ConceptSwitcher current="hyper-minimal" />

      <main className="pt-32 pb-32">
        {/* HERO SECTION */}
        <section className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto mb-28">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-400">
              Rent-Ex Feldkirch · Autovermietung
            </span>
          </div>

          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight text-white uppercase leading-[0.85] mb-10">
            Fahren <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600">
              Ohne Umwege.
            </span>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end border-t border-white/10 pt-8">
            <div className="lg:col-span-6 space-y-4">
              <p className="text-xl sm:text-2xl text-zinc-300 font-light leading-relaxed">
                Kein Warteschlangen-Terror am Schalter. Transparente Preise inklusive Vollkasko direkt an der Illstraße in Feldkirch.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 pt-2">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Vollkasko inklusive</span>
                <span className="flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-amber-400" /> 24/7 Keybox</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#E31E24]" /> Illstraße 75a</span>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
              <Link
                href="/fleet"
                className="px-8 py-5 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold rounded-2xl text-base transition-all text-center shadow-lg shadow-[#E31E24]/20 flex items-center justify-center gap-2 group"
              >
                Fahrzeuge anzeigen
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#steps"
                className="px-8 py-5 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium rounded-2xl text-base transition-all text-center"
              >
                So funktioniert&apos;s
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED STAGE */}
        <section className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto mb-32">
          <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 p-8 sm:p-12 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <AustrianPlate plate="FK-REX 10" size="sm" />
                  <span className="font-mono text-xs text-zinc-400">Premium Flotte</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Ford Mustang Mach-E GT</h2>
              </div>
              <div className="text-right flex md:flex-col items-center md:items-end justify-between">
                <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Tagespreis</span>
                <span className="text-3xl sm:text-4xl font-black text-white">€ 149,-</span>
              </div>
            </div>

            <div className="relative aspect-[16/8] w-full max-w-4xl mx-auto my-4">
              <Image
                src="/assets/cars/Ford_Mustang_MachE_GT.png"
                alt="Ford Mustang Mach-E GT"
                fill
                priority
                className="object-contain drop-shadow-[0_20px_50px_rgba(227,30,36,0.15)]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-6 text-xs font-mono text-zinc-400">
              <div><span className="text-zinc-300 block font-bold text-sm">487 PS</span> Leistung</div>
              <div><span className="text-zinc-300 block font-bold text-sm">3.7 Sek</span> 0-100 km/h</div>
              <div><span className="text-zinc-300 block font-bold text-sm">Elektro AWD</span> Antrieb</div>
              <div><span className="text-zinc-300 block font-bold text-sm">250 km frei</span> Inklusive</div>
            </div>
          </div>
        </section>

        {/* 3 STEPS: REIMAGINED (UPGRADED VERSION OF USER IMAGE) */}
        <section id="steps" className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto mb-32 border-t border-white/10 pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#E31E24] block mb-3 font-semibold">
                Transparent & Direkt
              </span>
              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                Drei Schritte bis zum Schlüssel.
              </h2>
            </div>
            <p className="text-zinc-400 text-sm max-w-md">
              Kein Kleingedrucktes, keine Wartezeiten. Von der Online-Buchung bis zum Einsteigen in unter 3 Minuten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((st, i) => (
              <div
                key={st.num}
                className="relative bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 rounded-3xl p-8 sm:p-10 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono text-2xl font-bold text-[#E31E24]">{st.num}</span>
                    <span className="w-10 h-10 rounded-full border border-white/10 grid place-items-center text-zinc-400 group-hover:text-white group-hover:border-white/30 transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#E31E24] transition-colors">
                    {st.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-300">
                  <span>Schritt {i + 1} von 3</span>
                  <span className="text-[#E31E24]">Rent-Ex Feldkirch</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
