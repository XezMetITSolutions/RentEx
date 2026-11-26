import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Sparkles, MapPin, KeyRound, Star, Phone, ChevronRight, Zap } from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import AustrianPlate from '@/components/ui/AustrianPlate';
import ConceptSwitcher from '@/components/preview/ConceptSwitcher';

export default function ConceptDarkGodly() {
  const cars = [
    {
      id: 1,
      brand: 'Ford Mustang',
      model: 'Mach-E GT',
      plate: 'FK-ME 101',
      rate: 199,
      specs: '487 PS · Elektro · 0-100 in 3.7s',
      image: '/assets/cars/Ford_Mustang_MachE_GT.png',
      badge: 'Performance Star',
    },
    {
      id: 3,
      brand: 'Ford Transit',
      model: 'Custom L1',
      plate: 'FK-FT 1001',
      rate: 139,
      specs: 'Diesel · 6-Gang · Großes Ladevolumen',
      image: '/assets/cars/Ford_Transit_Custom_L1.png',
      badge: 'Meistgebucht',
    },
    {
      id: 4,
      brand: 'VW',
      model: 'Polo Life',
      plate: 'FK-VW 7001',
      rate: 59,
      specs: 'Benzin · Sparsam · Ideal für die Stadt',
      image: '/assets/cars/VWPolo.png',
      badge: 'Preis-Leistungs-Sieger',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-[#EDEDED] selection:bg-rose-500/30 font-sans">
      <Navbar />
      <ConceptSwitcher current="dark-godly" />

      <main className="pt-24 pb-28">
        {/* HERO SECTION: Godly Dark Luxury */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-8 pb-20 overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-rose-500/15 via-purple-500/5 to-transparent rounded-full blur-[160px] pointer-events-none" />

          {/* Badges & Eyebrow */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Illstraße 75a, Feldkirch · 14 Fahrzeuge bereit
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <span>★ 4.9/5 Vorarlberg Kundenzufriedenheit</span>
              <span>·</span>
              <span>24/7 Schlüsseltresor</span>
            </div>
          </div>

          {/* Massive Typography */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
            <div className="lg:col-span-8">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.88] text-white">
                Fahrkultur <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400">
                  im Ländle.
                </span>
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pb-2">
              <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
                Keine versteckten Klauseln, keine Callcenter. Mieten Sie transparente Premium-Fahrzeuge direkt im Vorarlberger Rheintal.
              </p>
            </div>
          </div>

          {/* Live Search Bento Strip */}
          <div className="bg-[#111115] border border-white/10 rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-20">
            <div className="p-3 bg-white/[0.02] rounded-2xl border border-white/5">
              <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-1">Abholung</span>
              <span className="text-sm font-semibold text-white">Illstraße 75a, Feldkirch</span>
            </div>
            <div className="p-3 bg-white/[0.02] rounded-2xl border border-white/5">
              <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-1">Mietbeginn</span>
              <span className="text-sm font-semibold text-white">Heute / Flexibel wählbar</span>
            </div>
            <div className="p-3 bg-white/[0.02] rounded-2xl border border-white/5">
              <span className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-1">Übergabe</span>
              <span className="text-sm font-semibold text-white">Filiale oder 24/7 Safe</span>
            </div>
            <Link
              href="/fleet"
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl px-6 py-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30 group"
            >
              Fahrzeuge prüfen
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Godly Showcase Grid (Dark Glass Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div
                key={car.id}
                className="group relative bg-[#111115] border border-white/10 hover:border-rose-500/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-rose-950/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                      {car.badge}
                    </span>
                    <AustrianPlate plate={car.plate} size="sm" />
                  </div>

                  <h3 className="text-2xl font-black text-white tracking-tight">{car.brand} {car.model}</h3>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">{car.specs}</p>

                  <div className="relative aspect-[16/10] my-6 overflow-hidden rounded-2xl bg-black/40">
                    <Image
                      src={car.image}
                      alt={car.model}
                      fill
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Tagespreis</span>
                    <span className="text-2xl font-black text-white">€ {car.rate}</span>
                    <span className="text-xs text-zinc-400"> / Tag</span>
                  </div>
                  <Link
                    href={`/fleet/${car.id}`}
                    className="px-5 py-2.5 bg-white text-black hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    Buchen <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Pillars Bento Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-[#111115] border border-white/10">
              <Zap className="w-8 h-8 text-rose-500 mb-6" />
              <h4 className="text-xl font-bold text-white mb-2">24/7 Schlüsseltresor</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Außerhalb der Öffnungszeiten einfach mit persönlichem 4-Stelligen Code am Tresor der Illstraße 75a abholen. Kein Warten.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-[#111115] border border-white/10">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mb-6" />
              <h4 className="text-xl font-bold text-white mb-2">Vollkasko Inklusive</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Jedes Mietfahrzeug ist umfassend vollkaskoversichert mit Insassenschutz. Keine teuren versteckten Zusatzpakete an der Kasse.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-[#111115] border border-white/10">
              <MapPin className="w-8 h-8 text-amber-400 mb-6" />
              <h4 className="text-xl font-bold text-white mb-2">Zentral in Feldkirch</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Ideale Anbindung an das gesamte Vorarlberger Rheintal, Liechtenstein und die Schweizer Grenze. Kostenlose Kundenparkplätze.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
