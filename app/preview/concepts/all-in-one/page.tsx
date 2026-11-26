import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Sparkles, ShieldCheck, KeyRound, MapPin, CheckCircle2, Star, Clock } from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import AustrianPlate from '@/components/ui/AustrianPlate';
import ConceptSwitcher from '@/components/preview/ConceptSwitcher';

export default function ConceptAllInOne() {
  const fleetPicks = [
    {
      id: '3',
      name: 'Ford Transit Custom L1',
      cat: 'Transporter',
      plate: 'FK-FT 1001',
      price: '€ 139,-',
      img: '/assets/cars/Ford_Transit_Custom_L1.png',
      badge: 'Bestseller Umzug',
      features: ['Ladevolumen 6.0 m³', 'Nutzlast ca. 1.000 kg', 'Vollkasko inklusive', '250 km frei'],
    },
    {
      id: '1',
      name: 'Ford Mustang Mach-E GT',
      cat: 'Elektro Sport',
      plate: 'FK-REX 10',
      price: '€ 149,-',
      img: '/assets/cars/Ford_Mustang_MachE_GT.png',
      badge: '487 PS · Allrad',
      features: ['0-100 km/h in 3.7s', 'Reichweite bis 500 km', 'Panorama-Glasdach', '250 km frei'],
    },
    {
      id: '4',
      name: 'VW Polo 1.0 TSI',
      cat: 'Kompaktwagen',
      plate: 'FK-REX 33',
      price: '€ 59,-',
      img: '/assets/cars/VWPolo.png',
      badge: 'Wirtschaftlich & Sparsam',
      features: ['Apple CarPlay / Android Auto', 'Geringer Verbrauch', 'Parksensoren', '250 km frei'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0E0E12] text-zinc-100 font-sans selection:bg-[#E31E24] selection:text-white">
      <Navbar />
      <ConceptSwitcher current="all-in-one" />

      <main className="pt-28 pb-32">
        {/* TOP STATUS TICKER */}
        <div className="border-b border-white/10 bg-white/[0.02] py-2.5 px-6 text-xs font-mono text-zinc-400">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              14 Fahrzeuge am Standort Feldkirch sofort einsatzbereit
            </span>
            <span className="hidden sm:inline text-zinc-400">
              Illstraße 75a · 24/7 Schlüsseltresor aktiv
            </span>
          </div>
        </div>

        {/* HERO STAGE */}
        <section className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E31E24]/10 border border-[#E31E24]/25 text-[#E31E24] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Premium Autovermietung Vorarlberg
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.9]">
                Autovermietung. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E31E24] via-red-400 to-amber-400">
                  Auf den Punkt.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-zinc-300 max-w-xl font-normal leading-relaxed">
                Keine Lockangebote, keine Schalter-Warteschlangen. Transparente All-Inclusive Preise inklusive Vollkasko direkt an der Illstraße in Feldkirch.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href="/fleet"
                  className="px-8 py-4 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold rounded-2xl text-base shadow-xl shadow-[#E31E24]/30 transition-all flex items-center justify-center gap-2 group"
                >
                  Flotte ansehen & buchen
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#fleet-highlights"
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-medium rounded-2xl text-base transition-all text-center"
                >
                  Beliebteste Modelle
                </Link>
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Vollkasko & Haftpflicht inklusive</span>
                <span className="flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-amber-400" /> 24/7 Digitaler Key-Safe</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#E31E24]" /> Illstraße 75a, Feldkirch</span>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/15 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <AustrianPlate plate="FK-REX 10" size="md" />
                  <span className="font-mono text-xs text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                    Flaggschiff
                  </span>
                </div>
                <div className="relative aspect-[16/10] w-full my-2">
                  <Image
                    src="/assets/cars/Ford_Mustang_MachE_GT.png"
                    alt="Ford Mustang Mach-E GT"
                    fill
                    priority
                    className="object-contain drop-shadow-[0_15px_30px_rgba(227,30,36,0.2)]"
                  />
                </div>
                <div className="flex items-end justify-between border-t border-white/10 pt-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">Mustang Mach-E GT</h3>
                    <p className="text-xs text-zinc-400 font-mono">487 PS · Allrad · Elektro</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">€ 149,-</span>
                    <span className="text-xs text-zinc-400 block font-mono">/ Tag inkl. Vollkasko</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REIMAGINED 3 STEPS: THE COMPLETE FIX TO THE USER'S ATTACHED SCREENSHOT */}
        <section className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto py-20 border-t border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#E31E24] font-bold block mb-3">
                Digital & Kontaktlos
              </span>
              <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                Drei Schritte bis zum Schlüssel.
              </h2>
            </div>
            <p className="text-zinc-400 text-sm max-w-md">
              Vorbei sind Zeiten mit Papierbergen und Schalterwarten. Unser digitaler Check-in garantiert maximale Freiheit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="relative rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 p-8 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#E31E24] font-bold px-2.5 py-1 rounded bg-[#E31E24]/10 border border-[#E31E24]/20">
                    Schritt 1.0
                  </span>
                  <span className="w-10 h-10 rounded-full border border-white/10 grid place-items-center text-zinc-400 group-hover:text-white transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#E31E24] transition-colors">
                  Fahrzeug wählen.
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Zeitraum eingeben und aus 14 gepflegten Modellen das passende aussuchen. Live-Preise ohne versteckte Gebühren.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Echtzeit-Verfügbarkeit</span>
                <span className="text-emerald-400 font-bold">14 Modelle</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 p-8 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#E31E24] font-bold px-2.5 py-1 rounded bg-[#E31E24]/10 border border-[#E31E24]/20">
                    Schritt 2.0
                  </span>
                  <span className="w-10 h-10 rounded-full border border-white/10 grid place-items-center text-zinc-400 group-hover:text-white transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#E31E24] transition-colors">
                  Online buchen.
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Reservierung und Zahlung in wenigen Schritten — die Bestätigung und der Zugangscode kommen direkt per E-Mail.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Faire AGB §7 Storno</span>
                <span className="text-white font-bold">Sofort-PIN</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 p-8 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#E31E24] font-bold px-2.5 py-1 rounded bg-[#E31E24]/10 border border-[#E31E24]/20">
                    Schritt 3.0
                  </span>
                  <span className="w-10 h-10 rounded-full border border-white/10 grid place-items-center text-zinc-400 group-hover:text-white transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#E31E24] transition-colors">
                  Abholen & losfahren.
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Schlüssel in der Illstraße 75a in Feldkirch abholen. Bei Tag oder Nacht kontaktlos über den 24/7 Tresor.
                </p>
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>24/7 Schlüsselsafe</span>
                <span className="text-[#E31E24] font-bold">Feldkirch</span>
              </div>
            </div>
          </div>
        </section>

        {/* FLEET SHOWCASE */}
        <section id="fleet-highlights" className="px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto py-20 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E31E24] font-bold block mb-2">
                Fahrzeugauswahl
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Beliebteste Fahrzeuge</h2>
            </div>
            <Link
              href="/fleet"
              className="font-mono text-sm text-zinc-300 hover:text-white flex items-center gap-2 group"
            >
              Gesamte Flotte (14 Fahrzeuge) anzeigen
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fleetPicks.map((car) => (
              <div
                key={car.id}
                className="rounded-3xl bg-white/[0.02] border border-white/10 p-6 flex flex-col justify-between hover:border-white/25 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-zinc-400 bg-white/5 px-2.5 py-1 rounded">
                      {car.cat}
                    </span>
                    <AustrianPlate plate={car.plate} size="sm" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-[#E31E24] transition-colors">
                    {car.name}
                  </h3>
                  <div className="text-xs font-mono text-[#E31E24] mb-6">{car.badge}</div>

                  <div className="relative aspect-[16/10] w-full my-4">
                    <Image
                      src={car.img}
                      alt={car.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <ul className="space-y-2 py-4 border-t border-white/5 text-xs text-zinc-300">
                    {car.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 font-mono block">Tagespreis</span>
                    <span className="text-2xl font-black text-white">{car.price}</span>
                  </div>
                  <Link
                    href={`/fleet/${car.id}`}
                    className="px-5 py-2.5 bg-white/10 hover:bg-[#E31E24] text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Buchen
                  </Link>
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
