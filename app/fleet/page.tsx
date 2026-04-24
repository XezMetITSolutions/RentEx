import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import Image from "next/image";
import Link from "next/link";
import { Fuel, Gauge, Users, Car, Truck, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import FleetSidebar from "@/components/fleet/FleetSidebar";

type VehicleType = "pkw" | "kastenwagen" | "all";

// PKW categories (passenger cars)
const PKW_CATEGORIES = ["Kleinwagen", "Mittelklasse", "SUV", "Limousine", "Kombi", "Sportwagen", "Cabrio"];
// Kastenwagen/Van categories
const VAN_CATEGORIES = ["Van", "Kastenwagen", "Bus"];

interface FilterParams {
    vehicleType?: VehicleType;
    pickupDate?: string;
    returnDate?: string;
    category?: string;
    brand?: string;
    transmission?: string;
    fuelType?: string;
}

async function getCars(filters: FilterParams) {
    const { vehicleType, pickupDate, returnDate, category, brand, transmission, fuelType } = filters;
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
            isActive: true,
            ...(excludedCarIds.length > 0 && { id: { notIn: excludedCarIds } }),
            ...(categories.length > 0 && { category: { in: categories } }),
            ...(category && { category: category }),
            ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
            ...(transmission && { transmission: transmission }),
            ...(fuelType && { fuelType: fuelType }),
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
    searchParams: Promise<{ 
        type?: string | string[]; 
        pickup?: string | string[]; 
        return?: string | string[]; 
        category?: string | string[];
        brand?: string | string[];
        transmission?: string | string[];
        fuelType?: string | string[];
    }>;
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
        const categoryParam = getSingleParam(resolvedSearchParams.category);
        const brandParam = getSingleParam(resolvedSearchParams.brand);
        const transParam = getSingleParam(resolvedSearchParams.transmission);
        const fuelParam = getSingleParam(resolvedSearchParams.fuelType);

        const cars = await getCars({
            vehicleType,
            pickupDate: pickupParam,
            returnDate: returnParam,
            category: categoryParam,
            brand: brandParam,
            transmission: transParam,
            fuelType: fuelParam
        });

        const allCategories = await prisma.car.findMany({
            where: { isActive: true, status: 'Active' },
            select: { category: true },
            distinct: ['category']
        });

        const brands = await prisma.car.findMany({
            where: { isActive: true, status: 'Active' },
            select: { brand: true },
            distinct: ['brand']
        });

        return (
            <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0A0A0A] text-foreground selection:bg-red-500/30">
                <Navbar />

                <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
                    {/* Header Section */}
                    <div className="relative mb-16">
                        <div className="absolute -left-4 top-0 w-1 h-20 bg-red-600 rounded-full blur-sm" />
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">
                            Premium <span className="text-red-600">Flotte</span>
                        </h1>
                        <p className="text-gray-500 dark:text-zinc-400 max-w-2xl text-lg font-medium leading-relaxed">
                            Entdecken Sie unsere handverlesene Auswahl an erstklassigen Fahrzeugen. 
                            Jedes Auto in unserer Flotte wird höchsten Ansprüchen an Komfort, Sicherheit ve Leistung gerecht.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Sidebar */}
                        <FleetSidebar 
                            categories={allCategories} 
                            brands={brands} 
                            activeFilters={{
                                type: vehicleType,
                                category: categoryParam,
                                brand: brandParam,
                                transmission: transParam,
                                fuelType: fuelParam
                            }}
                        />

                        {/* Content Area */}
                        <div className="flex-1">
                            {cars.length === 0 ? (
                                <div className="text-center py-32 bg-white dark:bg-zinc-900/30 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6">
                                        <Car className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Keine Fahrzeuge gefunden</h3>
                                    <p className="text-gray-500 max-w-sm">Wir konnten keine Fahrzeuge finden, die Ihren Suchkriterien entsprechen. Versuchen Sie es mit anderen Filtern.</p>
                                    <Link href="/fleet" className="mt-8 px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:scale-105 transition-all">
                                        Alle anzeigen
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                                    {cars.map((car) => (
                                        <Link 
                                            key={car.id} 
                                            href={`/fleet/${car.id}`} 
                                            className="group relative bg-white dark:bg-zinc-900/40 border border-gray-200 dark:border-white/10 rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-2 flex flex-col"
                                        >
                                            {/* Badge */}
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="px-4 py-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">
                                                    {car.category}
                                                </span>
                                            </div>

                                            {/* Image Area */}
                                            <div className="h-64 relative overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                                {car.imageUrl ? (
                                                    <Image
                                                        src={car.imageUrl}
                                                        alt={`${car.brand} ${car.model}`}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-sm">
                                                        Kein Bild verfügbar
                                                    </div>
                                                )}
                                                {/* Overlay Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            <div className="p-8 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{car.brand} {car.model}</h3>
                                                        <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-tighter">Premium Rental</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-2xl font-black text-red-600">
                                                            {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(car.dailyRate))}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">pro Tag</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 py-6 border-y border-gray-100 dark:border-white/5 mb-6">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                                                            <Fuel className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{car.fuelType}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-2 border-x border-gray-100 dark:border-white/5">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                                                            <Gauge className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{car.transmission}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                                                            <Users className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{car.seats} Sitze</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto">
                                                    <div className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm uppercase tracking-widest transition-all group-hover:bg-red-600 group-hover:text-white flex items-center justify-center gap-2">
                                                        Details Ansehen
                                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
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
