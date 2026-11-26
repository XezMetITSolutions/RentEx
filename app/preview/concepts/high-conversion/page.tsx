import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Clock, MapPin, Zap, CheckCircle2, ChevronRight, Phone } from 'lucide-react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import AustrianPlate from '@/components/ui/AustrianPlate';
import ConceptSwitcher from '@/components/preview/ConceptSwitcher';

export default function ConceptHighConversion() {
  const cars = [
    {
      id: 3,
      brand: 'Ford',
      model: 'Transit Custom L1',
      plate: 'FK-FT 1001',
      rate: 139,
      category: 'Kastenwagen & Umzug',
      image: '/assets/cars/Ford_Transit_Custom_L1.png',
      popular: true,
      features: ['250 km frei', 'Vollkasko inkl.', 'Diesel 6-Gang', 'Klimaanlage'],
    },
    {
      id: 4,
      brand: 'Volkswagen',
      model: 'Polo Life',
      plate: 'FK-VW 7001',
      rate: 59,
      category: 'Kompaktklasse',
      image: '/assets/cars/VWPolo.png',
      popular: false,
      features: ['200 km frei', 'Vollkasko inkl.', 'Benzin sparsam', 'Isofix'],
    },
    {
      id: 1,
      brand: 'Ford',
      model: 'Mustang Mach-E GT',
      plate: 'FK-ME 101',
      rate: 199,
      category: 'Elektro & Performance',
      image: '/assets/cars/Ford_Mustang_MachE_GT.png',
      popular: false,
      features: ['250 km frei', '487 PS Allrad', 'Automatik', 'High-End'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] selection:bg-rose-500/25 font-sans">
      <Navbar />
      <ConceptSwitcher current="high-conversion" />

      <main className="pt-28 pb-28">
        {/* HERO SECTION: Sixt/Enterprise style high-conversion booking engine */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-16">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-4">
              <Zap className="w-3.5 h-3.5 text-rose-600" />
              Direktbuchung ohne Wartezeit · Feldkirch Illstraße 75a
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.05]">
              Mietwagen in Vorarlberg. <br />
              <span className="text-rose-600">Günstig, fair & sofort startklar.</span>
            </h1>
            <p className="mt-4 text-gray-600 text-base sm:text-lg">
              Wählen Sie Ihr Wunschfahrzeug, buchen Sie in 2 Minuten online und holen Sie es jederzeit ab — auch am Wochenende per 24/7 Schlüsselsafe.
            </p>
          </div>

          {/* Quick Booking Box (High Conversion Formula) */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 p-6 sm:p-8 max-w-4xl mx-auto">
            <form action="/fleet" method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Abholung am Standort</label>
                <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  Illstraße 75a, 6800 Feldkirch
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fahrzeugklasse</label>
                <select name="category" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-rose-500 cursor-pointer">
                  <option value="">Alle Kategorien (14 frei)</option>
                  <option value="PKW">PKW & Limousinen</option>
                  <option value="Kastenwagen">Transporter & Kastenwagen</option>
                  <option value="Bus">Busse (9-Sitzer)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-6 rounded-xl text-base flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition-all"
              >
                Freie Autos anzeigen <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Vollkasko & Haftpflicht inklusive</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Keine Kreditkarte zwingend (Bar vor Ort möglich)</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 24/7 Schlüsseltresor Übergabe</span>
            </div>
          </div>
        </section>

        {/* Popular Cars Showcase Cards */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Beliebteste Mietwagen im Ländle</h2>
              <p className="text-sm text-gray-500 mt-1">Gepflegte Fahrzeuge, vollgetankt und fahrbereit</p>
            </div>
            <Link href="/fleet" className="text-rose-600 hover:text-rose-700 font-bold text-sm flex items-center gap-1">
              Gesamte Flotte <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500">{car.category}</span>
                    <AustrianPlate plate={car.plate} size="sm" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900">{car.brand} {car.model}</h3>

                  <div className="relative aspect-[16/10] my-4">
                    <Image
                      src={car.image}
                      alt={car.model}
                      fill
                      className="object-contain"
                    />
                  </div>

                  <ul className="space-y-2 border-t border-gray-100 pt-4 mb-4">
                    {car.features.map((feat, i) => (
                      <li key={i} className="text-xs font-medium text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-gray-900">€ {car.rate}</span>
                    <span className="text-xs text-gray-500"> / Tag inkl. MwSt.</span>
                  </div>
                  <Link
                    href={`/fleet/${car.id}`}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Jetzt buchen
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
