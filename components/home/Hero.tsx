"use client";

import { Calendar, MapPin, Search } from "lucide-react";
import Link from "next/link";

export default function Hero() {
    return (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-0 left-0 w-full h-2/3 bg-gradient-to-b from-red-500/10 to-transparent opacity-30" />
                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Premium Autovermietung
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
                            Verleihen Sie Ihrer Reise <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                                Stil
                            </span>
                        </h1>

                        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Ein komfortables, sicheres und unvergessliches Fahrerlebnis mit den neuesten Fahrzeugmodellen.
                            Mieten Sie jetzt das Fahrzeug, das Ihren Bedürfnissen entspricht, und fahren Sie los.
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-center lg:justify-start gap-8 mb-10">
                            <div className="text-center lg:text-left">
                                <p className="text-3xl font-bold text-white">500+</p>
                                <p className="text-sm text-gray-500">Premium Fahrzeuge</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center lg:text-left">
                                <p className="text-3xl font-bold text-white">20k+</p>
                                <p className="text-sm text-gray-500">Zufriedene Kunden</p>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="text-center lg:text-left">
                                <p className="text-3xl font-bold text-white">24/7</p>
                                <p className="text-sm text-gray-500">Live-Support</p>
                            </div>
                        </div>
                    </div>

                    {/* Search Box / Image Placeholder */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none">

                        {/* Search Card */}
                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative">
                            {/* Decorative gradient border */}
                            <div className="absolute inset-0 rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent -z-10" />

                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Search className="w-5 h-5 text-red-500" />
                                Fahrzeug finden
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 ml-1">Abholort</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Stadt oder Flughafen wählen"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors text-base"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400 ml-1">Abholdatum</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="date"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors [&::-webkit-calendar-picker-indicator]:invert text-base"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400 ml-1">Rückgabedatum</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="date"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-colors [&::-webkit-calendar-picker-indicator]:invert text-base"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Link href="/fleet" className="block text-center w-full py-4 mt-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg">
                                    Verfügbare Fahrzeuge anzeigen
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
