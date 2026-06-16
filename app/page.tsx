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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-red-500/30 font-sans overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-red-600/10 blur-[120px] opacity-60 mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-orange-600/5 blur-[100px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-red-900/10 blur-[150px] opacity-50 mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main>
          {/* HERO SECTION */}
          <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto min-h-[90vh] flex flex-col justify-center">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Typography & Intro */}
              <div className="lg:col-span-7 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Premium Autovermietung in Vorarlberg</span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600 leading-[0.9]">
                  Fahren Sie <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Ohne Limits.</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-zinc-400 font-medium leading-relaxed max-w-2xl">
                  Erleben Sie die perfekte Kombination aus Leistung, Komfort und erstklassigem Service. Wählen Sie Ihr Wunschfahrzeug aus unserer exklusiven Flotte.
                </p>

                {/* Features inline */}
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                    <ShieldCheck className="w-5 h-5 text-red-500" /> Vollkaskoschutz
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                    <Clock className="w-5 h-5 text-red-500" /> 24/7 Support
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                    <Star className="w-5 h-5 text-red-500" /> Keine versteckten Kosten
                  </div>
                </div>
              </div>

              {/* Right Column: Glassmorphism Search Box */}
              <div className="lg:col-span-5 relative group">
                {/* Glow effect behind the card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
                
                <div className="relative bg-[#111111]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                  <h3 className="text-lg font-black uppercase tracking-wide text-white mb-8 flex items-center gap-3">
                    <span className="p-2.5 bg-red-500/20 rounded-xl text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <Search className="w-5 h-5" />
                    </span>
                    Fahrzeug Finden
                  </h3>

                  <div className="space-y-5">
                    {/* Location */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Abholort</label>
                      <div className="relative group/input">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500 transition-transform group-focus-within/input:scale-110" />
                        <div className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-extrabold text-sm uppercase tracking-wider select-none shadow-inner">
                          Feldkirch HQ
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Pickup Date */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Abholdatum</label>
                        <div className="relative group/input">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-colors group-focus-within/input:text-red-500 pointer-events-none" />
                          <input
                            type="date"
                            defaultValue={todayStr}
                            min={todayStr}
                            className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-11 pr-3 text-white outline-none focus:border-red-500/50 focus:bg-red-500/5 transition-all font-extrabold text-[11px] uppercase tracking-wider [color-scheme:dark] shadow-inner"
                          />
                        </div>
                      </div>

                      {/* Return Date */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Rückgabe</label>
                        <div className="relative group/input">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-colors group-focus-within/input:text-red-500 pointer-events-none" />
                          <input
                            type="date"
                            defaultValue={tomorrowStr}
                            min={todayStr}
                            className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-11 pr-3 text-white outline-none focus:border-red-500/50 focus:bg-red-500/5 transition-all font-extrabold text-[11px] uppercase tracking-wider [color-scheme:dark] shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Type */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Kategorie</label>
                      <div className="relative group/input">
                        <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-colors group-focus-within/input:text-red-500 pointer-events-none" />
                        <select className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-red-500/50 focus:bg-red-500/5 transition-all font-extrabold text-sm uppercase tracking-wider appearance-none cursor-pointer shadow-inner">
                          <option>Alle Kategorien</option>
                          <option>Sportwagen</option>
                          <option>SUVs</option>
                          <option>Limousinen</option>
                          <option>Transporter</option>
                        </select>
                      </div>
                    </div>

                    {/* Search CTA */}
                    <Link
                      href="/fleet"
                      className="group/btn relative flex items-center justify-center gap-3 w-full py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] active:scale-[0.98] mt-8 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)] translate-x-[-150%] group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                      <span className="relative z-10">Flotte Entdecken</span>
                      <ArrowRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Trust Badges Marquee / Stats */}
          <section className="relative z-10 py-10 border-y border-white/5 bg-black/40 backdrop-blur-md">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 divide-x divide-white/5">
                <div className="text-center px-4 hover:-translate-y-1 transition-transform duration-300">
                  <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-2">20+</span>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Premium Fahrzeuge</span>
                </div>
                <div className="text-center px-4 hover:-translate-y-1 transition-transform duration-300">
                  <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-2">24/7</span>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Erreichbarkeit</span>
                </div>
                <div className="text-center px-4 hover:-translate-y-1 transition-transform duration-300">
                  <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-2">4.9/5</span>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Kunden-Bewertungen</span>
                </div>
                <div className="text-center px-4 hover:-translate-y-1 transition-transform duration-300">
                  <span className="block text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-2">100%</span>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Digitaler Prozess</span>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Fleet Section */}
          <section className="py-24 relative z-10">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <span className="inline-block text-[10px] font-black px-3 py-1 bg-red-500/10 text-red-500 rounded-full uppercase tracking-widest border border-red-500/20">Unsere Flotte</span>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
                  Exklusive Modelle
                </h2>
                <p className="text-zinc-400 font-medium leading-relaxed">
                  Entdecken Sie unsere handverlesene Auswahl an Premium-Fahrzeugen, die darauf warten, von Ihnen gefahren zu werden.
                </p>
              </div>

              <div className="relative">
                {/* Subdued glow behind fleet */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-red-900/10 blur-[120px] rounded-full pointer-events-none"></div>
                <InteractiveFleet initialCars={featuredCars} />
              </div>
            </div>
          </section>

          {/* Testimonial slider Section */}
          <section className="relative z-10 border-t border-white/5 bg-gradient-to-b from-transparent to-[#0A0A0A]">
            <Testimonials />
          </section>

        </main>

        <Footer />
      </div>
    </div>
  );
}
