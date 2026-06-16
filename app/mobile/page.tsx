import Image from "next/image";
import Link from "next/link";
import { Bell, Search, Heart, MapPin, Calendar } from "lucide-react";
import { getFeaturedCars } from "@/app/actions";

export default async function MobileHome() {
  const cars = await getFeaturedCars();

  return (
    <div className="flex flex-col min-h-screen text-white pb-6">
      
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
            <Image src="/assets/logo.png" alt="Rent-Ex" fill className="object-contain p-1" />
          </div>
          <span className="text-xl font-bold tracking-tight">RENT-EX</span>
        </div>
        <button className="relative p-2 rounded-full bg-[#1C1C1C] border border-white/5 text-[#A3A3A3] hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#E53935] rounded-full border border-[#1C1C1C]"></span>
        </button>
      </header>

      {/* Hero Content */}
      <div className="px-5 mt-2 space-y-2">
        <h1 className="text-[32px] font-bold leading-tight">
          Finden Sie Ihr <br/> perfektes Fahrzeug
        </h1>
        <p className="text-[16px] text-[#A3A3A3]">
          Schnelle, einfache und zuverlässige Fahrzeugvermietung
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-5 mt-6">
        <form action="/mobile/fleet" method="GET" className="relative flex items-center">
          <input 
            type="text" 
            name="q"
            placeholder="Fahrzeug suchen..." 
            className="w-full bg-[#1C1C1C] border border-white/5 rounded-2xl py-4 pl-4 pr-12 text-[16px] text-white placeholder-[#A3A3A3] outline-none focus:border-[#E53935]"
          />
          <button type="submit" className="absolute right-3 p-2 bg-[#E53935] rounded-xl text-white">
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Filter Chips (Grid) */}
      <div className="mt-6 px-5 grid grid-cols-2 gap-3">
        <button className="flex justify-center items-center gap-2 px-4 py-3 bg-[#1C1C1C] border border-white/5 rounded-2xl text-sm text-white">
          <MapPin className="w-4 h-4 text-[#A3A3A3]" /> Standort
        </button>
        <button className="flex justify-center items-center gap-2 px-4 py-3 bg-[#1C1C1C] border border-white/5 rounded-2xl text-sm text-white">
          <Calendar className="w-4 h-4 text-[#A3A3A3]" /> Datum
        </button>
        <button className="flex justify-center items-center gap-2 px-4 py-3 bg-[#1C1C1C] border border-white/5 rounded-2xl text-sm text-white">
          <Calendar className="w-4 h-4 text-[#A3A3A3]" /> Rückgabe
        </button>
        <Link href="/mobile/filter" className="flex justify-center items-center gap-2 px-4 py-3 bg-[#1C1C1C] border border-white/5 rounded-2xl text-sm text-white hover:bg-[#E53935]/10 hover:border-[#E53935] transition-colors">
          Filter
        </Link>
      </div>

      {/* Vehicle List Section */}
      <div className="px-5 mt-8 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[24px] font-semibold">Verfügbare Fahrzeuge</h2>
          <Link href="/mobile/fleet" className="text-sm font-medium text-[#E53935]">
            Alle anzeigen
          </Link>
        </div>

        <div className="space-y-4">
          {cars.map((car: any) => (
            <div key={car.id} className="bg-[#1C1C1C] rounded-[1.5rem] border border-white/5 p-4 shadow-sm relative flex flex-col">
              <button className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-[#A3A3A3] hover:text-[#E53935]">
                <Heart className="w-4 h-4" />
              </button>
              
              <div className="relative w-full h-40 bg-black/20 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                <Image 
                  src={car.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800"} 
                  alt={`${car.brand} ${car.model}`} 
                  fill 
                  className="object-cover"
                />
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{car.brand} {car.model}</h3>
                  <div className="text-[12px] text-[#A3A3A3] mt-1 flex items-center gap-1.5">
                    <span>{car.fuelType || "Diesel"}</span>
                    <span>·</span>
                    <span>{car.transmission || "Automatik"}</span>
                    <span>·</span>
                    <span>{car.seats || 5} Sitze</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-5">
                <div>
                  <span className="text-xl font-bold text-[#E53935]">
                    {new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(Number(car.dailyRate))}
                  </span>
                  <span className="text-[12px] text-[#A3A3A3]"> / Tag</span>
                </div>
                <Link href={`/mobile/fleet/${car.id}`} className="px-5 py-2.5 bg-[#E53935] hover:bg-red-700 text-white font-medium text-sm rounded-xl transition-colors">
                  Jetzt buchen
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
