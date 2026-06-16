import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Heart, Fuel, Gauge, Users, Wind, ShieldCheck, Info } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function MobileVehicleDetails({ params }: { params: { id: string } }) {
  const carId = parseInt(params.id, 10);
  if (isNaN(carId)) return notFound();

  const car = await prisma.car.findUnique({
    where: { id: carId }
  });

  if (!car) return notFound();

  return (
    <div className="flex flex-col min-h-screen text-white pb-24 bg-[#0A0A0A]">
      
      {/* Top Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-white/5 bg-[#141414] sticky top-0 z-20">
        <Link href="/mobile/fleet" className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-white">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold">Fahrzeugdetails</h1>
        <button className="w-10 h-10 flex items-center justify-center bg-[#1C1C1C] border border-white/5 rounded-xl text-[#A3A3A3] hover:text-[#E53935]">
          <Heart className="w-5 h-5" />
        </button>
      </header>

      {/* Large Vehicle Image */}
      <div className="relative w-full h-64 bg-black/20 flex items-center justify-center border-b border-white/5">
        <Image 
          src={car.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200"} 
          alt={`${car.brand} ${car.model}`} 
          fill 
          className="object-contain p-4"
        />
      </div>

      {/* Title & Price */}
      <div className="px-5 mt-6">
        <h2 className="text-[24px] font-bold leading-tight">{car.brand} {car.model}</h2>
        <div className="flex items-center gap-2 mt-2 text-[#A3A3A3] text-sm">
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
          <div className="bg-[#1C1C1C] border border-white/5 rounded-[1.2rem] p-3 flex flex-col items-center justify-center gap-2">
            <Fuel className="w-6 h-6 text-[#A3A3A3] stroke-[1.5]" />
            <span className="text-[10px] text-[#A3A3A3] text-center uppercase">{car.fuelType || "Diesel"}</span>
          </div>
          <div className="bg-[#1C1C1C] border border-white/5 rounded-[1.2rem] p-3 flex flex-col items-center justify-center gap-2">
            <Gauge className="w-6 h-6 text-[#A3A3A3] stroke-[1.5]" />
            <span className="text-[10px] text-[#A3A3A3] text-center uppercase">{car.transmission || "Automatik"}</span>
          </div>
          <div className="bg-[#1C1C1C] border border-white/5 rounded-[1.2rem] p-3 flex flex-col items-center justify-center gap-2">
            <Users className="w-6 h-6 text-[#A3A3A3] stroke-[1.5]" />
            <span className="text-[10px] text-[#A3A3A3] text-center uppercase">{car.seats || 5} Sitze</span>
          </div>
          <div className="bg-[#1C1C1C] border border-white/5 rounded-[1.2rem] p-3 flex flex-col items-center justify-center gap-2">
            <Wind className="w-6 h-6 text-[#A3A3A3] stroke-[1.5]" />
            <span className="text-[10px] text-[#A3A3A3] text-center uppercase">{car.hasAirConditioning ? "Klima" : "Keine"}</span>
          </div>
        </div>
      </div>

      {/* Beschreibung */}
      <div className="px-5 mt-8 space-y-3">
        <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-[#E53935]" /> Beschreibung
        </h3>
        <p className="text-[14px] text-[#A3A3A3] leading-relaxed">
          {car.description || `Der ${car.brand} ${car.model} bietet eine perfekte Kombination aus Komfort und Leistung. Ideal für Stadtfahrten und längere Reisen in Österreich.`}
        </p>
      </div>

      {/* Details Rows */}
      <div className="px-5 mt-8 space-y-3">
        <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#E53935]" /> Mietbedingungen
        </h3>
        <div className="bg-[#1C1C1C] border border-white/5 rounded-2xl p-1">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <span className="text-[#A3A3A3] text-sm">Kilometerbegrenzung</span>
            <span className="text-white text-sm font-medium">{car.maxMileagePerDay ? `${car.maxMileagePerDay} km / Tag` : "250 km / Tag"}</span>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <span className="text-[#A3A3A3] text-sm">Zusätzliche km</span>
            <span className="text-white text-sm font-medium">€0,30 / km</span>
          </div>
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <span className="text-[#A3A3A3] text-sm">Tankregelung</span>
            <span className="text-white text-sm font-medium">Voll zu Voll</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-[#A3A3A3] text-sm">Versicherung</span>
            <span className="text-[#E53935] text-sm font-bold bg-[#E53935]/10 px-2 py-1 rounded-md">Inklusive</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Booking Bar */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-4 bg-[#141414] border-t border-white/10 z-30">
        <Link href={`/mobile/checkout/${car.id}`} className="flex items-center justify-center w-full py-4 bg-[#E53935] hover:bg-red-700 text-white font-bold text-[16px] rounded-[1rem] transition-colors shadow-lg shadow-[#E53935]/30">
          Jetzt buchen
        </Link>
      </div>

    </div>
  );
}
