import Navbar from "@/components/home/Navbar";
export const dynamic = 'force-dynamic';
import Footer from "@/components/home/Footer";
import Link from "next/link";
import { ArrowRight, Car, ChevronDown } from "lucide-react";
import prisma from "@/lib/prisma";
import FleetSidebar from "@/components/fleet/FleetSidebar";
import CarCard, { type CarCardData } from "@/components/fleet/CarCard";
import { hmFontVariables } from "@/lib/hmFonts";
import { carPhoto, carSlug } from "@/lib/carPhotos";

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

    // Select the first car from each group deterministically
    const uniqueCars = Object.values(grouped).map(group => group[0]);

    // Sort by price
    return uniqueCars.sort((a, b) => (Number(a.dailyRate) || 0) - (Number(b.dailyRate) || 0));
}

type FleetSearchParams = {
    type?: string | string[];
    pickup?: string | string[];
    return?: string | string[];
    category?: string | string[];
    brand?: string | string[];
    transmission?: string | string[];
    fuelType?: string | string[];
};

async function loadFleetData(resolvedSearchParams: FleetSearchParams) {
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

    const [carsRaw, allCarsRaw, allCategoriesRaw] = await Promise.all([
        getCars({
            vehicleType,
            pickupDate: pickupParam,
            returnDate: returnParam,
            category: categoryParam,
            brand: brandParam,
            transmission: transParam,
            fuelType: fuelParam
        }),
        // Unfiltered list: drives the filter options and their counts.
        getCars({}),
        prisma.carCategory.findMany({ orderBy: { sortOrder: 'asc' }, select: { name: true } }),
    ]);

    const toCard = (car: (typeof carsRaw)[number]): CarCardData => ({
        id: car.id,
        brand: car.brand,
        model: car.model,
        imageUrl: carPhoto(car.brand, car.model, car.imageUrl),
        dailyRate: Number(car.dailyRate),
        fuelType: car.fuelType,
        transmission: car.transmission,
        seats: car.seats,
        category: car.category,
        hasAirConditioning: car.hasAirConditioning,
    });
    const cars = carsRaw.map(toCard);

    const countBy = (pick: (car: (typeof allCarsRaw)[number]) => string | null) => {
        const counts = new Map<string, number>();
        for (const car of allCarsRaw) {
            const key = pick(car);
            if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return counts;
    };
    const categoryCounts = countBy((car) => car.category);
    const categoryOptions = allCategoriesRaw
        .filter((c) => categoryCounts.has(c.name))
        .map((c) => ({ value: c.name, count: categoryCounts.get(c.name)! }));
    const transmissionOptions = [...countBy((car) => car.transmission)].map(([value, count]) => ({ value, count }));
    const fuelOptions = [...countBy((car) => car.fuelType)].map(([value, count]) => ({ value, count }));

    const hasDates = Boolean(pickupParam && returnParam);
    const formatDate = (value?: string) =>
        value ? new Date(value).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    return { vehicleType, pickupParam, returnParam, categoryParam, brandParam, transParam, fuelParam, cars, categoryOptions, transmissionOptions, fuelOptions, hasDates, formatDate, todayStr, tomorrowStr };
}

function FleetError() {
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

/* Hallmark · genre: modern-minimal · macrostructure: Catalogue (filterable) · theme: custom (brand red) · design-system: tokens.css · shares homepage stage + CarCard
 * pre-emit critique: P4 H5 E4 S5 R4 V4
 */
export default async function FleetPage({ searchParams }: { searchParams: Promise<FleetSearchParams> }) {
    let data: Awaited<ReturnType<typeof loadFleetData>> | null = null;
    try {
        data = await loadFleetData(await searchParams);
    } catch (error) {
        console.error("Error rendering FleetPage:", error);
    }
    if (!data) return <FleetError />;
    const { vehicleType, pickupParam, returnParam, categoryParam, brandParam, transParam, fuelParam, cars, categoryOptions, transmissionOptions, fuelOptions, hasDates, formatDate, todayStr, tomorrowStr } = data;

    const fieldClass =
        "w-full min-h-12 bg-transparent px-0 pt-0.5 text-[15px] font-semibold text-hm-ink outline-none dark:[color-scheme:dark]";
    const labelClass = "block font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted";
    const cellClass =
        "min-w-0 rounded-[var(--hm-radius-input)] px-4 pt-3 pb-1 hover:bg-hm-paper-2 focus-within:bg-hm-paper-2 transition-[background-color] duration-[var(--hm-dur-short)] ease-hm-out";

    return (
        <div className={`${hmFontVariables} hm-home min-h-screen bg-hm-paper text-hm-ink font-hm-body selection:bg-hm-accent/25`}>
            <Navbar />

            <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-10 max-w-[1480px] mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="hm-display text-[length:var(--hm-text-display-s)] font-[800] leading-[0.92]">
                            Unsere Fahrzeuge<span className="text-hm-accent">.</span>
                        </h1>
                        <p className="hm-tnum mt-3 text-hm-ink-2">
                            {hasDates ? (
                                <>{cars.length} {cars.length === 1 ? "Modell" : "Modelle"} frei vom {formatDate(pickupParam)} bis {formatDate(returnParam)}</>
                            ) : (
                                <>{cars.length} {cars.length === 1 ? "Modell" : "Modelle"} · Abholung in Feldkirch</>
                            )}
                        </p>
                    </div>
                </div>

                {/* Booking bar — keeps the other active filters */}
                <form
                    // Remount when filters change so the uncontrolled fields show the active values.
                    key={[pickupParam, returnParam, categoryParam, vehicleType, brandParam, transParam, fuelParam].join("|")}
                    action="/fleet"
                    method="get"
                    aria-label="Zeitraum wählen"
                    className="hm-float mt-8 rounded-[calc(var(--hm-radius-input)+8px)] bg-hm-paper border border-hm-rule p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] gap-1"
                >
                    {vehicleType !== "all" && <input type="hidden" name="type" value={vehicleType} />}
                    {brandParam && <input type="hidden" name="brand" value={brandParam} />}
                    {transParam && <input type="hidden" name="transmission" value={transParam} />}
                    {fuelParam && <input type="hidden" name="fuelType" value={fuelParam} />}
                    <div className={cellClass}>
                        <label htmlFor="fl-pickup" className={labelClass}>Abholung</label>
                        <input id="fl-pickup" name="pickup" type="date" defaultValue={pickupParam || todayStr} min={todayStr} className={fieldClass} />
                    </div>
                    <div className={cellClass}>
                        <label htmlFor="fl-return" className={labelClass}>Rückgabe</label>
                        <input id="fl-return" name="return" type="date" defaultValue={returnParam || tomorrowStr} min={todayStr} className={fieldClass} />
                    </div>
                    <div className={`${cellClass} sm:col-span-2 lg:col-span-1`}>
                        <label htmlFor="fl-category" className={labelClass}>Fahrzeugklasse</label>
                        <div className="relative">
                            <select id="fl-category" name="category" defaultValue={categoryParam || ""} className={`${fieldClass} appearance-none pr-8 cursor-pointer`}>
                                <option value="">Alle Klassen</option>
                                {categoryOptions.map((c) => (
                                    <option key={c.value} value={c.value}>{c.value}</option>
                                ))}
                            </select>
                            <ChevronDown aria-hidden className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted pointer-events-none" />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="group sm:col-span-2 lg:col-span-1 min-h-14 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover active:translate-y-px px-7 text-hm-accent-ink font-semibold text-[15px] transition-[background-color,transform] duration-[var(--hm-dur-short)] ease-hm-out"
                    >
                        {hasDates ? "Zeitraum ändern" : "Verfügbarkeit prüfen"}
                        <ArrowRight aria-hidden className="w-4 h-4 transition-transform duration-[var(--hm-dur-short)] ease-hm-out group-hover:translate-x-0.5" />
                    </button>
                </form>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-10">
                    <FleetSidebar
                        categories={categoryOptions}
                        transmissions={transmissionOptions}
                        fuelTypes={fuelOptions}
                        activeFilters={{
                            type: vehicleType,
                            category: categoryParam,
                            brand: brandParam,
                            transmission: transParam,
                            fuelType: fuelParam
                        }}
                    />

                    <div className="min-w-0">
                        {cars.length === 0 ? (
                            <div className="hm-stage ring-1 ring-inset ring-hm-rule dark:ring-0 rounded-[var(--hm-radius-card)] px-6 py-20 text-center text-hm-stage-ink">
                                <Car aria-hidden className="mx-auto w-10 h-10 text-hm-stage-muted" />
                                <h2 className="hm-display mt-5 text-3xl font-[750]">Keine passenden Fahrzeuge.</h2>
                                <p className="mx-auto mt-3 max-w-sm text-sm text-hm-stage-muted">
                                    {hasDates
                                        ? "Im gewählten Zeitraum ist mit diesen Filtern nichts frei. Anderen Zeitraum wählen oder Filter lockern."
                                        : "Mit diesen Filtern gibt es kein Fahrzeug. Filter lockern oder alle anzeigen."}
                                </p>
                                <Link
                                    href="/fleet"
                                    className="mt-7 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-[var(--hm-radius-pill)] bg-hm-stage-ink px-5 text-sm font-semibold text-hm-stage hover:bg-hm-accent hover:text-hm-accent-ink transition-[background-color,color] duration-[var(--hm-dur-short)] ease-hm-out"
                                >
                                    Alle Fahrzeuge zeigen
                                </Link>
                            </div>
                        ) : (
                            <ul className="grid grid-cols-1 sm:grid-cols-[repeat(2,minmax(0,1fr))] xl:grid-cols-[repeat(3,minmax(0,1fr))] gap-4">
                                {cars.map((car, i) => (
                                    <li key={car.id}>
                                        <CarCard car={car} priority={i < 3} href={`/fleet/${car.id}/${carSlug(car.brand, car.model)}`} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
