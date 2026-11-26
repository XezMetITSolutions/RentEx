import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, Compass, Shield, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import AustrianPlate from '@/components/ui/AustrianPlate';
import ConceptSwitcher from '@/components/preview/ConceptSwitcher';

export default function ConceptEditorial() {
  const categories = [
    { name: 'Transporter & Kastenwagen', desc: 'Für Umzug, Handwerk & Transport in Vorarlberg', price: 'ab € 99', count: '4 Fahrzeuge', href: '/fleet?category=Kastenwagen' },
    { name: 'PKW & Limousinen', desc: 'Sparsamer Stadtverkehr oder komfortable Langstrecken', price: 'ab € 59', count: '7 Fahrzeuge', href: '/fleet?category=PKW' },
    { name: 'Busse & 9-Sitzer', desc: 'Gruppenreisen, Vereine & Familienausflüge', price: 'ab € 149', count: '3 Fahrzeuge', href: '/fleet?category=Bus' },
  ];

  return (
    <div className="min-h-screen bg-[#F6F6F4] text-[#1A1A1A] selection:bg-[#E31E24]/20 font-sans">
      <Navbar />
      <ConceptSwitcher current="editorial" />

      <main className="pt-28 pb-28">
        {/* HERO SECTION: Swiss / German Editorial Clean */}
        <section className="px-4 sm:px-6 lg:px-12 max-w-[1440px] mx-auto mb-24">
          <div className="border-b border-black/10 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E31E24] block mb-3 font-bold">
                Rent-Ex Feldkirch · Vorarlberg
              </span>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-[800] tracking-tight leading-[0.9] text-black">
                Mieten statt <br />
                besitzen.
              </h1>
            </div>
            <div className="max-w-md">
              <p className="text-lg text-black/70 leading-relaxed font-normal">
                Transparente Autovermietung direkt an der Illstraße. Moderne Fahrzeugflotte, faire Kilometerpauschalen und keine verdeckten Aufpreise.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Link
                  href="/fleet"
                  className="px-7 py-3.5 bg-black text-white rounded-full font-semibold text-sm hover:bg-[#E31E24] transition-colors inline-flex items-center gap-2"
                >
                  Alle 14 Fahrzeuge ansehen <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Featured Hero Car Minimalist Stage */}
          <div className="relative rounded-[2.5rem] bg-white border border-black/10 p-8 lg:p-14 overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider bg-black/5 px-3 py-1 rounded-full">
                    Top-Empfehlung
                  </span>
                  <AustrianPlate plate="FK-FT 1001" size="sm" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-black">
                  Ford Transit Custom L1
                </h2>
                <p className="text-black/60 text-base leading-relaxed">
                  Geräumig, sparsam und wendig im Stadtverkehr. Ideal für Firmen, Umzüge und Transporte im Raum Vorarlberg, Schweiz und Liechtenstein.
                </p>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-black/5 text-sm">
                  <div>
                    <span className="text-xs text-black/40 block font-mono">Tagespreis</span>
                    <span className="text-2xl font-black text-black">€ 139,-</span>
                  </div>
                  <div>
                    <span className="text-xs text-black/40 block font-mono">Inklusive</span>
                    <span className="text-sm font-bold text-black">Vollkasko & 250 km</span>
                  </div>
                </div>

                <Link
                  href="/fleet/3"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E31E24] hover:bg-[#c9181d] text-white font-bold rounded-xl text-sm transition-colors"
                >
                  Dieses Modell reservieren <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="lg:col-span-7 relative aspect-[16/10] w-full">
                <Image
                  src="/assets/cars/ford_transit_custom_l1.png"
                  alt="Ford Transit Custom L1"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories Clean Editorial List */}
        <section className="px-4 sm:px-6 lg:px-12 max-w-[1440px] mx-auto py-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-black/40 mb-8 block">
            Fahrzeugkategorien im Überblick
          </h2>
          <div className="divide-y divide-black/10 border-y border-black/10">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group py-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/60 px-4 -mx-4 rounded-2xl transition-all"
              >
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-black group-hover:text-[#E31E24] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-black/60 mt-1">{cat.desc}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-mono text-xs text-black/40">{cat.count}</span>
                  <span className="text-xl font-bold font-mono text-black">{cat.price} / Tag</span>
                  <span className="w-10 h-10 rounded-full border border-black/15 grid place-items-center group-hover:bg-black group-hover:text-white transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
