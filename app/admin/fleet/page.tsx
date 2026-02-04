import Image from 'next/image';
import prisma from '@/lib/prisma';
import { BadgeCheck, BadgeAlert, Fuel, Calendar, Palette } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { revalidatePath } from 'next/cache'; // Not used directly but good practice if we add actions

export const dynamic = 'force-dynamic';

async function getCars() {
    const cars = await prisma.car.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });
    return cars;
}

export default async function FleetPage() {
    const cars = await getCars();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Fahrzeugflotte</h1>
                <Link href="/admin/fleet/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                    + Neues Fahrzeug
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cars.map((car) => (
                    <div key={car.id} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">

                        {/* Car Image */}
                        <div className="aspect-video w-full bg-gray-100 relative items-center justify-center text-gray-400 flex overflow-hidden">
                            {car.imageUrl ? (
                                <Image
                                    src={car.imageUrl}
                                    alt={`${car.brand} ${car.model}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <CarIcon className="h-16 w-16 opacity-20" />
                            )}
                        </div>

                        <div className="flex-1 p-5 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{car.brand} {car.model}</h3>
                                    <p className="text-sm font-medium text-gray-500">{car.plate}</p>
                                </div>
                                <span className={clsx(
                                    "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                    car.status === 'Active' ? "bg-green-50 text-green-700 border-green-200" :
                                        car.status === 'Maintenance' ? "bg-red-50 text-red-700 border-red-200" :
                                            "bg-blue-50 text-blue-700 border-blue-200"
                                )}>
                                    {car.status === 'Active' ? 'Verfügbar' : car.status === 'Maintenance' ? 'Wartung' : 'Vermietet'}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>{car.year}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Fuel className="h-3.5 w-3.5" />
                                    <span>{car.fuelType}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Palette className="h-3.5 w-3.5" />
                                    <span>{car.color}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tagespreis</span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(car.dailyRate))}
                                    </span>
                                </div>
                                <Link
                                    href={`/admin/fleet/${car.id}`}
                                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
                                >
                                    Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CarIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
        </svg>
    )
}
