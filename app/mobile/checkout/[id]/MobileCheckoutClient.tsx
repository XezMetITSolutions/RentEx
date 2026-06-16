"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal, MapPin, Calendar, Clock, ChevronDown, Check, X, Info } from "lucide-react";

export default function MobileCheckoutClient({ car }: { car: any }) {
  const router = useRouter();
  
  const [gleicherOrt, setGleicherOrt] = useState(true);
  const [abholort, setAbholort] = useState("Feldkirch, Österreich");
  const [rueckgabeort, setRueckgabeort] = useState("Feldkirch, Österreich");
  
  const [abholdatum, setAbholdatum] = useState("2026-05-12");
  const [abholzeit, setAbholzeit] = useState("10:00");
  const [rueckgabedatum, setRueckgabedatum] = useState("2026-05-18");
  const [rueckgabezeit, setRueckgabezeit] = useState("10:00");
  
  const [alter, setAlter] = useState("30+");
  
  const [promoCode, setPromoCode] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "valid" | "invalid">("idle");
  
  const [summaryOpen, setSummaryOpen] = useState(true);

  // Simple validation
  const isValidDate = new Date(rueckgabedatum) > new Date(abholdatum);
  const isFormValid = abholort && abholdatum && rueckgabedatum && isValidDate;

  // Pricing math
  const days = 6;
  const basePrice = Number(car.dailyRate);
  const totalBase = days * basePrice;
  const youngDriverFee = alter === "21-24" ? 15 * days : 0;
  const discount = promoState === "valid" ? -50 : 0;
  const total = totalBase + youngDriverFee + discount;

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "RENTEX50") setPromoState("valid");
    else setPromoState("invalid");
  };

  return (
    <div className="flex flex-col min-h-screen text-white pb-32 bg-[#0A0A0A]">
      
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5 bg-[#141414] sticky top-0 z-20">
        <Link href={`/mobile/fleet/${car.id}`} className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-white">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold">Buchungsdetails</h1>
        <button className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Step Indicator */}
      <div className="px-5 py-6 bg-[#141414] border-b border-white/5">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
          <div className="absolute top-1/2 left-0 w-0 h-0.5 bg-[#E53935] -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(229,57,53,0.4)]">
            1
          </div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#1C1C1C] border border-white/10 flex items-center justify-center text-[#A3A3A3] text-sm font-bold">
            2
          </div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#1C1C1C] border border-white/10 flex items-center justify-center text-[#A3A3A3] text-sm font-bold">
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] text-[#E53935] font-bold">Details</span>
          <span className="text-[10px] text-[#A3A3A3] font-medium">Übersicht</span>
          <span className="text-[10px] text-[#A3A3A3] font-medium">Zahlung</span>
        </div>
      </div>

      {/* Selected Vehicle Summary */}
      <div className="px-5 mt-6">
        <div className="bg-[#1C1C1C] border border-white/5 rounded-2xl p-3 flex items-center gap-4">
          <div className="relative w-20 h-14 bg-black/20 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
            <Image src={car.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800"} alt={car.model} fill className="object-cover" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-white">{car.brand} {car.model}</h3>
            <div className="text-[12px] mt-0.5">
              <span className="text-[#E53935] font-bold">{new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(basePrice)}</span>
              <span className="text-[#A3A3A3]"> / Tag</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="px-5 mt-6 space-y-5">
        
        {/* Abholort */}
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Abholort</label>
          <div className="relative">
            <select value={abholort} onChange={(e) => setAbholort(e.target.value)} className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-12 pr-10 text-[14px] text-white outline-none focus:border-[#E53935] appearance-none">
              <option>Feldkirch, Österreich</option>
              <option>Dornbirn, Österreich</option>
              <option>Bregenz, Österreich</option>
            </select>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3A3A3] pointer-events-none" />
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" />
          </div>
        </div>

        {/* Rückgabeort Toggle */}
        <div className="flex items-center gap-3 ml-1">
          <button 
            type="button" 
            onClick={() => setGleicherOrt(!gleicherOrt)}
            className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${gleicherOrt ? 'bg-[#E53935]' : 'bg-[#1C1C1C] border border-white/20'}`}
          >
            {gleicherOrt && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
          <span className="text-[14px] text-white">Gleicher Ort wie Abholort</span>
        </div>

        {/* Rückgabeort (Hidden by default) */}
        {!gleicherOrt && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Rückgabeort</label>
            <div className="relative">
              <select value={rueckgabeort} onChange={(e) => setRueckgabeort(e.target.value)} className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-12 pr-10 text-[14px] text-white outline-none focus:border-[#E53935] appearance-none">
                <option>Feldkirch, Österreich</option>
                <option>Dornbirn, Österreich</option>
                <option>Flughafen Zürich, CH</option>
              </select>
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A3A3A3] pointer-events-none" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" />
            </div>
          </div>
        )}

        {/* Abholdatum & Zeit */}
        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Abholdatum</label>
            <div className="relative">
              <input type="date" value={abholdatum} onChange={(e) => setAbholdatum(e.target.value)} className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-10 pr-4 text-[14px] text-white outline-none focus:border-[#E53935] [color-scheme:dark]" />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Zeit</label>
            <div className="relative">
              <input type="time" value={abholzeit} onChange={(e) => setAbholzeit(e.target.value)} className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-10 pr-4 text-[14px] text-white outline-none focus:border-[#E53935] [color-scheme:dark]" />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Rückgabedatum & Zeit */}
        <div className="grid grid-cols-[2fr_1fr] gap-3">
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Rückgabedatum</label>
            <div className="relative">
              <input type="date" value={rueckgabedatum} onChange={(e) => setRueckgabedatum(e.target.value)} className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-10 pr-4 text-[14px] text-white outline-none focus:border-[#E53935] [color-scheme:dark]" />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" />
            </div>
            {!isValidDate && <span className="text-[#E53935] text-[10px] ml-1">Muss nach Abholdatum liegen</span>}
          </div>
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Zeit</label>
            <div className="relative">
              <input type="time" value={rueckgabezeit} onChange={(e) => setRueckgabezeit(e.target.value)} className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-10 pr-4 text-[14px] text-white outline-none focus:border-[#E53935] [color-scheme:dark]" />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Alter des Fahrers */}
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Alter des Fahrers</label>
          <div className="relative">
            <select value={alter} onChange={(e) => setAlter(e.target.value)} className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-4 pr-10 text-[14px] text-white outline-none focus:border-[#E53935] appearance-none">
              <option value="21-24">21–24 Jahre</option>
              <option value="25-29">25–29 Jahre</option>
              <option value="30+">30+ Jahre</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" />
          </div>
          {alter === "21-24" && <div className="text-[10px] text-[#A3A3A3] ml-1 flex items-center gap-1"><Info className="w-3 h-3"/> Jungfahrer-Gebühr wird angewendet</div>}
        </div>

        {/* Aktionscode */}
        <div className="space-y-2">
          <label className="text-[12px] font-medium text-[#A3A3A3] ml-1">Aktionscode</label>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value); setPromoState("idle"); }}
              placeholder="Code eingeben" 
              className={`flex-1 bg-[#1C1C1C] border rounded-[1rem] py-4 px-4 text-[14px] text-white outline-none transition-colors ${
                promoState === "invalid" ? "border-[#E53935]" : promoState === "valid" ? "border-green-500" : "border-white/5 focus:border-[#E53935]"
              }`} 
            />
            <button onClick={handleApplyPromo} className="px-6 py-4 bg-[#1C1C1C] border border-white/5 hover:border-white/20 rounded-[1rem] text-[14px] font-medium text-white transition-colors">
              Anwenden
            </button>
          </div>
          {promoState === "invalid" && <span className="text-[#E53935] text-[10px] ml-1">Ungültiger Code</span>}
          {promoState === "valid" && <span className="text-green-500 text-[10px] ml-1">Rabatt angewendet</span>}
        </div>

      </div>

      {/* Sticky Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#141414] border-t border-white/10 z-30 flex flex-col">
        
        {/* Live Price Summary (Collapsible) */}
        <div className="px-5 border-b border-white/5">
          <button 
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="w-full py-4 flex items-center justify-between"
          >
            <span className="text-[14px] font-bold text-white">Preisübersicht</span>
            <ChevronDown className={`w-4 h-4 text-[#A3A3A3] transition-transform ${summaryOpen ? "rotate-180" : ""}`} />
          </button>
          
          {summaryOpen && (
            <div className="pb-4 space-y-2 text-[12px]">
              <div className="flex items-center justify-between text-[#A3A3A3]">
                <span>{days} Tage × €{basePrice.toFixed(2)}</span>
                <span className="text-white">€{totalBase.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[#A3A3A3]">
                <span>Versicherung</span>
                <span className="text-white">Inklusive</span>
              </div>
              {youngDriverFee > 0 && (
                <div className="flex items-center justify-between text-[#A3A3A3]">
                  <span>Jungfahrer-Gebühr</span>
                  <span className="text-white">€{youngDriverFee.toFixed(2)}</span>
                </div>
              )}
              {discount < 0 && (
                <div className="flex items-center justify-between text-green-500">
                  <span>Rabatt (Code)</span>
                  <span>-€{Math.abs(discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
                <span className="font-bold text-white text-[14px]">Gesamt</span>
                <span className="font-bold text-[#E53935] text-[16px]">€{total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <button 
            disabled={!isFormValid}
            onClick={() => router.push(`/mobile/payment/${car.id}`)}
            className={`flex items-center justify-center w-full py-4 font-bold text-[16px] rounded-[1rem] transition-colors ${
              isFormValid 
                ? "bg-[#E53935] hover:bg-red-700 text-white shadow-lg shadow-[#E53935]/30" 
                : "bg-[#1C1C1C] text-[#A3A3A3] cursor-not-allowed"
            }`}
          >
            Weiter zur Übersicht
          </button>
        </div>
      </div>

    </div>
  );
}
