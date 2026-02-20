import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import Image from "next/image";
import Link from "next/link";
import { Fuel, Gauge, Users, Car, Truck } from "lucide-react";
import prisma from "@/lib/prisma";

type VehicleType = "pkw" | "kastenwagen" | "all";

// PKW categories (passenger cars)
const PKW_CATEGORIES = ["Kleinwagen", "Mittelklasse", "SUV", "Limousine", "Kombi", "Sportwagen", "Cabrio"];
// Kastenwagen/Van categories
const VAN_CATEGORIES = ["Van", "Kastenwagen", "Bus"];

async function getCars(vehicleType?: VehicleType, pickupDate?: string, returnDate?: string) {
    let categories: string[] = [];

    if (vehicleType === "pkw") {
        categories = PKW_CATEGORIES;
    } else if (vehicleType === "kastenwagen") {
        categories = VAN_CATEGORIES;
    }

    // Prepare availability filter if dates are provided
    let excludedCarIds: number[] = [];
    if (pickupDate && returnDate) {
        try {
            const start = new Date(pickupDate);
            const end = new Date(returnDate);

            // Validate dates
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                // Find rentals that overlap with the selected period
                const overlappingRentals = await prisma.rental.findMany({
                    where: {
                        status: {
                            in: ['Active', 'Pending']
                        },
                        OR: [
                            {
                                // Rental starts during our period
                                startDate: {
                                    gte: start,
                                    lte: end
                                }
                            },
                            {
                                // Rental ends during our period
                                endDate: {
                                    gte: start,
                                    lte: end
                                }
                            },
                            {
                                // Rental covers our entire period
                                startDate: {
                                    lte: start
                                },
                                endDate: {
                                    gte: end
                                }
                            }
                        ]
                    },
                    select: {
                        carId: true
                    }
                });

                excludedCarIds = overlappingRentals.map(r => r.carId).filter(id => id != null);
            }
        } catch (error) {
            console.error("Error fetching overlapping rentals:", error);
            // Non-critical: continue without exclusion if this fails
        }
    }

    const cars = await prisma.car.findMany({
        where: {
            status: 'Active',
            isActive: true, // Only show active cars in fleet
            ...(excludedCarIds.length > 0 && {
                id: {
                    notIn: excludedCarIds
                }
            }),
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
    return uniqueCars.sort((a, b) => (Number(a.dailyRate) || 0) - (Number(b.dailyRate) || 0));
}

export default async function FleetPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string | string[]; pickup?: string | string[]; return?: string | string[] }>;
}) {
    try {
        const resolvedSearchParams = await searchParams;

        // Helper to get string from potentially array search param
        const getSingleParam = (param: string | string[] | undefined) =>
            Array.isArray(param) ? param[0] : param;

        const typeParam = getSingleParam(resolvedSearchParams.type);
        const vehicleType = (typeParam as VehicleType) || "all";

        const pickupParam = getSingleParam(resolvedSearchParams.pickup);
        const returnParam = getSingleParam(resolvedSearchParams.return);

        const cars = await getCars(vehicleType, pickupParam, returnParam);

        return (
            <div className="min-h-screen bg-background text-foreground selection:bg-red-500/30">
                <Navbar />

                <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Unsere Fahrzeugflotte</h1>
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
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg">
                            Wählen Sie aus unserer exklusiven Auswahl an Premium-Fahrzeugen.
                            Vom sportlichen Cabrio bis zum geräumigen SUV – wir haben das passende Auto für Ihre Bedürfnisse.
                        </p>
                    </div>

                    {cars.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Keine Fahrzeuge gefunden</h3>
                            <p className="text-gray-500">Für den gewählten Zeitraum oder Filter sind derzeit keine Fahrzeuge verfügbar.</p>
                            <Link href="/fleet" className="inline-block mt-6 text-red-500 hover:underline">
                                Alle Fahrzeuge anzeigen
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {cars.map((car) => (
                                <Link key={car.id} href={`/fleet/${car.id}`} className="block bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden group hover:border-red-500/30 transition-all duration-300">
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
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{car.brand} {car.model}</h3>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xl font-bold text-gray-900 dark:text-white">
                                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(car.dailyRate))}
                                                </span>
                                                <span className="text-xs text-gray-500">/Tag</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 border-t border-gray-200 dark:border-white/10 py-4 mb-4">
                                            <div className="flex flex-col items-center gap-1 text-center">
                                                <Fuel className="w-4 h-4 text-gray-500" />
                                                <span className="text-xs text-gray-400">{car.fuelType}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 text-center border-l border-gray-200 dark:border-white/10">
                                                <Gauge className="w-4 h-4 text-gray-500" />
                                                <span className="text-xs text-gray-400">{car.transmission}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 text-center border-l border-gray-200 dark:border-white/10">
                                                <Users className="w-4 h-4 text-gray-500" />
                                                <span className="text-xs text-gray-400">{car.seats} Personen</span>
                                            </div>
                                        </div>

                                        <div
                                            className="block w-full text-center py-3 bg-gray-200/50 dark:bg-white/5 group-hover:bg-gray-200 dark:group-hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-medium transition-colors"
                                        >
                                            Details ansehen
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>

                <Footer />
            </div>
        );
    } catch (error) {
        console.error("Error rendering FleetPage:", error);
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-500/20">
                        <Car className="w-12 h-12 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold">Ups! Ein Fehler ist aufgetreten.</h1>
                        <p className="mt-2 opacity-80">Wir konnten die Fahrzeugliste momentan nicht laden. Bitte versuchen Sie es in Kürze erneut.</p>
                    </div>
                    <Link href="/" className="inline-block px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:scale-[1.02] transition-all">
                        Zurück zur Startseite
                    </Link>
                </div>
            </div>
        );
    }
}
