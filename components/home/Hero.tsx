"use client";

import { Calendar, Car, MapPin, Search, Truck, ArrowRight, ShieldCheck, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type VehicleType = "pkw" | "kastenwagen";

export default function Hero() {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const [vehicleType, setVehicleType] = useState<VehicleType>("pkw");
    const [pickupDate, setPickupDate] = useState(todayStr);
    const [returnDate, setReturnDate] = useState(tomorrowStr);

    const handleSearch = () => {
        const params = new URLSearchParams({
            type: vehicleType,
            ...(pickupDate && { pickup: pickupDate }),
            ...(returnDate && { return: returnDate }),
        });
        return `/fleet?${params.toString()}`;
    };

    return (
        <div className="relative min-h-screen pt-32 pb-20 flex flex-col justify-between bg-[#0A0A0A] overflow-hidden">
            {/* High-End Background Glowing Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none">
                {/* Premium Red Glow */}
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-red-600/10 rounded-full blur-[150px] animate-pulse-slow" />
                {/* Subtle Amber Glow */}
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[130px]" />
                {/* Tech Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Editorial Text Content */}
                    <div className="lg:col-span-7 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/5 text-red-500 text-xs font-bold uppercase tracking-widest mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                            </span>
                            Premium Autovermietung
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight text-white mb-6 uppercase leading-none">
                            FINDEN SIE IHR <br />
                            PERFEKTES <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500">FAHRZEUG</span>
                        </h1>

                        <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            Premium Fahrzeuge. Exzellenter Service. Beste Preise. Erleben Sie die absolute Fahrfreude mit unserer exklusiven Mietflotte in Vorarlberg.
                        </p>

                        {/* High-Trust Inline Features */}
                        <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5 max-w-lg mx-auto lg:mx-0">
                            <div className="flex flex-col gap-2">
                                <span className="text-2xl font-black text-white">20+</span>
                                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Premium Modelle</span>
                            </div>
                            <div className="flex flex-col gap-2 border-l border-white/5 pl-6">
                                <span className="text-2xl font-black text-white">24/7</span>
                                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Kunden Support</span>
                            </div>
                            <div className="flex flex-col gap-2 border-l border-white/5 pl-6">
                                <span className="text-2xl font-black text-white">100%</span>
                                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Zufriedenheit</span>
                            </div>
                        </div>
                    </div>

                    {/* Luxury Car Highlight Visual (Porsche/BMW Vibe) */}
                    <div className="lg:col-span-5 relative w-full h-[300px] sm:h-[400px] lg:h-[450px] flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-orange-500/10 rounded-full blur-[80px] pointer-events-none scale-75" />
                        <img 
                            src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1200" 
                            alt="Luxury Car Showcase" 
                            className="object-contain max-h-[85%] max-w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] filter brightness-95 contrast-105"
                        />
                    </div>
                </div>

                {/* Horizontal Search Panel (Desktop) & Responsive Card (Mobile) */}
                <div className="mt-16 relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-500 rounded-[2rem] opacity-20 blur-xl"></div>
                    <div className="relative bg-[#141414]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl">
                        
                        <div className="flex flex-col xl:flex-row gap-6 items-end justify-between">
                            
                            {/* Type Selection */}
                            <div className="w-full xl:w-auto space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Kategorie</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-black/55 rounded-xl border border-white/5 w-full xl:w-[280px]">
                                    <button
                                        onClick={() => setVehicleType("pkw")}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${vehicleType === "pkw"
                                            ? "bg-[#1C1C1C] text-red-500 shadow-md border border-white/5"
                                            : "text-zinc-400 hover:text-white"
                                            }`}
                                    >
                                        <Car className="w-3.5 h-3.5" />
                                        <span>PKW</span>
                                    </button>
                                    <button
                                        onClick={() => setVehicleType("kastenwagen")}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-300 ${vehicleType === "kastenwagen"
                                            ? "bg-[#1C1C1C] text-red-500 shadow-md border border-white/5"
                                            : "text-zinc-400 hover:text-white"
                                            }`}
                                    >
                                        <Truck className="w-3.5 h-3.5" />
                                        <span>Transporter</span>
                                    </button>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="w-full xl:w-auto flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Abhol- & Rückgabeort</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                        <div className="w-full bg-black/30 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white font-bold text-xs uppercase tracking-wider select-none">
                                            Feldkirch Hauptsitz
                                        </div>
                                    </div>
                                </div>

                                {/* Pickup Date */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Abholdatum</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-red-500 transition-colors pointer-events-none" />
                                        <input
                                            type="date"
                                            value={pickupDate}
                                            min={todayStr}
                                            onChange={(e) => {
                                                const newVal = e.target.value;
                                                setPickupDate(newVal);
                                                if (returnDate < newVal) {
                                                    setReturnDate(newVal);
                                                }
                                            }}
                                            className="w-full bg-black/30 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none font-bold text-xs uppercase tracking-wider [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                {/* Return Date */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Rückgabedatum</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-red-500 transition-colors pointer-events-none" />
                                        <input
                                            type="date"
                                            value={returnDate}
                                            min={pickupDate || todayStr}
                                            onChange={(e) => setReturnDate(e.target.value)}
                                            className="w-full bg-black/30 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all outline-none font-bold text-xs uppercase tracking-wider [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Search Button */}
                            <div className="w-full xl:w-auto">
                                <Link
                                    href={handleSearch()}
                                    className="flex items-center justify-center gap-2 w-full xl:w-auto px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98]"
                                >
                                    <span>Fahrzeug Finden</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Premium Trust Elements Bar */}
            <div className="border-y border-white/5 bg-black/40 backdrop-blur-md py-8 mt-12 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-red-500">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Vollkasko Inklusive</h4>
                                <p className="text-xs text-zinc-500 mt-0.5">Sorgenfreie Fahrt garantiert</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-red-500">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Flexible Miete</h4>
                                <p className="text-xs text-zinc-500 mt-0.5">Stundenweise oder monatlich</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-red-500">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Top-Zustand</h4>
                                <p className="text-xs text-zinc-500 mt-0.5">Geprüfte, neuwertige Flotte</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-red-500">
                                <Car className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">Standort Feldkirch</h4>
                                <p className="text-xs text-zinc-500 mt-0.5">Schnelle Abholung & Rückgabe</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
