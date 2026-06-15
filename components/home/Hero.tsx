"use client";

import { Calendar, Car, MapPin, Search, Truck, ArrowRight, Star } from "lucide-react";
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
        <div className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden bg-white dark:bg-black transition-colors duration-500">
            {/* Modern Animated Gradient Background Mesh */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-500/10 dark:bg-red-500/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-gradient-to-br from-red-600/15 via-orange-500/10 to-transparent rounded-full blur-[130px] animate-pulse-slow delay-75" />
                <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-blue-500/5 dark:bg-indigo-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left pt-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/5 text-red-500 dark:text-red-400 text-xs sm:text-sm font-semibold mb-8 backdrop-blur-md shadow-sm hover:bg-red-500/10 transition-colors duration-300 cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Premium Autovermietung in Vorarlberg
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 dark:text-white mb-8 leading-[1.05]">
                            Ihre Reise. <br />
                            Unsere <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500">Exzellenz.</span>
                        </h1>

                        <p className="text-lg text-gray-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            Ein komfortables, sicheres und unvergessliches Fahrerlebnis mit den neuesten Fahrzeugmodellen. 
                            Mieten Sie jetzt flexibel das perfekte Auto für Ihren Einsatzzweck.
                        </p>

                        {/* Modernized Floating Stats */}
                        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                            <div className="group relative p-5 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/40 border border-gray-100 dark:border-white/5 backdrop-blur-xl hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1">
                                <p className="text-3xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">20+</p>
                                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-500 mt-2 uppercase tracking-wider">Modelle</p>
                            </div>

                            <div className="group relative p-5 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/40 border border-gray-100 dark:border-white/5 backdrop-blur-xl hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1">
                                <p className="text-3xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">2k+</p>
                                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-500 mt-2 uppercase tracking-wider">Kunden</p>
                            </div>

                            <div className="group relative p-5 rounded-2xl bg-gray-50/50 dark:bg-zinc-900/40 border border-gray-100 dark:border-white/5 backdrop-blur-xl hover:border-red-500/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center gap-1 justify-center lg:justify-start">
                                    <span className="text-3xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">5.0</span>
                                    <Star className="w-5 h-5 fill-amber-400 text-amber-400 -mt-1 hidden sm:block" />
                                </div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-zinc-500 mt-2 uppercase tracking-wider">Bewertung</p>
                            </div>
                        </div>
                    </div>

                    {/* Booking / Search Box */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-xl">
                        <div className="relative">
                            {/* Outer Soft Glow behind the card */}
                            <div className="absolute -inset-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-[2.2rem] opacity-20 blur-2xl dark:opacity-30"></div>

                            <div className="relative bg-white/70 dark:bg-zinc-900/50 backdrop-blur-2xl border border-gray-200/50 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-5 pointer-events-none select-none">
                                    <Car className="w-40 h-40 rotate-12" />
                                </div>

                                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8 flex items-center gap-3 relative z-10">
                                    <span className="flex items-center justify-center p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                                        <Search className="w-5 h-5" />
                                    </span>
                                    Fahrzeug finden
                                </h3>

                                <div className="space-y-6 relative z-10">
                                    {/* Vehicle Type Tab Selector */}
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100/50 dark:bg-black/35 rounded-2xl border border-gray-200/50 dark:border-white/5">
                                        <button
                                            onClick={() => setVehicleType("pkw")}
                                            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold transition-all duration-300 ${vehicleType === "pkw"
                                                ? "bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-md ring-1 ring-black/5"
                                                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                                                }`}
                                        >
                                            <Car className="w-4 h-4" />
                                            <span>PKW</span>
                                        </button>
                                        <button
                                            onClick={() => setVehicleType("kastenwagen")}
                                            className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold transition-all duration-300 ${vehicleType === "kastenwagen"
                                                ? "bg-white dark:bg-zinc-800 text-red-600 dark:text-red-400 shadow-md ring-1 ring-black/5"
                                                : "text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
                                                }`}
                                        >
                                            <Truck className="w-4 h-4" />
                                            <span>Kastenwagen</span>
                                        </button>
                                    </div>

                                    {/* Pickup and Return Locations */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Abholort</label>
                                            <div className="relative group/input">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <MapPin className="h-5 w-5 text-red-500/80 group-focus-within/input:text-red-500 transition-colors" />
                                                </div>
                                                <div className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white font-medium flex items-center shadow-inner text-sm select-none">
                                                    Feldkirch HQ
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Rückgabeort</label>
                                            <div className="relative group/input">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <MapPin className="h-5 w-5 text-red-500/80 group-focus-within/input:text-red-500 transition-colors" />
                                                </div>
                                                <div className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white font-medium flex items-center shadow-inner text-sm select-none">
                                                    Feldkirch HQ
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dates Pickers */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Abholung</label>
                                            <div className="relative group/input">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within/input:text-red-500 transition-colors pointer-events-none" />
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
                                                    className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-gray-950 dark:text-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none font-medium dark:[color-scheme:dark] text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Rückgabe</label>
                                            <div className="relative group/input">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within/input:text-red-500 transition-colors pointer-events-none" />
                                                <input
                                                    type="date"
                                                    value={returnDate}
                                                    min={pickupDate || todayStr}
                                                    onChange={(e) => setReturnDate(e.target.value)}
                                                    className="w-full bg-gray-50/50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-gray-950 dark:text-white focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all outline-none font-medium dark:[color-scheme:dark] text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <Link
                                        href={handleSearch()}
                                        className="group flex items-center justify-center w-full py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-600 text-white font-extrabold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/35 transition-all hover:scale-[1.01] active:scale-[0.99] text-base mt-6"
                                    >
                                        <span>Fahrzeuge anzeigen</span>
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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


