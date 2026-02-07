
import prisma from '@/lib/prisma';
import { Car } from '@prisma/client';
import Link from 'next/link';
import { Car as CarIcon, MapPin, Navigation, Signal } from 'lucide-react';

async function getActiveCarsWithGps() {
    const cars = await prisma.car.findMany({
        where: {
            isActive: true,
            status: { not: 'Sold' },
            latitude: { not: null },
            longitude: { not: null },
        },
        include: {
            currentLocation: true
        }
    });
    return cars;
}

// Map center (Feldkirch area) – used only for viewport when no locations in DB
const DEFAULT_CENTER_LAT = 47.237;
const DEFAULT_CENTER_LNG = 9.598;
const ZOOM_SCALE = 10000;

export const dynamic = 'force-dynamic';

export default async function TrackingPage() {
    const cars = await getActiveCarsWithGps();

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="h-6 w-6 text-red-600" />
                        Live GPS Tracking
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Echtzeit-Standort aller aktiven Fahrzeuge ({cars.length} verbunden)
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">System Online</span>
                </div>
            </div>

            <div className="flex-1 bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden relative shadow-inner border border-gray-200 dark:border-gray-800">
                {/* Mock Map Background - grid pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #808080 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                ></div>

                {/* Map Streets Mock (Just decoration lines) */}
                <svg className="absolute inset-0 w-full h-full text-gray-300 dark:text-gray-700 opacity-30 pointer-events-none">
                    <path d="M0 100 Q 400 300 800 100 T 1600 200" fill="none" stroke="currentColor" strokeWidth="20" />
                    <path d="M200 0 Q 300 400 100 800" fill="none" stroke="currentColor" strokeWidth="15" />
                    <path d="M600 800 Q 500 400 800 0" fill="none" stroke="currentColor" strokeWidth="15" />
                    <path d="M0 500 L 1600 400" fill="none" stroke="currentColor" strokeWidth="10" />
                </svg>

                {/* Markers - only cars with GPS from DB */}
                {cars.map((car) => {
                    const lat = car.latitude!;
                    const lng = car.longitude!;

                    const left = 50 + (lng - DEFAULT_CENTER_LNG) * ZOOM_SCALE;
                    const top = 50 - (lat - DEFAULT_CENTER_LAT) * ZOOM_SCALE * 1.5;

                    return (
                        <div
                            key={car.id}
                            className="absolute group z-10 hover:z-20 transition-all duration-300"
                            style={{
                                left: `${Math.max(5, Math.min(95, left))}%`,
                                top: `${Math.max(5, Math.min(95, top))}%`
                            }}
                        >
                            {/* Pulse effect */}
                            <div className="absolute -inset-4 bg-red-500/20 rounded-full animate-ping opacity-75"></div>

                            {/* Marker */}
                            <div className="relative flex flex-col items-center">
                                <div className="h-8 w-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 cursor-pointer transform group-hover:scale-110 transition-transform">
                                    <CarIcon className="h-4 w-4" />
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-10 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-left border border-gray-100 dark:border-gray-700 min-w-[150px]">
                                    <p className="font-bold text-gray-900 dark:text-white">{car.brand} {car.model}</p>
                                    <p className="text-xs text-gray-500">{car.plate}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-green-600">
                                        <Signal className="h-3 w-3" />
                                        <span>Verbunden</span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {lat.toFixed(5)}, {lng.toFixed(5)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Controls Overlay */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button className="h-10 w-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Navigation className="h-5 w-5" />
                    </button>
                    <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-lg text-xs font-mono text-gray-500 dark:text-gray-400">
                        Live Map Mode v1.0
                    </div>
                </div>
            </div>

            {/* List View of cars below map */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {cars.slice(0, 4).map(car => (
                    <div key={car.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <CarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{car.brand} {car.model}</p>
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                Online
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
