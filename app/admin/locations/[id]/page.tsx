import { MapPin, Phone, Mail, Clock, Car, Calendar, Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { clsx } from 'clsx';

export const dynamic = 'force-dynamic';

async function getLocation(id: string) {
    const location = await prisma.location.findUnique({
        where: { id: parseInt(id) },
        include: {
            cars: {
                where: { isActive: true },
                select: {
                    id: true,
                    brand: true,
                    model: true,
                    plate: true,
                    category: true,
                    status: true,
                }
            },
            homeCars: {
                where: { isActive: true },
                select: {
                    id: true,
                    brand: true,
                    model: true,
                    plate: true,
                    category: true,
                    status: true,
                }
            },
            _count: {
                select: {
                    pickups: true,
                    returns: true,
                }
            }
        }
    });

    if (!location) return null;

    return location;
}

export default async function LocationDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const location = await getLocation(params.id);

    if (!location) {
        notFound();
    }

    const totalVehicles = location.cars.length + location.homeCars.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/locations"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{location.name}</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Details und Fahrzeuge dieses Standorts
                        </p>
                    </div>
                </div>
                <Link
                    href={`/admin/locations/${location.id}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg shadow-orange-500/30"
                >
                    <Edit className="w-5 h-5" />
                    Bearbeiten
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fahrzeuge</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalVehicles}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Abholungen</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{location._count.pickups}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Rückgaben</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{location._count.returns}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className={clsx(
                            'p-3 rounded-lg',
                            location.status === 'active'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-gray-100 dark:bg-gray-700'
                        )}>
                            <MapPin className={clsx(
                                'w-6 h-6',
                                location.status === 'active'
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            )} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {location.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact & Address */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Kontakt & Adresse</h2>

                    <div className="space-y-4">
                        {location.address && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{location.address}</p>
                                    {location.city && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {location.city}, {location.country}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {location.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <a
                                    href={`tel:${location.phone}`}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {location.phone}
                                </a>
                            </div>
                        )}

                        {location.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <a
                                    href={`mailto:${location.email}`}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {location.email}
                                </a>
                            </div>
                        )}

                        {location.code && (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <span className="text-gray-400">#</span>
                                </div>
                                <span className="text-sm text-gray-900 dark:text-white font-mono">
                                    Code: {location.code}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Opening Hours */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-500" />
                        Öffnungszeiten
                    </h2>

                    <div className="space-y-4">
                        {location.openingTime && location.closingTime ? (
                            <>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Montag - Freitag</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {location.openingTime} - {location.closingTime}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Samstag</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {location.openingTime} - {location.closingTime}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Sonntag</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {location.isOpenSundays ? `${location.openingTime} - ${location.closingTime}` : 'Geschlossen'}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Keine Öffnungszeiten angegeben
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Vehicles */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fahrzeuge an diesem Standort</h2>
                </div>

                {totalVehicles === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <Car className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Keine Fahrzeuge</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            An diesem Standort befinden sich derzeit keine Fahrzeuge.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                        Fahrzeug
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                        Kennzeichen
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                        Kategorie
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                        Typ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {location.cars.map((car) => (
                                    <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/fleet/${car.id}`}
                                                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {car.brand} {car.model}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-white font-mono">{car.plate}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{car.category}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                car.status === 'Active' && 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
                                                car.status === 'Rented' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
                                                car.status === 'Maintenance' && 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
                                            )}>
                                                {car.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Aktuell</span>
                                        </td>
                                    </tr>
                                ))}
                                {location.homeCars.map((car) => (
                                    <tr key={`home-${car.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/fleet/${car.id}`}
                                                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                {car.brand} {car.model}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-white font-mono">{car.plate}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{car.category}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                car.status === 'Active' && 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
                                                car.status === 'Rented' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
                                                car.status === 'Maintenance' && 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
                                            )}>
                                                {car.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Heimat</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
