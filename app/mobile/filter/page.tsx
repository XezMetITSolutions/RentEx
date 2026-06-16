"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Car, Gauge, Fuel } from "lucide-react";

export default function MobileFilter() {
  const [typ, setTyp] = useState("Alle");
  const [getriebe, setGetriebe] = useState("Alle");
  const [kraftstoff, setKraftstoff] = useState("Alle");
  const [preis, setPreis] = useState(100);

  const fahrzeugtypen = ["Alle", "PKW", "Transporter", "LKW", "SUV"];
  const getriebeArten = ["Alle", "Schaltgetriebe", "Automatik"];
  const kraftstoffArten = ["Alle", "Diesel", "Benzin", "Elektrisch"];

  return (
    <div className="flex flex-col min-h-screen text-white pb-24 bg-[#0A0A0A]">
      
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5 bg-[#141414] sticky top-0 z-20">
        <Link href="/mobile" className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-white">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold">Filter</h1>
        <button 
          onClick={() => { setTyp("Alle"); setGetriebe("Alle"); setKraftstoff("Alle"); setPreis(200); }}
          className="text-[#E53935] text-[12px] font-bold"
        >
          Zurücksetzen
        </button>
      </header>

      <div className="px-5 mt-6 space-y-8">
        
        {/* Fahrzeugtyp */}
        <div className="space-y-4">
          <h2 className="text-[16px] font-bold flex items-center gap-2">
            <Car className="w-5 h-5 text-[#E53935]" /> Fahrzeugtyp
          </h2>
          <div className="flex flex-wrap gap-2">
            {fahrzeugtypen.map((item) => (
              <button 
                key={item}
                onClick={() => setTyp(item)}
                className={`px-4 py-2 rounded-full text-[12px] font-medium border transition-colors ${
                  typ === item ? "bg-[#E53935] text-white border-[#E53935]" : "bg-[#1C1C1C] border-white/5 text-[#A3A3A3]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Getriebe */}
        <div className="space-y-4">
          <h2 className="text-[16px] font-bold flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#E53935]" /> Getriebe
          </h2>
          <div className="flex flex-wrap gap-2">
            {getriebeArten.map((item) => (
              <button 
                key={item}
                onClick={() => setGetriebe(item)}
                className={`px-4 py-2 rounded-full text-[12px] font-medium border transition-colors ${
                  getriebe === item ? "bg-[#E53935] text-white border-[#E53935]" : "bg-[#1C1C1C] border-white/5 text-[#A3A3A3]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Kraftstoffart */}
        <div className="space-y-4">
          <h2 className="text-[16px] font-bold flex items-center gap-2">
            <Fuel className="w-5 h-5 text-[#E53935]" /> Kraftstoffart
          </h2>
          <div className="flex flex-wrap gap-2">
            {kraftstoffArten.map((item) => (
              <button 
                key={item}
                onClick={() => setKraftstoff(item)}
                className={`px-4 py-2 rounded-full text-[12px] font-medium border transition-colors ${
                  kraftstoff === item ? "bg-[#E53935] text-white border-[#E53935]" : "bg-[#1C1C1C] border-white/5 text-[#A3A3A3]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Preisspanne */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold">Preisspanne</h2>
            <span className="text-[14px] font-bold text-[#E53935]">€0 - €{preis}</span>
          </div>
          <div className="relative pt-2">
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={preis}
              onChange={(e) => setPreis(parseInt(e.target.value))}
              className="w-full h-1 bg-[#1C1C1C] rounded-lg appearance-none cursor-pointer accent-[#E53935]"
            />
          </div>
          <div className="flex items-center justify-between text-[#A3A3A3] text-[10px]">
            <span>€0</span>
            <span>€200+</span>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-4 bg-[#141414] border-t border-white/10 z-30">
        <Link href="/mobile/fleet" className="flex items-center justify-center w-full py-4 bg-[#E53935] hover:bg-red-700 text-white font-bold text-[16px] rounded-[1rem] transition-colors shadow-lg shadow-[#E53935]/30">
          Filter anwenden
        </Link>
      </div>

    </div>
  );
}
