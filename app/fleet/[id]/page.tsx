import { notFound } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import {
    Fuel,
    Gauge,
    Users,
    Briefcase,
    CheckCircle2,
    ShieldCheck,
    Zap,
    Snowflake,
    Navigation,
    Baby
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

async function getCar(id: number) {
    const car = await prisma.car.findUnique({
        where: { id: id }
    });
    return car;
}

async function getOptions() {
    const options = await prisma.option.findMany({
        where: { status: 'active' }
    });
    return options;
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const carId = parseInt(resolvedParams.id);

    if (isNaN(carId)) {
        notFound();
    }

    const [car, options] = await Promise.all([
        getCar(carId),
        getOptions()
    ]);

    if (!car) {
        notFound();
    }

    // Parse features from CSV string
    const featuresList = car.features ? car.features.split(',').map(f => f.trim()) : [];

    // Map DB options to UI format (simulated icons for categories)
    const getOptionIcon = (type: string | null) => {
        switch (type) {
            case 'insurance': return ShieldCheck;
            case 'driver': return Users;
            case 'equipment': return Baby; // Proxy for generic equipment
            default: return Zap;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <main className="pt-24 pb-20">
                {/* Breadcrumb / Back */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                    <Link href="/fleet" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
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
                                    <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider uppercase mb-3">
                                        {car.category}
                                    </span>
                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{car.brand} {car.model}</h1>
                                    <p className="text-gray-400 text-lg leading-relaxed">{car.description}</p>
                                </div>

                                <div className="aspect-video bg-zinc-900/50 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                                    {/* Background Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
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
                                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-red-500" />
                                    Technische Daten
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <Fuel className="w-5 h-5 text-gray-500 mb-2" />
                                        <p className="text-sm text-gray-400">Kraftstoff</p>
                                        <p className="font-semibold text-white">{car.fuelType}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <Gauge className="w-5 h-5 text-gray-500 mb-2" />
                                        <p className="text-sm text-gray-400">Getriebe</p>
                                        <p className="font-semibold text-white">{car.transmission}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <Users className="w-5 h-5 text-gray-500 mb-2" />
                                        <p className="text-sm text-gray-400">Sitzplätze</p>
                                        <p className="font-semibold text-white">{car.seats} Personen</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <Briefcase className="w-5 h-5 text-gray-500 mb-2" />
                                        <p className="text-sm text-gray-400">Türen</p>
                                        <p className="font-semibold text-white">{car.doors}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <Zap className="w-5 h-5 text-gray-500 mb-2" />
                                        <p className="text-sm text-gray-400">Leistung</p>
                                        <p className="font-semibold text-white">{car.horsePower} PS</p>
                                    </div>
                                    {/* Consumption */}
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <Fuel className="w-5 h-5 text-gray-500 mb-2" />
                                        <p className="text-sm text-gray-400">Verbrauch</p>
                                        <p className="font-semibold text-white">{car.fuelConsumption}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features List */}
                            <div>
                                <h2 className="text-2xl font-semibold text-white mb-6">Ausstattungshighlights</h2>
                                <ul className="grid md:grid-cols-2 gap-y-3 gap-x-8">
                                    {featuresList.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-gray-300">
                                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>

                        {/* Right Column: Booking & Extras */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">

                                {/* Price Card */}
                                <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
                                    <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-6">
                                        <div>
                                            <p className="text-gray-400 text-sm">Tagespreis ab</p>
                                            <p className="text-4xl font-bold text-white">
                                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(car.dailyRate))}
                                            </p>
                                        </div>
                                        <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs font-semibold">
                                            Verfügbar
                                        </span>
                                    </div>

                                    {/* Date Selection Placeholder (Simple) */}
                                    <div className="space-y-4 mb-6">
                                        <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                                            <label className="text-xs text-gray-500 uppercase font-semibold">Abholung</label>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-white">Heute</span>
                                                <span className="text-gray-400">10:00</span>
                                            </div>
                                        </div>
                                        <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                                            <label className="text-xs text-gray-500 uppercase font-semibold">Rückgabe</label>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-white">Morgen</span>
                                                <span className="text-gray-400">10:00</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]">
                                        Jetzt Reservieren
                                    </button>
                                    <p className="text-center text-xs text-gray-500 mt-3">
                                        Keine Kreditkarte für Reservierung erforderlich
                                    </p>
                                </div>

                                {/* Extras Selection */}
                                <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Zusatzpakete</h3>
                                    <div className="space-y-3">
                                        {options.map((option) => {
                                            const Icon = getOptionIcon(option.type);
                                            return (
                                                <label key={option.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                                                    <input type="checkbox" className="mt-1" />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-medium text-white flex items-center gap-2">
                                                                <Icon className="w-4 h-4 text-gray-500" />
                                                                {option.name}
                                                            </span>
                                                            <span className="text-sm font-semibold text-gray-300">
                                                                +{Number(option.price)}€
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
