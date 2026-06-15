import Navbar from "@/components/home/Navbar";
import InteractiveFleet from "@/components/home/InteractiveFleet";
import Testimonials from "@/components/home/Testimonials";
import Footer from "@/components/home/Footer";
import { getFeaturedCars } from "@/app/actions";
import { Calendar, Car, MapPin, Search, Truck, ArrowRight, ShieldCheck, Clock, CheckCircle, Phone, Star } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const featuredCars = await getFeaturedCars();

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-red-500/30">
      <Navbar />

      <main className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-12">
            
            {/* Column 1: Left Side Search Box (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-[#141414] border border-white/5 p-6 rounded-3xl shadow-xl">
                <h3 className="text-base font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                  <span className="p-2 bg-red-600/10 rounded-lg text-red-500">
                    <Search className="w-4 h-4" />
                  </span>
                  Fahrzeugsuche
                </h3>

                <div className="space-y-4">
                  {/* Location (Feldkirch HQ) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Abholort</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                      <div className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white font-extrabold text-xs uppercase tracking-wider select-none">
                        Feldkirch HQ
                      </div>
                    </div>
                  </div>

                  {/* Pickup Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Abholdatum</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                      <input
                        type="date"
                        defaultValue={todayStr}
                        min={todayStr}
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white outline-none focus:border-red-505 transition-colors font-extrabold text-xs uppercase tracking-wider [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Return Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Rückgabedatum</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                      <input
                        type="date"
                        defaultValue={tomorrowStr}
                        min={todayStr}
                        className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white outline-none focus:border-red-505 transition-colors font-extrabold text-xs uppercase tracking-wider [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Vehicle Type Selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Fahrzeugtyp</label>
                    <div className="relative">
                      <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                      <select className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white outline-none focus:border-red-505 transition-colors font-extrabold text-xs uppercase tracking-wider appearance-none cursor-pointer">
                        <option>Alle Fahrzeugtypen</option>
                        <option>PKW</option>
                        <option>Transporter</option>
                      </select>
                    </div>
                  </div>

                  {/* Search CTA */}
                  <Link
                    href="/fleet"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 active:scale-[0.98] mt-6"
                  >
                    <span>Fahrzeuge finden</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Assistance contact box */}
              <div className="bg-[#141414] border border-white/5 p-6 rounded-3xl shadow-xl flex items-start gap-4">
                <div className="p-3 bg-red-600/10 rounded-2xl text-red-500">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-zinc-500 uppercase tracking-wider">Benötigen Sie Hilfe?</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">Unser Support-Team ist 24/7 telefonisch erreichbar.</p>
                  <a href="tel:+493012345678" className="block text-sm font-black text-white mt-2 hover:text-red-500 transition-colors">
                    +49 30 123 456 78
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Center Content (6 cols) */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Header Texts */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Sofort Verfügbar</span>
                <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
                  Finden Sie Ihr perfektes Fahrzeug
                </h1>
                <p className="text-sm text-zinc-450 font-medium leading-relaxed">
                  Premium Fahrzeuge. Top Service. Beste Preise. Wählen Sie das passende Modell aus unserer aktuellen Vorarlberg-Flotte.
                </p>
              </div>

              {/* Showcase list with active client-side tabs */}
              <InteractiveFleet initialCars={featuredCars} />

            </div>

            {/* Column 3: Right Side Features list (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              
              <div className="bg-[#141414] border border-white/5 p-6 rounded-3xl hover:border-red-500/20 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-red-600/10 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-white uppercase tracking-wider">Versicherte Fahrzeuge</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Vollkasko- & Insassenschutz inklusive für sorgenfreies Reisen.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#141414] border border-white/5 p-6 rounded-3xl hover:border-red-500/20 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-red-600/10 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-white uppercase tracking-wider">24/7 Live Support</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Wir sind jederzeit für Sie da – Tag und Nacht bei allen Anliegen.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#141414] border border-white/5 p-6 rounded-3xl hover:border-red-500/20 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-red-600/10 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-white uppercase tracking-wider">Schnelle Buchung</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Mieten Sie Ihr Wunschfahrzeug unkompliziert in wenigen Klicks.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#141414] border border-white/5 p-6 rounded-3xl hover:border-red-500/20 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-red-600/10 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-white uppercase tracking-wider">Faire Preise</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">Transparente Tarife ohne versteckte Kosten oder böse Überraschungen.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Trust Badge Row */}
          <div className="border-t border-white/5 pt-12 mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="space-y-1 bg-[#141414] p-6 rounded-2xl border border-white/5">
                <span className="block text-2xl font-black text-white">500+</span>
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fahrzeuge</span>
              </div>
              <div className="space-y-1 bg-[#141414] p-6 rounded-2xl border border-white/5">
                <span className="block text-2xl font-black text-white">Österreich</span>
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Standorte</span>
              </div>
              <div className="space-y-1 bg-[#141414] p-6 rounded-2xl border border-white/5">
                <span className="block text-2xl font-black text-white">4.9/5</span>
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Kunden-Bewertungen</span>
              </div>
              <div className="space-y-1 bg-[#141414] p-6 rounded-2xl border border-white/5">
                <span className="block text-2xl font-black text-white">Flexibel</span>
                <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mietdauer</span>
              </div>
            </div>
          </div>

        </div>

        {/* Testimonial slider Section */}
        <Testimonials />
      </main>

      <Footer />
    </div>
  );
}
