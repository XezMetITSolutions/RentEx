import Navbar from "@/components/home/Navbar";
import InteractiveFleet from "@/components/home/InteractiveFleet";
import HowItWorks from "@/components/home/HowItWorks";
import FaqAccordion from "@/components/home/FaqAccordion";
import NewsletterCta from "@/components/home/NewsletterCta";
import Footer from "@/components/home/Footer";
import { getFeaturedCars, getCarCategories } from "@/app/actions";
import { Calendar, Car, MapPin, Search, Phone, ShieldCheck, Clock, CheckCircle, Heart, Settings, Fuel, Users, Wind, ChevronDown, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const featuredCars = await getFeaturedCars();
  const categories = await getCarCategories();

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white selection:bg-red-500/30 font-sans overflow-x-hidden transition-colors">
      <Navbar />

      <main className="pt-28 pb-16 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col xl:flex-row gap-6 items-start mt-4">
          
          {/* Left Sidebar (Fahrzeugsuche) */}
          <aside className="w-full xl:w-[320px] shrink-0 space-y-4">
            <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 p-5 rounded-[1.5rem] shadow-xl transition-colors">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Fahrzeugsuche</h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 ml-1">Abholort</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Stadt oder Adresse"
                      className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white outline-none focus:border-red-500 transition-colors text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                    />
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 ml-1">Abholdatum</label>
                  <div className="relative">
                    <input
                      type="date"
                      defaultValue={todayStr}
                      className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white outline-none focus:border-red-500 transition-colors text-sm dark:[color-scheme:dark]"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 ml-1">Rückgabedatum</label>
                  <div className="relative">
                    <input
                      type="date"
                      defaultValue={tomorrowStr}
                      className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white outline-none focus:border-red-500 transition-colors text-sm dark:[color-scheme:dark]"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500 dark:text-zinc-400 ml-1">Fahrzeugtyp</label>
                  <div className="relative">
                    <select className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-gray-900 dark:text-white outline-none focus:border-red-500 transition-colors text-sm appearance-none cursor-pointer">
                      <option className="text-black dark:text-black">Alle Fahrzeugtypen</option>
                      {categories.filter(cat => featuredCars.some(car => car.category?.toLowerCase() === cat.name.toLowerCase())).map((cat) => (
                        <option key={cat.id} className="text-black dark:text-black">{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <button className="w-full py-3.5 bg-[#e50914] hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-all mt-6 shadow-[0_4px_14px_rgba(229,9,20,0.4)]">
                  Fahrzeuge finden
                </button>
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 p-5 rounded-[1.5rem] flex items-center gap-4 transition-colors">
              <div className="text-red-500">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Benötigen Sie Hilfe?</h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">Unser Team ist 24/7 für Sie da.</p>
                <p className="text-sm font-bold text-red-500 mt-1">+43 660 9996800</p>
              </div>
            </div>
          </aside>

          {/* Center Column (Hero & Fleet) */}
          <section className="flex-1 min-w-0 flex flex-col gap-8">
            
            {/* Hero Top */}
            <div className="relative bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 rounded-[2rem] p-8 lg:p-12 overflow-hidden min-h-[360px] flex items-center transition-colors">
              {/* Glow Behind Car */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 blur-[100px] rounded-full mix-blend-screen dark:mix-blend-screen mix-blend-multiply pointer-events-none" />
              
              {/* Text Content */}
              <div className="relative z-10 max-w-xl">
                <span className="text-red-500 text-xs font-bold tracking-widest uppercase mb-4 block">Sofort Verfügbar</span>
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] mb-4">
                  Finden Sie Ihr <br /> perfektes Fahrzeug
                </h1>
                <p className="text-gray-500 dark:text-zinc-400 text-lg">Premium Fahrzeuge. Top Service. Beste Preise.</p>
                
              </div>

              {/* Dark/Light BMW Image */}
              <div className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[55%] h-[120%] pointer-events-none hidden md:block">
                <div className="relative w-full h-full">
                  <Image 
                    src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200" 
                    alt="Premium BMW" 
                    fill 
                    className="object-cover object-center rounded-l-[100px] mask-image-[linear-gradient(to_left,black,transparent)] opacity-90 dark:mix-blend-lighten mix-blend-darken"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent dark:from-[#0f0f0f]" />
                </div>
              </div>
            </div>

            {/* Interactive Fleet Component */}
            <div className="mt-8">
              <InteractiveFleet initialCars={featuredCars} categories={categories} />
            </div>

          </section>

          {/* Right Sidebar (Advantages) */}
          <aside className="w-full xl:w-[280px] shrink-0 space-y-4">
            
            <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-colors">
              <div className="text-red-500">
                <ShieldCheck className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Versicherte Fahrzeuge</h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">Vollkasko & Insassenschutz</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-colors">
              <div className="text-red-500">
                <Phone className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">24/7 Support</h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">Wir sind jederzeit für Sie da</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-colors">
              <div className="text-red-500">
                <CheckCircle className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Schnelle Buchung</h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">In nur wenigen Schritten</p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 group hover:border-red-500/30 transition-colors">
              <div className="text-red-500">
                <Tag className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Faire Preise</h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">Transparente & keine versteckten Kosten</p>
              </div>
            </div>

          </aside>
        </div>

        {/* Bottom Trust Badges */}
        <div className="mt-16 bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-white/5 rounded-2xl p-8 transition-colors">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-white/5">
            <div className="flex items-center gap-4 px-4">
              <Car className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">20+ Fahrzeuge</h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500">Für jeden Bedarf das Richtige</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4">
              <MapPin className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Im ganzen Ländle</h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500">Für Sie in Vorarlberg</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4">
              <Heart className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Beste Bewertungen</h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500">4,9/5 Sterne von Kunden</p>
              </div>
            </div>
            <div className="flex items-center gap-4 px-4">
              <Calendar className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Flexible Mietdauer</h4>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500">Täglich, wöchentlich, monatlich</p>
              </div>
            </div>
          </div>
        </div>

        <HowItWorks />
      </main>

      <FaqAccordion />
      <NewsletterCta />
      <Footer />
    </div>
  );
}
