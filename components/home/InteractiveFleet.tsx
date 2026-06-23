"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Fuel, Users, Wind, Heart, ChevronDown } from "lucide-react";

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
  hasAirConditioning?: boolean;
}

interface CategoryType {
  id: number;
  name: string;
  sortOrder: number;
}

interface InteractiveFleetProps {
  initialCars: CarType[];
  categories: CategoryType[];
}

export default function InteractiveFleet({ initialCars, categories }: InteractiveFleetProps) {
  const [activeTab, setActiveTab] = useState<string>("Alle");
  const [sortBy, setSortBy] = useState<string>("Beliebteste");

  // Filter logic
  const filterCars = () => {
    let filtered = initialCars;
    
    // Filter by category
    if (activeTab !== "Alle") {
      filtered = initialCars.filter(
        (car) => car.category?.toLowerCase() === activeTab.toLowerCase()
      );
    }

    // Sort logic
    if (sortBy === "Preis (Aufsteigend)") {
      return [...filtered].sort((a, b) => Number(a.dailyRate) - Number(b.dailyRate));
    } else if (sortBy === "Preis (Absteigend)") {
      return [...filtered].sort((a, b) => Number(b.dailyRate) - Number(a.dailyRate));
    }
    
    return filtered;
  };

  const displayedCars = filterCars();

  return (
    <>
      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-3 mt-10">
        <button
          onClick={() => setActiveTab("Alle")}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "Alle" 
              ? "bg-red-600 text-white shadow-lg shadow-red-600/30" 
              : "bg-[#1a1a1a] text-zinc-300 hover:text-white border border-white/5 hover:border-white/10"
          }`}
        >
          Alle
        </button>
        {categories.filter(cat => initialCars.some(car => car.category?.toLowerCase() === cat.name.toLowerCase())).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.name)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === cat.name
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "bg-[#1a1a1a] text-zinc-300 hover:text-white border border-white/5 hover:border-white/10"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sorting */}
      <div className="flex justify-end items-center gap-3 mt-8">
        <span className="text-xs text-zinc-400">Sortieren nach</span>
        <div className="relative">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#0f0f0f] border border-white/10 rounded-lg py-2 pl-4 pr-10 text-white outline-none focus:border-red-500 text-sm appearance-none cursor-pointer"
          >
            <option>Beliebteste</option>
            <option>Preis (Aufsteigend)</option>
            <option>Preis (Absteigend)</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Vehicle Grid */}
      {displayedCars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4 mt-4">
          {displayedCars.map((car) => (
            <div key={car.id} className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors group relative flex flex-col">
              <button className="absolute top-4 right-4 text-zinc-500 hover:text-red-500 transition-colors z-10">
                <Heart className="w-5 h-5" />
              </button>
              
              <div className="relative h-32 w-full mb-4">
                <Image src={car.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800"} alt={`${car.brand} ${car.model}`} fill className="object-cover rounded-xl" />
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-bold text-white text-base truncate">{car.brand} {car.model}</h4>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-400">{car.transmission || "Automatik"}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[11px] text-zinc-400 mb-6 flex-1">
                <div className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5" /> {car.fuelType || "Diesel"}</div>
                <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {car.seats || 5} Sitze</div>
                <div className="flex items-center gap-1.5 col-span-2"><Wind className="w-3.5 h-3.5" /> {car.hasAirConditioning ? "Klimaanlage" : "Keine Klima"}</div>
              </div>
              
              <div className="flex items-center justify-between mt-auto">
                <div>
                  <span className="text-lg font-bold text-white">€{Number(car.dailyRate).toFixed(2).replace('.', ',')}</span>
                  <span className="text-[10px] text-zinc-500"> / Tag</span>
                </div>
                <Link href={`/fleet/${car.id}`} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
                  Jetzt Buchen
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-[#0f0f0f] border border-white/5 rounded-2xl mt-4">
          <p className="text-zinc-500 font-bold uppercase tracking-wider text-sm">Keine Fahrzeuge in dieser Kategorie gefunden</p>
        </div>
      )}

      {/* Load More Button */}
      <div className="flex justify-center mt-6">
        <Link href="/fleet" className="flex items-center gap-2 px-6 py-2.5 bg-[#0f0f0f] border border-white/10 hover:border-white/20 text-zinc-300 text-sm rounded-xl transition-all">
          Mehr Fahrzeuge anzeigen <ChevronDown className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}
