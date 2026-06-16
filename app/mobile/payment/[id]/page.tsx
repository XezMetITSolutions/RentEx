"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ChevronLeft, CreditCard, Lock, CheckCircle2 } from "lucide-react";

export default function MobilePayment({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [method, setMethod] = useState("Kreditkarte");

  // In a real app we'd fetch the price based on id and dates, using hardcoded for design demo
  const totalAmount = "€195,00";

  return (
    <div className="flex flex-col min-h-screen text-white pb-24 bg-[#0A0A0A]">
      
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5 bg-[#141414] sticky top-0 z-20">
        <Link href={`/mobile/checkout/${resolvedParams.id}`} className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-white">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold">Zahlung</h1>
        <div className="w-10"></div>
      </header>

      {/* Progress Indicator */}
      <div className="px-5 py-6 bg-[#141414] border-b border-white/5">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#E53935] -translate-y-1/2 z-0"></div>
          
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="relative z-10 w-8 h-8 rounded-full bg-[#E53935] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_15px_rgba(229,57,53,0.4)]">
            3
          </div>
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] text-[#A3A3A3] font-medium">Details</span>
          <span className="text-[10px] text-[#A3A3A3] font-medium">Zahlung</span>
          <span className="text-[10px] text-[#E53935] font-bold">Fertig</span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-5 mt-8 space-y-4">
        <h2 className="text-[18px] font-bold text-white mb-2">Zahlungsmethode</h2>
        
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => setMethod("Kreditkarte")}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${method === "Kreditkarte" ? "bg-[#E53935]/10 border-[#E53935]" : "bg-[#1C1C1C] border-white/5"}`}
          >
            <CreditCard className={`w-6 h-6 ${method === "Kreditkarte" ? "text-[#E53935]" : "text-[#A3A3A3]"}`} />
            <span className={`text-[11px] font-medium ${method === "Kreditkarte" ? "text-[#E53935]" : "text-[#A3A3A3]"}`}>Kreditkarte</span>
          </button>
          
          <button 
            onClick={() => setMethod("PayPal")}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${method === "PayPal" ? "bg-[#E53935]/10 border-[#E53935]" : "bg-[#1C1C1C] border-white/5"}`}
          >
            <div className={`text-[16px] font-black ${method === "PayPal" ? "text-[#E53935]" : "text-[#A3A3A3]"}`}>P</div>
            <span className={`text-[11px] font-medium ${method === "PayPal" ? "text-[#E53935]" : "text-[#A3A3A3]"}`}>PayPal</span>
          </button>

          <button 
            onClick={() => setMethod("Apple Pay")}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${method === "Apple Pay" ? "bg-[#E53935]/10 border-[#E53935]" : "bg-[#1C1C1C] border-white/5"}`}
          >
            <div className={`text-[16px] font-black ${method === "Apple Pay" ? "text-[#E53935]" : "text-[#A3A3A3]"}`}> Pay</div>
            <span className={`text-[11px] font-medium ${method === "Apple Pay" ? "text-[#E53935]" : "text-[#A3A3A3]"}`}>Apple Pay</span>
          </button>
        </div>
      </div>

      {/* Credit Card Info */}
      {method === "Kreditkarte" && (
        <div className="px-5 mt-8 space-y-4">
          <h2 className="text-[18px] font-bold text-white mb-2">Karteninformationen</h2>
          
          <div className="space-y-4">
            <div className="relative">
              <input type="text" placeholder="Kartennummer" className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-4 pr-4 text-[16px] text-white outline-none focus:border-[#E53935] placeholder-[#A3A3A3]" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input type="text" placeholder="MM/JJ" className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-4 pr-4 text-[16px] text-white outline-none focus:border-[#E53935] placeholder-[#A3A3A3]" />
              </div>
              <div className="relative">
                <input type="text" placeholder="CVC" className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-4 pr-4 text-[16px] text-white outline-none focus:border-[#E53935] placeholder-[#A3A3A3]" />
              </div>
            </div>
            
            <div className="relative">
              <input type="text" placeholder="Name auf der Karte" className="w-full bg-[#1C1C1C] border border-white/5 rounded-[1rem] py-4 pl-4 pr-4 text-[16px] text-white outline-none focus:border-[#E53935] placeholder-[#A3A3A3]" />
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-4 bg-[#141414] border-t border-white/10 z-30">
        <Link href="/mobile/bookings" className="flex items-center justify-center w-full py-4 bg-[#E53935] hover:bg-red-700 text-white font-bold text-[16px] rounded-[1rem] transition-colors shadow-lg shadow-[#E53935]/30">
          Bezahlen {totalAmount}
        </Link>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Lock className="w-3.5 h-3.5 text-[#A3A3A3]" />
          <span className="text-[11px] text-[#A3A3A3]">Sichere Zahlung</span>
        </div>
      </div>

    </div>
  );
}
