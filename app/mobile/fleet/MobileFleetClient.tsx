"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function MobileFleetClient({ initialCars, categories }: { initialCars: any[], categories: any[] }) {
  const [activeTab, setActiveTab] = useState("Alle");

  const filterCars = () => {
    if (activeTab === "Alle") return initialCars;
    return initialCars.filter((car) => car.category?.toLowerCase() === activeTab.toLowerCase());
  };

  const displayedCars = filterCars();

  return (
    <div className="flex flex-col min-h-screen text-white pb-6 pt-6">
      <div className="px-5 mb-4">
        <h1 className="text-[24px] font-bold">Unser Fuhrpark</h1>
      </div>

      {/* Category Tabs */}
      <div className="px-5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 border-b border-white/5">
        <button
          onClick={() => setActiveTab("Alle")}
          className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
            activeTab === "Alle" 
              ? "bg-[#E53935] text-white" 
              : "bg-[#1C1C1C] border border-white/5 text-[#A3A3A3]"
          }`}
        >
          Alle
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.name)}
            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              activeTab === cat.name 
                ? "bg-[#E53935] text-white" 
                : "bg-[#1C1C1C] border border-white/5 text-[#A3A3A3]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Vehicle List */}
      <div className="px-5 mt-6 space-y-3">
        {displayedCars.length > 0 ? (
          displayedCars.map((car: any) => (
            <Link 
              key={car.id}
              href={`/mobile/fleet/${car.id}`}
              className="flex items-center gap-4 bg-[#1C1C1C] rounded-[1.2rem] border border-white/5 p-3 hover:bg-[#2A2A2A] transition-colors"
            >
              <div className="relative w-24 h-16 bg-black/20 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                <Image 
                  src={car.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800"} 
                  alt={`${car.brand} ${car.model}`} 
                  fill 
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold truncate text-white">{car.brand} {car.model}</h3>
                <p className="text-[12px] text-[#A3A3A3] truncate">{car.fuelType} · {car.transmission}</p>
                <div className="mt-1">
                  <span className="text-sm font-bold text-[#E53935]">
                    {new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(Number(car.dailyRate))}
                  </span>
                  <span className="text-[10px] text-[#A3A3A3]"> / Tag</span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-[#A3A3A3] shrink-0 mr-2" />
            </Link>
          ))
        ) : (
          <div className="py-12 text-center text-[#A3A3A3] text-sm">
            Keine Fahrzeuge in dieser Kategorie gefunden.
          </div>
        )}
      </div>
    </div>
  );
}
