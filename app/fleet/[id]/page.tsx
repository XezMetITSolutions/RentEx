import { notFound } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import BookingWidget from "@/components/fleet/BookingWidget";
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

    const [car, rawOptions] = await Promise.all([
        getCar(carId),
        getOptions()
    ]);

    const options = rawOptions.map(opt => ({
        ...opt,
        price: Number(opt.price)
    }));

    if (!car) {
        notFound();
    }

    // Parse features from CSV string
    const featuresList = car.features ? car.features.split(',').map(f => f.trim()) : [];

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
                            <BookingWidget car={car} options={options} />
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
