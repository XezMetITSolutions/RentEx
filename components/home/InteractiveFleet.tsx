"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Fuel, Gauge, Users, Heart } from "lucide-react";

interface CarType {
  id: number;
  brand: string;
  model: string;
  imageUrl: string | null;
  dailyRate: any;
  fuelType: string;
  transmission: string | null;
  seats: number | null;
  category: string | null;
}

interface InteractiveFleetProps {
  initialCars: CarType[];
}

export default function InteractiveFleet({ initialCars }: InteractiveFleetProps) {
  const [activeTab, setActiveTab] = useState<string>("Alle");
  const [sortBy, setSortBy] = useState<string>("Beliebteste");

  // Map user categories to database categories
  const filterCars = () => {
    let filtered = initialCars;
    if (activeTab === "PKW") {
      filtered = initialCars.filter((car) => car.category?.toLowerCase() === "pkw");
    } else if (activeTab === "Transporter") {
      filtered = initialCars.filter((car) => car.category?.toLowerCase() === "kastenwagen" || car.category?.toLowerCase() === "transporter");
    } else if (activeTab === "Kleinbusse") {
      filtered = initialCars.filter((car) => car.category?.toLowerCase() === "kleinbus");
    } else if (activeTab === "LKW") {
      filtered = initialCars.filter((car) => car.category?.toLowerCase() === "lkw");
    }

    if (sortBy === "Preis: aufsteigend") {
      return [...filtered].sort((a, b) => Number(a.dailyRate) - Number(b.dailyRate));
    } else if (sortBy === "Preis: absteigend") {
      return [...filtered].sort((a, b) => Number(b.dailyRate) - Number(a.dailyRate));
    }
    return filtered;
  };

  const displayedCars = filterCars();

  return (
    <div className="space-y-6">
      {/* Category Tabs & Sort Filter row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {["Alle", "PKW", "Transporter", "Kleinbusse", "LKW"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                activeTab === tab
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "bg-[#1C1C1C] text-zinc-400 hover:text-white border border-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sortieren nach</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#1C1C1C] border border-white/5 text-white text-xs font-extrabold uppercase tracking-wider px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-red-500"
          >
            <option>Beliebteste</option>
            <option>Preis: aufsteigend</option>
            <option>Preis: absteigend</option>
          </select>
        </div>
      </div>

      {/* Grid of Cars */}
      {displayedCars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedCars.map((car) => (
            <div
              key={car.id}
              className="bg-[#1C1C1C] border border-white/5 rounded-2xl overflow-hidden group hover:border-red-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/5"
            >
              {/* Image Box */}
              <div className="h-32 bg-black/40 flex items-center justify-center relative overflow-hidden p-4 border-b border-white/5">
                {car.imageUrl ? (
                  <Image
                    src={car.imageUrl}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-zinc-650 text-xs font-mono">Kein Bild verfügbar</div>
                )}
                {/* Wishlist button */}
                <button className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 border border-white/5 text-zinc-400 hover:text-red-500 transition-colors">
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Specs Box */}
              <div className="p-4">
                <div className="mb-3">
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                    {car.category}
                  </span>
                  <h3 className="text-sm font-black text-white uppercase mt-0.5 group-hover:text-red-500 transition-colors duration-300 leading-tight">
                    {car.brand} {car.model}
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-1 border-y border-white/5 py-3 mb-3 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <Fuel className="w-3 h-3 text-zinc-500" />
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{car.fuelType}</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 border-l border-white/5">
                    <Gauge className="w-3 h-3 text-zinc-500" />
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{car.transmission}</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 border-l border-white/5">
                    <Users className="w-3 h-3 text-zinc-500" />
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{car.seats} Sitze</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                  <div>
                    <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Tagespreis</span>
                    <span className="text-base font-black text-white">
                      {new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(Number(car.dailyRate))}
                    </span>
                  </div>
                  <Link
                    href={`/fleet/${car.id}`}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all duration-300 active:scale-[0.97] whitespace-nowrap"
                  >
                    Jetzt Buchen
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-[#1C1C1C] rounded-3xl border-2 border-dashed border-white/5">
          <p className="text-zinc-500 font-bold uppercase tracking-wider text-sm">Keine Fahrzeuge in dieser Kategorie gefunden</p>
        </div>
      )}

      {/* Show more button */}
      <div className="text-center pt-4">
        <Link
          href="/fleet"
          className="inline-flex items-center justify-center px-6 py-3 bg-[#1C1C1C] hover:bg-zinc-800 border border-white/5 hover:border-white/10 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 active:scale-[0.98]"
        >
          Mehr Fahrzeuge anzeigen
        </Link>
      </div>
    </div>
  );
}
