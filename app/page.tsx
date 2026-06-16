import Navbar from "@/components/home/Navbar";
import { Calendar, Car, MapPin, Search, Phone, ShieldCheck, Clock, CheckCircle, Heart, Settings, Fuel, Users, Wind, ChevronDown, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const vehicles = [
    {
      name: "VW Golf Kombi",
      transmission: "Automatik",
      fuel: "Diesel",
      seats: "5 Sitze",
      ac: "Klimaanlage",
      price: "32,50",
      img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800"
    },
    {
      name: "Mercedes Vito",
      transmission: "Automatik",
      fuel: "Diesel",
      seats: "9 Sitze",
      ac: "Klimaanlage",
      price: "59,90",
      img: "https://images.unsplash.com/photo-1605556278854-18cbb3a9925e?auto=format&fit=crop&w=800"
    },
    {
      name: "Ford Transit",
      transmission: "Manuell",
      fuel: "Diesel",
      seats: "3 Sitze",
      ac: "Klimaanlage",
      price: "65,00",
      img: "https://images.unsplash.com/photo-1583267746897-b8448557b708?auto=format&fit=crop&w=800"
    },
    {
      name: "BMW 3 Series",
      transmission: "Automatik",
      fuel: "Benzin",
      seats: "5 Sitze",
      ac: "Klimaanlage",
      price: "45,00",
      img: "https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=800"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans overflow-x-hidden">
      <Navbar />

      <main className="pt-28 pb-16 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start mt-4">
          
          {/* Left Sidebar (Fahrzeugsuche) */}
          <aside className="w-full lg:w-[320px] shrink-0 space-y-4">
            <div className="bg-[#0f0f0f] border border-white/5 p-5 rounded-[1.5rem] shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6">Fahrzeugsuche</h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 ml-1">Abholort</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Stadt oder Adresse"
                      className="w-full bg-transparent border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white outline-none focus:border-red-500 transition-colors text-sm placeholder:text-zinc-600"
                    />
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 ml-1">Abholdatum</label>
                  <div className="relative">
                    <input
                      type="date"
                      defaultValue={todayStr}
                      className="w-full bg-transparent border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white outline-none focus:border-red-500 transition-colors text-sm [color-scheme:dark]"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 ml-1">Rückgabedatum</label>
                  <div className="relative">
                    <input
                      type="date"
                      defaultValue={tomorrowStr}
                      className="w-full bg-transparent border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white outline-none focus:border-red-500 transition-colors text-sm [color-scheme:dark]"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 ml-1">Fahrzeugtyp</label>
                  <div className="relative">
                    <select className="w-full bg-transparent border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white outline-none focus:border-red-500 transition-colors text-sm appearance-none cursor-pointer">
                      <option>Alle Fahrzeugtypen</option>
                      <option>PKW</option>
                      <option>Transporter</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <button className="w-full py-3.5 bg-[#e50914] hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-all mt-6 shadow-[0_4px_14px_rgba(229,9,20,0.4)]">
                  Fahrzeuge finden
                </button>
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-[#0f0f0f] border border-white/5 p-5 rounded-[1.5rem] flex items-center gap-4">
              <div className="text-red-500">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Benötigen Sie Hilfe?</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Unser Team ist 24/7 für Sie da.</p>
                <p className="text-sm font-bold text-red-500 mt-1">+43 660 9996800</p>
              </div>
            </div>
          </aside>

          {/* Center Column (Hero & Fleet) */}
          <section className="flex-1 min-w-0 flex flex-col gap-8">
            
            {/* Hero Top */}
            <div className="relative bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-8 lg:p-12 overflow-hidden min-h-[360px] flex items-center">
              {/* Glow Behind Car */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
              
              {/* Text Content */}
              <div className="relative z-10 max-w-xl">
                <span className="text-red-500 text-xs font-bold tracking-widest uppercase mb-4 block">Sofort Verfügbar</span>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] mb-4">
                  Finden Sie Ihr <br /> perfektes Fahrzeug
                </h1>
                <p className="text-zinc-400 text-lg">Premium Fahrzeuge. Top Service. Beste Preise.</p>
                
                {/* Category Filters */}
                <div className="flex flex-wrap items-center gap-3 mt-10">
                  <button className="px-6 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-600/30">Alle</button>
                  <button className="px-6 py-2 rounded-lg bg-[#1a1a1a] text-zinc-300 hover:text-white text-sm font-medium border border-white/5 hover:border-white/10 transition-colors">PKW</button>
                  <button className="px-6 py-2 rounded-lg bg-[#1a1a1a] text-zinc-300 hover:text-white text-sm font-medium border border-white/5 hover:border-white/10 transition-colors">Transporter</button>
                  <button className="px-6 py-2 rounded-lg bg-[#1a1a1a] text-zinc-300 hover:text-white text-sm font-medium border border-white/5 hover:border-white/10 transition-colors">Kleinbusse</button>
                  <button className="px-6 py-2 rounded-lg bg-[#1a1a1a] text-zinc-300 hover:text-white text-sm font-medium border border-white/5 hover:border-white/10 transition-colors">LKW</button>
                </div>
              </div>

              {/* Dark BMW Image */}
              <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[55%] h-[120%] pointer-events-none hidden md:block">
                <div className="relative w-full h-full">
                  <Image 
                    src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200" 
                    alt="Premium BMW" 
                    fill 
                    className="object-cover object-center rounded-l-[100px] mask-image-[linear-gradient(to_left,black,transparent)] opacity-90 mix-blend-lighten"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-transparent to-transparent" />
                </div>
              </div>
            </div>

            {/* Sorting */}
            <div className="flex justify-end items-center gap-3">
              <span className="text-xs text-zinc-400">Sortieren nach</span>
              <div className="relative">
                <select className="bg-[#0f0f0f] border border-white/10 rounded-lg py-2 pl-4 pr-10 text-white outline-none focus:border-red-500 text-sm appearance-none cursor-pointer">
                  <option>Beliebteste</option>
                  <option>Preis (Aufsteigend)</option>
                  <option>Preis (Absteigend)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            {/* Vehicle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {vehicles.map((car, idx) => (
                <div key={idx} className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors group relative flex flex-col">
                  <button className="absolute top-4 right-4 text-zinc-500 hover:text-red-500 transition-colors z-10">
                    <Heart className="w-5 h-5" />
                  </button>
                  
                  <div className="relative h-32 w-full mb-4">
                    <Image src={car.img} alt={car.name} fill className="object-cover rounded-xl" />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-white text-base truncate">{car.name}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-400">{car.transmission}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[11px] text-zinc-400 mb-6 flex-1">
                    <div className="flex items-center gap-1.5"><Fuel className="w-3.5 h-3.5" /> {car.fuel}</div>
                    <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {car.seats}</div>
                    <div className="flex items-center gap-1.5 col-span-2"><Wind className="w-3.5 h-3.5" /> {car.ac}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-lg font-bold text-white">€{car.price}</span>
                      <span className="text-[10px] text-zinc-500"> / Tag</span>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
                      Jetzt Buchen
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center mt-2">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-[#0f0f0f] border border-white/10 hover:border-white/20 text-zinc-300 text-sm rounded-xl transition-all">
                Mehr Fahrzeuge anzeigen <ChevronDown className="w-4 h-4" />
              </button>
            </div>

          </section>

          {/* Right Sidebar (Advantages) */}
          <aside className="w-full lg:w-[280px] shrink-0 space-y-4">
            
            <div className="bg-[#0f0f0f] border border-white/5 p-5 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-colors">
              <div className="text-red-500">
                <ShieldCheck className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Versicherte Fahrzeuge</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Vollkasko & Insassenschutz</p>
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-white/5 p-5 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-colors">
              <div className="text-red-500">
                <Phone className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">24/7 Support</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Wir sind jederzeit für Sie da</p>
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-white/5 p-5 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-colors">
              <div className="text-red-500">
                <CheckCircle className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Schnelle Buchung</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">In nur wenigen Schritten</p>
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-white/5 p-5 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-colors">
              <div className="text-red-500">
                <Tag className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Faire Preise</h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">Transparente & keine versteckten Kosten</p>
              </div>
            </div>

          </aside>
        </div>

        {/* Bottom Trust Badges */}
        <div className="mt-16 bg-[#0f0f0f] border border-white/5 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            <div className="flex items-center gap-4 px-4">
              <Car className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-white">Über 500+ Fahrzeuge</h4>
                <p className="text-[11px] text-zinc-500">Für jeden Bedarf das Richtige</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4">
              <MapPin className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-white">Österreichweit</h4>
                <p className="text-[11px] text-zinc-500">An 150+ Standorten</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4">
              <Heart className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-white">Beste Bewertungen</h4>
                <p className="text-[11px] text-zinc-500">4,9/5 Sterne von Kunden</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4">
              <Calendar className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-white">Flexible Mietdauer</h4>
                <p className="text-[11px] text-zinc-500">Täglich, wöchentlich, monatlich</p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
