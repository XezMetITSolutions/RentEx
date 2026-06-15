import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Fuel, Gauge, Users } from "lucide-react";
import { getFeaturedCars } from "@/app/actions";

export default async function CarFleetPreview() {
    const featuredCars = await getFeaturedCars();

    return (
        <div className="py-24 relative overflow-hidden bg-white dark:bg-black transition-colors duration-500">
            {/* Background blobs */}
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm font-semibold tracking-wider uppercase mb-4">
                            Sofort Verfügbar
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">
                            Unsere Premium-Auswahl
                        </h2>
                    </div>
                    <Link
                        href="/fleet"
                        className="group flex items-center gap-2 text-red-500 font-bold hover:text-red-400 transition-colors"
                    >
                        Ganze Flotte ansehen
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 snap-x snap-mandatory sm:snap-none hide-scrollbar">
                    {featuredCars.map((car) => (
                        <Link key={car.id} href={`/fleet/${car.id}`} className="block min-w-[85vw] sm:min-w-0 snap-center flex-shrink-0 bg-gray-50/50 dark:bg-zinc-900/30 border border-gray-200/50 dark:border-white/5 rounded-[2rem] overflow-hidden group hover:border-red-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                            {/* Image Area - Placeholder if no image */}
                            <div className="h-52 sm:h-60 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-900 dark:to-black flex items-center justify-center relative overflow-hidden p-6 border-b border-gray-100 dark:border-white/5">
                                {car.imageUrl ? (
                                    <Image src={car.imageUrl} alt={`${car.brand} ${car.model}`} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="text-zinc-500 text-sm font-mono">Kein Bild verfügbar</div>
                                )}
                            </div>

                            <div className="p-6 sm:p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                                            {car.category}
                                        </span>
                                        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1 group-hover:text-red-500 transition-colors duration-300">{car.brand} {car.model}</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-xl font-black text-gray-900 dark:text-white">
                                            {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(car.dailyRate))}
                                        </span>
                                        <span className="text-xs font-bold text-gray-500">/ Tag</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-gray-200/50 dark:border-white/5 py-5 mb-6">
                                    <div className="flex flex-col items-center gap-1.5 text-center">
                                        <Fuel className="w-4 h-4 text-zinc-400 group-hover:text-red-500 transition-colors" />
                                        <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-zinc-400">{car.fuelType}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 text-center border-l border-gray-200/50 dark:border-white/5">
                                        <Gauge className="w-4 h-4 text-zinc-400 group-hover:text-red-500 transition-colors" />
                                        <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-zinc-400">{car.transmission}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1.5 text-center border-l border-gray-200/50 dark:border-white/5">
                                        <Users className="w-4 h-4 text-zinc-400 group-hover:text-red-500 transition-colors" />
                                        <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-zinc-400">{car.seats} Sitze</span>
                                    </div>
                                </div>

                                <div
                                    className="block w-full text-center py-4 bg-gray-100/80 group-hover:bg-red-500 dark:bg-white/5 dark:group-hover:bg-red-500 border border-gray-250/20 dark:border-white/5 group-hover:border-red-500 rounded-xl text-gray-900 dark:text-white group-hover:text-white font-extrabold transition-all duration-300 active:scale-[0.98]"
                                >
                                    Details ansehen
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
