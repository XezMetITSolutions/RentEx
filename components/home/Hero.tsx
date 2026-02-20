"use client";

import { Calendar, Car, MapPin, Search, Truck, ArrowRight } from "lucide-react";
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
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-black">
            {/* Modern Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent opacity-40" />
                <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left pt-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/5 text-red-500 dark:text-red-400 text-sm font-semibold mb-8 backdrop-blur-sm shadow-sm hover:bg-red-500/10 transition-colors cursor-default">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 dark:bg-red-500"></span>
                            </span>
                            Premium Autovermietung
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
                            Verleihen Sie Ihrer <br className="hidden lg:block" />
                            Reise <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500 animate-gradient-x">Exzellenz</span>
                        </h1>

                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            Ein komfortables, sicheres und unvergessliches Fahrerlebnis mit den neuesten Fahrzeugmodellen.
                            Mieten Sie jetzt das Fahrzeug, das Ihren Bedürfnissen entspricht.
                        </p>

                        {/* Modernized Stats */}
                        <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-8 mb-12">
                            <div className="group relative p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 backdrop-blur-md hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1">
                                <p className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">20+</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Premium Fahrzeuge</p>
                            </div>

                            <div className="group relative p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 backdrop-blur-md hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1">
                                <p className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">1000+</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Zufriedene Kunden</p>
                            </div>

                            <div className="group relative p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 backdrop-blur-md hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1">
                                <p className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">24/7</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Live-Support</p>
                            </div>
                        </div>
                    </div>

                    {/* Search Box */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-xl">
                        <div className="relative isolate">
                            {/* Glow Effect behind the card */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-[2.5rem] opacity-20 blur-xl transition duration-500 group-hover:opacity-30"></div>

                            <div className="relative bg-white/80 dark:bg-zinc-900/60 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">

                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <Car className="w-32 h-32 rotate-12" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3 relative z-10">
                                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/30 text-white">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    Fahrzeug finden
                                </h3>

                                <div className="space-y-6 relative z-10">
                                    {/* Vehicle Type Selector */}
                                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100/80 dark:bg-black/40 rounded-2xl border border-gray-200/50 dark:border-white/5">
                                        <button
                                            onClick={() => setVehicleType("pkw")}
                                            className={`relative flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold transition-all duration-300 ${vehicleType === "pkw"
                                                ? "bg-white dark:bg-zinc-800 text-red-600 shadow-md transform scale-[1.02] ring-1 ring-black/5"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                }`}
                                        >
                                            <Car className={`w-5 h-5 ${vehicleType === "pkw" ? "text-red-600" : "text-current"}`} />
                                            <span>PKW</span>
                                        </button>
                                        <button
                                            onClick={() => setVehicleType("kastenwagen")}
                                            className={`relative flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold transition-all duration-300 ${vehicleType === "kastenwagen"
                                                ? "bg-white dark:bg-zinc-800 text-red-600 shadow-md transform scale-[1.02] ring-1 ring-black/5"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                }`}
                                        >
                                            <Truck className={`w-5 h-5 ${vehicleType === "kastenwagen" ? "text-red-600" : "text-current"}`} />
                                            <span>Kastenwagen</span>
                                        </button>
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Abholort</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MapPin className="h-5 w-5 text-red-500 group-focus-within:text-red-600 transition-colors" />
                                            </div>
                                            <div className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white font-medium flex items-center shadow-sm">
                                                Feldkirch
                                                <span className="ml-auto text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800">STANDARD</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Abholung</label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors pointer-events-none" />
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
                                                    className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none font-medium dark:[color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Rückgabe</label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors pointer-events-none" />
                                                <input
                                                    type="date"
                                                    value={returnDate}
                                                    min={pickupDate || todayStr}
                                                    onChange={(e) => setReturnDate(e.target.value)}
                                                    className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none font-medium dark:[color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href={handleSearch()}
                                        className="group flex items-center justify-center w-full py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg mt-4"
                                    >
                                        <span>Fahrzeuge anzeigen</span>
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

