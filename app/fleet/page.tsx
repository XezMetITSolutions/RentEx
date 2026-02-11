import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import Image from "next/image";
import Link from "next/link";
import { Fuel, Gauge, Users, Car, Truck } from "lucide-react";
import prisma from "@/lib/prisma";

type VehicleType = "pkw" | "kastenwagen" | "all";

// PKW categories (passenger cars)
const PKW_CATEGORIES = ["Kleinwagen", "Mittelklasse", "SUV", "Limousine", "Kombi", "Sportwagen", "Cabrio"];
// Kastenwagen category (vans)
const VAN_CATEGORIES = ["Van"];

async function getCars(vehicleType?: VehicleType) {
    let categories: string[] = [];

    if (vehicleType === "pkw") {
        categories = PKW_CATEGORIES;
    } else if (vehicleType === "kastenwagen") {
        categories = VAN_CATEGORIES;
    }

    const cars = await prisma.car.findMany({
        where: {
            status: 'Active',
            ...(categories.length > 0 && {
                category: {
                    in: categories
                }
            })
        },
        orderBy: {
            dailyRate: 'asc'
        }
    });

    // Group by model (Brand + Model)
    const grouped = cars.reduce((acc, car) => {
        const key = `${car.brand}-${car.model}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(car);
        return acc;
    }, {} as Record<string, typeof cars>);

    // Select one random car from each group
    const uniqueCars = Object.values(grouped).map(group => {
        const randomIndex = Math.floor(Math.random() * group.length);
        return group[randomIndex];
    });

    // Sort by price
    return uniqueCars.sort((a, b) => Number(a.dailyRate) - Number(b.dailyRate));
}

export default async function FleetPage({
    searchParams,
}: {
    searchParams: { type?: string; pickup?: string; return?: string };
}) {
    const vehicleType = (searchParams.type as VehicleType) || "all";
    const cars = await getCars(vehicleType);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Unsere Fahrzeugflotte</h1>
                    <div className="flex items-center gap-4 mb-4">
                        {vehicleType !== "all" && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                                {vehicleType === "pkw" ? (
                                    <>
                                        <Car className="w-4 h-4" />
                                        <span className="font-medium">PKW Filterung aktiv</span>
                                    </>
                                ) : (
                                    <>
                                        <Truck className="w-4 h-4" />
                                        <span className="font-medium">Kastenwagen Filterung aktiv</span>
                                    </>
                                )}
                                <Link
                                    href="/fleet"
                                    className="ml-2 text-xs underline hover:text-red-300"
                                >
                                    Entfernen
                                </Link>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-400 max-w-2xl text-lg">
                        Wählen Sie aus unserer exklusiven Auswahl an Premium-Fahrzeugen.
                        Vom sportlichen Cabrio bis zum geräumigen SUV – wir haben das passende Auto für Ihre Bedürfnisse.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cars.map((car) => (
                        <div key={car.id} className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden group hover:border-red-500/30 transition-all duration-300">
                            {/* Image Area */}
                            <div className="h-56 bg-zinc-800 relative">
                                {car.imageUrl ? (
                                    <Image
                                        src={car.imageUrl}
                                        alt={`${car.brand} ${car.model}`}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        No Image
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                                            {car.category}
                                        </span>
                                        <h3 className="text-xl font-bold text-white mt-1">{car.brand} {car.model}</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xl font-bold text-white">
                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(car.dailyRate))}
                                        </span>
                                        <span className="text-xs text-gray-500">/Tag</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-t border-white/10 py-4 mb-4">
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <Fuel className="w-4 h-4 text-gray-500" />
                                        <span className="text-xs text-gray-400">{car.fuelType}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-center border-l border-white/10">
                                        <Gauge className="w-4 h-4 text-gray-500" />
                                        <span className="text-xs text-gray-400">{car.transmission}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-center border-l border-white/10">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <span className="text-xs text-gray-400">{car.seats} Personen</span>
                                    </div>
                                </div>

                                <Link
                                    href={`/fleet/${car.id}`}
                                    className="block w-full text-center py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors"
                                >
                                    Details ansehen
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
