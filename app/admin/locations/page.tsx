import { MapPin, Phone, Clock, Car, Plus, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { clsx } from 'clsx';

export const dynamic = 'force-dynamic';

async function getLocations() {
    const locations = await prisma.location.findMany({
        include: {
            _count: {
                select: {
                    cars: true,
                    homeCars: true,
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    });

    // Calculate total vehicles per location (current + home)
    return locations.map(loc => ({
        ...loc,
        totalVehicles: loc._count.cars + loc._count.homeCars
    }));
}

export default async function LocationsPage() {
    const locations = await getLocations();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Standorte</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Verwalten Sie Ihre Vermietungsstandorte und deren Details.
                    </p>
                </div>
                <Link
                    href="/admin/locations/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-500/30"
                >
                    <Plus className="w-5 h-5" />
                    Neuer Standort
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Standorte</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{locations.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Car className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Fahrzeuge</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {locations.reduce((sum, loc) => sum + loc.totalVehicles, 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Geöffnet</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {locations.filter(l => l.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Phone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Kontaktbar</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {locations.filter(l => l.phone).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Locations List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alle Standorte</h2>
                </div>

                {locations.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Keine Standorte</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Erstellen Sie Ihren ersten Standort, um loszulegen.
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/admin/locations/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Neuer Standort
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {locations.map((location) => (
                            <div
                                key={location.id}
                                className="px-6 py-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {location.name}
                                            </h3>
                                            <span className={clsx(
                                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                location.status === 'active'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                            )}>
                                                {location.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                                            </span>
                                            {location.code && (
                                                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                    #{location.code}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                            {/* Address */}
                                            {location.address && (
                                                <div className="flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                    <div className="text-sm">
                                                        <p className="text-gray-900 dark:text-white">{location.address}</p>
                                                        {location.city && (
                                                            <p className="text-gray-500 dark:text-gray-400">
                                                                {location.city}, {location.country}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Phone */}
                                            {location.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <a
                                                        href={`tel:${location.phone}`}
                                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        {location.phone}
                                                    </a>
                                                </div>
                                            )}

                                            {/* Opening Hours */}
                                            {location.openingTime && location.closingTime && (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-sm text-gray-900 dark:text-white">
                                                        {location.openingTime} - {location.closingTime}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Vehicle Count */}
                                        <div className="flex items-center gap-2 mt-3">
                                            <Car className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {location.totalVehicles} Fahrzeug{location.totalVehicles !== 1 ? 'e' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 ml-4">
                                        <Link
                                            href={`/admin/locations/${location.id}`}
                                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Details ansehen"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                        <Link
                                            href={`/admin/locations/${location.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                                            title="Bearbeiten"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Link>
                                        <button
                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Löschen"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
