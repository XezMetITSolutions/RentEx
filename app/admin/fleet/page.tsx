import Image from 'next/image';
import prisma from '@/lib/prisma';
import { BadgeCheck, BadgeAlert, Fuel, Calendar, Palette, Car as CarIconLucide } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

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
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Fahrzeugflotte</h1>
                <Link href="/admin/fleet/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                    + Neues Fahrzeug
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cars.map((car) => (
                    <div key={car.id} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 transition-all hover:shadow-md">

                        {/* Car Image */}
                        <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800 relative items-center justify-center text-zinc-400 dark:text-zinc-600 flex overflow-hidden">
                            {car.imageUrl ? (
                                <Image
                                    src={car.imageUrl}
                                    alt={`${car.brand} ${car.model}`}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <CarIconLucide className="h-16 w-16 opacity-50" />
                            )}
                        </div>

                        <div className="flex-1 p-5 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{car.brand} {car.model}</h3>
                                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{car.plate}</p>
                                </div>
                                <span className={clsx(
                                    "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                    car.status === 'Active' ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" :
                                        car.status === 'Maintenance' ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" :
                                            "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                )}>
                                    {car.status === 'Active' ? 'Verfügbar' : car.status === 'Maintenance' ? 'Wartung' : 'Vermietet'}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-zinc-500 dark:text-zinc-400">
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

                            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Tagespreis</span>
                                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(car.dailyRate))}
                                    </span>
                                </div>
                                <Link
                                    href={`/admin/fleet/${car.id}`}
                                    className="rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
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
