'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Heart, Fuel, Gauge, Users, Wind, ShieldCheck, Info, Calendar } from "lucide-react";
import PublicCarCalendar from "@/components/fleet/PublicCarCalendar";

export default function MobileCarDetailClient({ car }: { car: any }) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(tomorrow));

  const handleDateSelect = (start: Date, end: Date) => {
    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  return (
    <div className="flex flex-col min-h-screen text-gray-900 dark:text-white pb-24 bg-white dark:bg-[#0A0A0A]">
      
      {/* Top Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#141414] sticky top-0 z-20">
        <Link href="/mobile/fleet" className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-xl text-gray-800 dark:text-white">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold text-gray-900 dark:text-white">Fahrzeugdetails</h1>
        <button className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-xl text-gray-400 dark:text-[#A3A3A3] hover:text-[#E53935]">
          <Heart className="w-5 h-5" />
        </button>
      </header>

      {/* Large Vehicle Image */}
      <div className="relative w-full h-64 bg-gray-50 dark:bg-black/20 flex items-center justify-center border-b border-gray-100 dark:border-white/5">
        <Image 
          src={car.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200"} 
          alt={`${car.brand} ${car.model}`} 
          fill 
          className="object-contain p-4"
        />
      </div>

      {/* Title & Price */}
      <div className="px-5 mt-6">
        <h2 className="text-[24px] font-bold leading-tight text-gray-900 dark:text-white">{car.brand} {car.model}</h2>
        <div className="flex items-center gap-2 mt-2 text-gray-550 dark:text-[#A3A3A3] text-sm">
          <span>{car.category || "Kompakt"}</span>
          <span>·</span>
          <span>{car.transmission || "Automatik"}</span>
          <span>·</span>
          <span>{car.seats || 5} Sitze</span>
        </div>

        <div className="mt-4 inline-block px-4 py-2 bg-[#E53935]/10 rounded-xl border border-[#E53935]/20">
          <span className="text-xl font-bold text-[#E53935]">
            {new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(Number(car.dailyRate))}
          </span>
          <span className="text-[12px] text-[#E53935]/80"> / Tag</span>
        </div>
      </div>

      {/* 4-Icon Feature Box */}
      <div className="px-5 mt-8">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1.2rem] p-3 flex flex-col items-center justify-center gap-2">
            <Fuel className="w-6 h-6 text-gray-500 dark:text-[#A3A3A3] stroke-[1.5]" />
            <span className="text-[10px] text-gray-600 dark:text-[#A3A3A3] text-center uppercase">{car.fuelType || "Diesel"}</span>
          </div>
          <div className="bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1.2rem] p-3 flex flex-col items-center justify-center gap-2">
            <Gauge className="w-6 h-6 text-gray-500 dark:text-[#A3A3A3] stroke-[1.5]" />
            <span className="text-[10px] text-gray-600 dark:text-[#A3A3A3] text-center uppercase">{car.transmission || "Automatik"}</span>
          </div>
          <div className="bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1.2rem] p-3 flex flex-col items-center justify-center gap-2">
            <Users className="w-6 h-6 text-gray-500 dark:text-[#A3A3A3] stroke-[1.5]" />
            <span className="text-[10px] text-gray-600 dark:text-[#A3A3A3] text-center uppercase">{car.seats || 5} Sitze</span>
          </div>
          <div className="bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1.2rem] p-3 flex flex-col items-center justify-center gap-2">
            <Wind className="w-6 h-6 text-gray-500 dark:text-[#A3A3A3] stroke-[1.5]" />
            <span className="text-[10px] text-gray-600 dark:text-[#A3A3A3] text-center uppercase">{car.hasAirConditioning ? "Klima" : "Keine"}</span>
          </div>
        </div>
      </div>

      {/* Beschreibung */}
      <div className="px-5 mt-8 space-y-3">
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-[#E53935]" /> Beschreibung
        </h3>
        <p className="text-[14px] text-gray-600 dark:text-[#A3A3A3] leading-relaxed">
          {car.description || `Der ${car.brand} ${car.model} bietet eine perfekte Kombination aus Komfort und Leistung. Ideal für Stadtfahrten und längere Reisen in Österreich.`}
        </p>
      </div>

      {/* Verfügbarkeit Kalender */}
      <div className="px-5 mt-8 space-y-3">
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#E53935]" /> Belegungsplan / Verfügbarkeit
        </h3>
        <div className="text-gray-900 dark:text-white">
          <PublicCarCalendar 
            rentals={car.rentals} 
            onDateSelect={handleDateSelect}
            selectedStart={startDate}
            selectedEnd={endDate}
          />
        </div>
      </div>

      {/* Details Rows */}
      <div className="px-5 mt-8 space-y-3">
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#E53935]" /> Mietbedingungen
        </h3>
        <div className="bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-2xl p-1">
          {car.maxMileagePerDay !== null && (
            <div className="flex items-center justify-between p-4 border-b border-gray-150 dark:border-white/5">
              <span className="text-gray-500 dark:text-[#A3A3A3] text-sm">Kilometerbegrenzung</span>
              <span className="text-gray-900 dark:text-white text-sm font-medium">{car.maxMileagePerDay} km / Tag</span>
            </div>
          )}
          {car.extraKmCost !== null && (
            <div className="flex items-center justify-between p-4 border-b border-gray-150 dark:border-white/5">
              <span className="text-gray-500 dark:text-[#A3A3A3] text-sm">Zusätzliche km</span>
              <span className="text-gray-900 dark:text-white text-sm font-medium">€{Number(car.extraKmCost).toFixed(2).replace('.', ',')} / km</span>
            </div>
          )}
          {car.fuelPolicy && (
            <div className="flex items-center justify-between p-4 border-b border-gray-150 dark:border-white/5">
              <span className="text-gray-500 dark:text-[#A3A3A3] text-sm">Tankregelung</span>
              <span className="text-gray-900 dark:text-white text-sm font-medium">{car.fuelPolicy}</span>
            </div>
          )}
          {car.includedInsurance && (
            <div className="flex items-center justify-between p-4">
              <span className="text-gray-500 dark:text-[#A3A3A3] text-sm">Versicherung</span>
              <span className="text-[#E53935] text-sm font-bold bg-[#E53935]/10 px-2 py-1 rounded-md">{car.includedInsurance}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-4 bg-gray-50 dark:bg-[#141414] border-t border-gray-200 dark:border-white/10 z-30">
        <Link 
          href={`/mobile/checkout/${car.id}?from=${startDate}&to=${endDate}`} 
          className="flex items-center justify-center w-full py-4 bg-[#E53935] hover:bg-red-700 text-white font-bold text-[16px] rounded-[1rem] transition-colors shadow-lg shadow-[#E53935]/30"
        >
          Jetzt buchen
        </Link>
      </div>

    </div>
  );
}
