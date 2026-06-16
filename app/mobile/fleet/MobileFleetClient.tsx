"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid, LayoutList, Search, SlidersHorizontal, Heart, Fuel, Gauge, Users, Wind, AlertCircle } from "lucide-react";

export default function MobileFleetClient({ initialCars, categories, initialSearch }: { initialCars: any[], categories: any[], initialSearch: string }) {
  const [activeTab, setActiveTab] = useState("Alle");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState("Preis aufsteigend");

  const filterCars = () => {
    let filtered = initialCars;
    
    if (activeTab !== "Alle") {
      filtered = filtered.filter((car) => car.category?.toLowerCase() === activeTab.toLowerCase());
    }

    if (searchQuery) {
      filtered = filtered.filter((car) => 
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) || 
        car.model.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === "Preis aufsteigend") {
      filtered.sort((a, b) => Number(a.dailyRate) - Number(b.dailyRate));
    } else if (sortBy === "Preis absteigend") {
      filtered.sort((a, b) => Number(b.dailyRate) - Number(a.dailyRate));
    }

    return filtered;
  };

  const displayedCars = filterCars();

  return (
    <div className="flex flex-col min-h-screen text-white pb-24 bg-[#0A0A0A]">
      
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5 bg-[#141414] sticky top-0 z-20">
        <Link href="/mobile" className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-white">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold">Fuhrpark</h1>
        <button 
          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-white"
        >
          {viewMode === "list" ? <LayoutGrid className="w-5 h-5" /> : <LayoutList className="w-5 h-5" />}
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-5 mt-4">
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Im Fuhrpark suchen..." 
            className="w-full bg-[#1C1C1C] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-[14px] text-white placeholder-[#A3A3A3] outline-none focus:border-[#E53935]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mt-4 px-5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setActiveTab("Alle")}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-[12px] font-medium transition-colors border ${
            activeTab === "Alle" 
              ? "bg-[#E53935] border-[#E53935] text-white" 
              : "bg-[#1C1C1C] border-white/5 text-[#A3A3A3]"
          }`}
        >
          Alle
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.name)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-[12px] font-medium transition-colors border ${
              activeTab === cat.name 
                ? "bg-[#E53935] border-[#E53935] text-white" 
                : "bg-[#1C1C1C] border-white/5 text-[#A3A3A3]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Secondary Row: Sort & Filter */}
      <div className="px-5 mt-2 flex items-center justify-between">
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-transparent text-[#A3A3A3] text-[12px] font-medium outline-none appearance-none cursor-pointer"
        >
          <option value="Preis aufsteigend">Preis aufsteigend</option>
          <option value="Preis absteigend">Preis absteigend</option>
          <option value="Beliebtheit">Beliebtheit</option>
          <option value="Neueste">Neueste</option>
        </select>
        
        <Link href="/mobile/filter" className="flex items-center gap-2 text-[#E53935] text-[12px] font-medium">
          <SlidersHorizontal className="w-4 h-4" /> Filter
        </Link>
      </div>

      {/* Result Count Caption */}
      <div className="px-5 mt-4">
        <span className="text-[12px] text-[#A3A3A3]">{displayedCars.length} Fahrzeuge verfügbar</span>
      </div>

      {/* Vehicle List */}
      <div className="px-5 mt-4 space-y-4">
        {displayedCars.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-4"}>
            {displayedCars.map((car: any) => (
              <Link 
                key={car.id}
                href={`/mobile/fleet/${car.id}`}
                className={`relative flex bg-[#1C1C1C] rounded-[1.2rem] border border-white/5 p-3 hover:border-white/10 transition-colors ${
                  viewMode === "grid" ? "flex-col" : "items-center gap-4"
                }`}
              >
                {/* Image & Badges */}
                <div className={`relative bg-black/20 rounded-xl flex items-center justify-center overflow-hidden shrink-0 ${
                  viewMode === "grid" ? "w-full h-24 mb-3" : "w-28 h-20"
                }`}>
                  <Image 
                    src={car.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800"} 
                    alt={`${car.brand} ${car.model}`} 
                    fill 
                    className="object-cover"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2 bg-green-500/20 border border-green-500/30 text-green-500 text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase">
                    Verfügbar
                  </div>
                  {/* Favorite Icon */}
                  <button className="absolute top-2 right-2 p-1 bg-black/40 backdrop-blur-sm rounded-full text-[#A3A3A3]">
                    <Heart className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                {/* Content */}
                <div className={`flex-1 min-w-0 flex flex-col justify-between ${viewMode === "grid" ? "h-full" : ""}`}>
                  <div>
                    <h2 className="text-[14px] font-bold text-white truncate">{car.brand} {car.model}</h2>
                    
                    {/* Spec Row */}
                    <div className="flex items-center gap-1.5 mt-1 text-[#A3A3A3] text-[10px]">
                      <Fuel className="w-3 h-3" /> <span>{car.fuelType}</span>
                      <span className="mx-0.5">·</span>
                      <Gauge className="w-3 h-3" /> <span>{car.transmission}</span>
                      {viewMode === "list" && (
                        <>
                          <span className="mx-0.5">·</span>
                          <Users className="w-3 h-3" /> <span>{car.seats}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-end justify-between mt-3">
                    <div>
                      <span className="text-[16px] font-bold text-[#E53935]">
                        {new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(Number(car.dailyRate))}
                      </span>
                      <span className="text-[10px] text-[#A3A3A3]"> / Tag</span>
                    </div>
                    {viewMode === "list" && (
                      <ChevronRight className="w-4 h-4 text-[#A3A3A3]" />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#1C1C1C] rounded-full flex items-center justify-center mb-4 border border-white/5">
              <AlertCircle className="w-8 h-8 text-[#A3A3A3]" />
            </div>
            <h3 className="text-white font-bold text-[16px] mb-1">Keine Fahrzeuge gefunden</h3>
            <p className="text-[#A3A3A3] text-[12px] mb-6">Passen Sie Ihre Filter an</p>
            <button 
              onClick={() => { setActiveTab("Alle"); setSearchQuery(""); }}
              className="px-6 py-2.5 bg-[#1C1C1C] border border-white/10 hover:border-white/20 text-white font-medium text-sm rounded-xl transition-colors"
            >
              Filter zurücksetzen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
