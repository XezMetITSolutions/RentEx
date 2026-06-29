'use client';

import { useState } from 'react';
import BookingWidget from "@/components/fleet/BookingWidget";
import {
    Fuel,
    Gauge,
    Users,
    Briefcase,
    CheckCircle2,
    Zap,
    ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PublicCarCalendar from "@/components/fleet/PublicCarCalendar";

interface CarDetailClientProps {
    car: any; // Type to be refined
    options: any[]; // Type to be refined
    featuresList: string[];
}

export default function CarDetailClient({ car, options, featuresList }: CarDetailClientProps) {
    // These start with default values (today/tomorrow) but can be updated by the calendar
    // We lift the state up here so both Calendar and BookingWidget can access/modify it.

    // BUT: BookingWidget currently has its own state. 
    // To properly link them, we need to control BookingWidget's state from here or pass a callback.
    // Let's modify BookingWidget to accept initialDate props OR be controlled.
    // For now, let's pass a key to force re-render or push updates if BookingWidget supports it.
    // Better yet: State is lifted here.

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Default hours 10:00
    today.setHours(10, 0, 0, 0);
    tomorrow.setHours(10, 0, 0, 0);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(formatDate(today));
    const [endDate, setEndDate] = useState(formatDate(tomorrow));

    const handleDateSelect = (start: Date, end: Date) => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const s = new Date(start);
        s.setHours(0, 0, 0, 0);

        if (s < now) return;

        const e = new Date(end);
        e.setHours(0, 0, 0, 0);

        // If just a click (start == end or diff < 24h), let's default to minimum 1 day rental
        if (e.getTime() - s.getTime() < 86400000) {
            e.setDate(s.getDate() + 1);
        }

        setStartDate(formatDate(s));
        setEndDate(formatDate(e));

        // Smooth scroll to booking widget on mobile/if needed
        const widget = document.getElementById('booking-widget');
        if (widget) {
            widget.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <main className="pt-24 pb-20">
            {/* Breadcrumb / Back */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <Link href="/fleet" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm flex items-center gap-2">
                    ← Zurück zur Flotte
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-12">

                    {/* Left Column: Car Info & Details */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Car Header & Image */}
                        <div className="space-y-6">
                            <div>
                                <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold tracking-wider uppercase mb-3">
                                    {car.category}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">{car.brand} {car.model}</h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">{car.description}</p>
                            </div>

                            <div className="aspect-video bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border border-gray-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden group">
                                {/* Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-0 dark:opacity-100" />
                                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-red-500/5 rounded-full blur-3xl" />

                                {car.imageUrl ? (
                                    <Image
                                        src={car.imageUrl}
                                        alt={`${car.brand} ${car.model}`}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="text-zinc-700 font-mono text-xl z-0">
                                        Kein Bild verfügbar
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-red-500" />
                                Technische Daten
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                                    <Fuel className="w-5 h-5 text-gray-500 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Kraftstoff</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{car.fuelType}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                                    <Gauge className="w-5 h-5 text-gray-500 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Getriebe</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{car.transmission}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                                    <Users className="w-5 h-5 text-gray-500 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Sitzplätze</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{car.seats} Personen</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                                    <Briefcase className="w-5 h-5 text-gray-500 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Türen</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{car.doors}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                                    <Zap className="w-5 h-5 text-gray-500 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Leistung</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{car.horsePower} PS</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors">
                                    <Fuel className="w-5 h-5 text-gray-500 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Verbrauch</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{car.fuelConsumption}</p>
                                </div>
                            </div>
                        </div>

                        {/* Availability Calendar */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-red-500" />
                                Verfügbarkeit
                            </h2>
                            <PublicCarCalendar
                                rentals={car.rentals}
                                onDateSelect={handleDateSelect}
                                selectedStart={startDate}
                                selectedEnd={endDate}
                            />
                        </div>

                        {/* Features List */}
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Ausstattungshighlights</h2>
                            <ul className="grid md:grid-cols-2 gap-y-3 gap-x-8">
                                {featuresList.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Mietbedingungen */}
                        <div className="mt-12">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-red-500" />
                                Mietbedingungen
                            </h2>
                            <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-3xl p-6">
                                <div className="divide-y divide-gray-200 dark:divide-white/5">
                                    {car.maxMileagePerDay !== null && (
                                        <div className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                                            <span className="text-gray-600 dark:text-gray-400">Kilometerbegrenzung</span>
                                            <span className="text-gray-900 dark:text-white font-medium">{car.maxMileagePerDay} km / Tag</span>
                                        </div>
                                    )}
                                    {car.extraKmCost !== null && (
                                        <div className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                                            <span className="text-gray-600 dark:text-gray-400">Zusätzliche km</span>
                                            <span className="text-gray-900 dark:text-white font-medium">€{Number(car.extraKmCost).toFixed(2).replace('.', ',')} / km</span>
                                        </div>
                                    )}
                                    {car.fuelPolicy && (
                                        <div className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                                            <span className="text-gray-600 dark:text-gray-400">Tankregelung</span>
                                            <span className="text-gray-900 dark:text-white font-medium">{car.fuelPolicy}</span>
                                        </div>
                                    )}
                                    {car.includedInsurance && (
                                        <div className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                                            <span className="text-gray-600 dark:text-gray-400">Versicherung</span>
                                            <span className="text-red-600 dark:text-red-400 font-medium bg-red-500/10 px-3 py-1 rounded-full text-sm">{car.includedInsurance}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Booking & Extras */}
                    <div className="lg:col-span-1" id="booking-widget">
                        <BookingWidget
                            car={car}
                            options={options}
                            initialStartDate={startDate}
                            initialEndDate={endDate}
                        />
                    </div>

                </div>
            </div>
        </main>
    );
}
