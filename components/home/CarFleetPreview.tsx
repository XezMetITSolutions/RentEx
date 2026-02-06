import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Fuel, Gauge, Users } from "lucide-react";
import prisma from "@/lib/prisma";

async function getFeaturedCars() {
    const cars = await prisma.car.findMany({
        where: {
            status: 'Active'
        },
        take: 3,
        orderBy: {
            dailyRate: 'asc'
        }
    });
    return cars;
}

export default async function CarFleetPreview() {
    const featuredCars = await getFeaturedCars();

    return (
        <div className="py-24 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] translate-x-1/2" />


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Vorgestellte Fahrzeuge
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-xl">
                            Entdecken Sie die beliebtesten Modelle unserer Flotte.
                        </p>
                    </div>
                    <Link
                        href="/fleet"
                        className="group flex items-center gap-2 text-red-500 font-semibold hover:text-red-400 transition-colors"
                    >
                        Ganze Flotte ansehen
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 snap-x snap-mandatory sm:snap-none hide-scrollbar">
                    {featuredCars.map((car) => (
                        <div key={car.id} className="min-w-[85vw] sm:min-w-0 snap-center flex-shrink-0 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden group hover:border-red-500/30 transition-all duration-300">
                            {/* Image Area - Placeholder if no image */}
                            <div className="h-48 sm:h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center relative overflow-hidden p-6">
                                {car.imageUrl ? (
                                    <Image src={car.imageUrl} alt={`${car.brand} ${car.model}`} fill className="object-contain p-4" />
                                ) : (
                                    <div className="text-zinc-600 text-sm font-mono">Kein Bild verfügbar</div>
                                )}
                            </div>

                            <div className="p-5 sm:p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                                            {car.category}
                                        </span>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-1">{car.brand} {car.model}</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(car.dailyRate))}
                                        </span>
                                        <span className="text-xs text-gray-500">/Tag</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-gray-200 dark:border-white/10 py-4 mb-4">
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <Fuel className="w-4 h-4 text-gray-500" />
                                        <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{car.fuelType}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-center border-l border-gray-200 dark:border-white/10">
                                        <Gauge className="w-4 h-4 text-gray-500" />
                                        <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{car.transmission}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-center border-l border-gray-200 dark:border-white/10">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{car.seats} Pers.</span>
                                    </div>
                                </div>

                                <Link
                                    href={`/fleet/${car.id}`}
                                    className="block w-full text-center py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-medium transition-colors active:scale-95"
                                >
                                    Details ansehen
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
