"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ChevronRight, Clock } from "lucide-react";

export default function MobileBookingsClient({ rentals }: { rentals: any[] }) {
  const [activeTab, setActiveTab] = useState<"Bevorstehend" | "Vergangen">("Bevorstehend");

  const today = new Date();
  
  const upcoming = rentals.filter((r) => new Date(r.endDate) >= today);
  const past = rentals.filter((r) => new Date(r.endDate) < today);

  const displayedRentals = activeTab === "Bevorstehend" ? upcoming : past;

  return (
    <div className="flex flex-col min-h-screen text-gray-900 dark:text-white pb-24 bg-gray-50 dark:bg-[#0A0A0A] transition-colors">
      
      {/* Header */}
      <header className="px-5 pt-12 pb-4 bg-white dark:bg-[#141414] sticky top-0 z-20 shadow-sm border-b border-gray-200 dark:border-white/5 transition-colors">
        <h1 className="text-[24px] font-bold">Meine Buchungen</h1>
        
        {/* Tabs */}
        <div className="flex mt-6">
          <button 
            onClick={() => setActiveTab("Bevorstehend")}
            className={`flex-1 pb-3 text-[14px] font-medium text-center border-b-2 transition-colors ${
              activeTab === "Bevorstehend" ? "border-[#E53935] text-[#E53935] dark:text-white" : "border-transparent text-gray-400 dark:text-[#A3A3A3]"
            }`}
          >
            Bevorstehend
          </button>
          <button 
            onClick={() => setActiveTab("Vergangen")}
            className={`flex-1 pb-3 text-[14px] font-medium text-center border-b-2 transition-colors ${
              activeTab === "Vergangen" ? "border-[#E53935] text-[#E53935] dark:text-white" : "border-transparent text-gray-400 dark:text-[#A3A3A3]"
            }`}
          >
            Vergangen
          </button>
        </div>
      </header>

      {/* Bookings List */}
      <div className="px-5 mt-6 space-y-4">
        {displayedRentals.length > 0 ? (
          displayedRentals.map((rental) => (
            <div key={rental.id} className="bg-white dark:bg-[#1C1C1C] rounded-[1.5rem] border border-gray-200 dark:border-white/5 overflow-hidden shadow-sm transition-colors">
              <div className="relative h-32 w-full bg-black/5 dark:bg-black/20 flex items-center justify-center p-4">
                <Image 
                  src={rental.car?.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800"} 
                  alt={`${rental.car?.brand} ${rental.car?.model}`} 
                  fill 
                  className="object-contain p-4"
                />
                <div className="absolute top-3 right-3 bg-[#E53935] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                  {activeTab === "Bevorstehend" ? "Aktiv" : "Abgeschlossen"}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-3">
                  {rental.car?.brand} {rental.car?.model}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-[#A3A3A3] text-[12px]">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(rental.startDate).toLocaleDateString("de-AT")} - {new Date(rental.endDate).toLocaleDateString("de-AT")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-[#A3A3A3] text-[12px]">
                    <MapPin className="w-4 h-4" />
                    <span>{rental.pickupLocation?.name || "Feldkirch, Österreich"}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/5 transition-colors">
                  <span className="text-[16px] font-bold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(Number(rental.totalAmount))}
                  </span>
                  <Link href={`/mobile/bookings/${rental.id}`} className="text-[12px] font-medium text-[#E53935] flex items-center">
                    Details anzeigen <ChevronRight className="w-4 h-4 ml-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white dark:bg-[#1C1C1C] rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-white/5 transition-colors shadow-sm">
              <Clock className="w-8 h-8 text-gray-400 dark:text-[#A3A3A3]" />
            </div>
            <p className="text-gray-500 dark:text-[#A3A3A3] text-sm">
              Sie haben keine {activeTab === "Bevorstehend" ? "bevorstehenden" : "vergangenen"} Buchungen.
            </p>
            {activeTab === "Bevorstehend" && (
              <Link href="/mobile/fleet" className="mt-4 px-6 py-2.5 bg-[#E53935] hover:bg-red-700 text-white font-medium text-sm rounded-xl transition-colors">
                Fahrzeug finden
              </Link>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
