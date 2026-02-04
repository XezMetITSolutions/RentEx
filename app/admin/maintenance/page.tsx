import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Wrench, Plus, Calendar, DollarSign, Car as CarIcon, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

async function getMaintenanceRecords() {
    const records = await prisma.maintenanceRecord.findMany({
        include: {
            car: true
        },
        orderBy: {
            performedDate: 'desc'
        },
        take: 50
    });
    return records;
}

async function getCarsNeedingMaintenance() {
    const cars = await prisma.car.findMany({
        where: {
            OR: [
                { nextOilChange: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
                { nextServiceDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
                { nextInspection: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
            ]
        },
        orderBy: {
            nextOilChange: 'asc'
        }
    });
    return cars;
}

export default async function MaintenancePage() {
    const records = await getMaintenanceRecords();
    const carsNeedingMaintenance = await getCarsNeedingMaintenance();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wartungsverwaltung</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Überwachen und planen Sie alle Wartungsarbeiten
                    </p>
                </div>
                <Link href="/admin/maintenance/new" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    Wartung hinzufügen
                </Link>
            </div>

            {/* Alerts for upcoming maintenance */}
            {carsNeedingMaintenance.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                                {carsNeedingMaintenance.length} Fahrzeuge benötigen Wartung
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {carsNeedingMaintenance.slice(0, 6).map((car) => (
                                    <Link
                                        key={car.id}
                                        href={`/admin/fleet/${car.id}`}
                                        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                                    >
                                        <CarIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {car.brand} {car.model}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{car.plate}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Maintenance Records Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Wartungshistorie</h2>
                </div>

                {records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Wrench className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Keine Wartungseinträge vorhanden</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 font-semibold border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4">Datum</th>
                                    <th className="px-6 py-4">Fahrzeug</th>
                                    <th className="px-6 py-4">Wartungsart</th>
                                    <th className="px-6 py-4">Beschreibung</th>
                                    <th className="px-6 py-4">Kilometerstand</th>
                                    <th className="px-6 py-4">Kosten</th>
                                    <th className="px-6 py-4">Durchgeführt von</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {records.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                                            {format(new Date(record.performedDate), 'dd.MM.yyyy', { locale: de })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {record.car.brand} {record.car.model}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{record.car.plate}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                                record.maintenanceType === 'Oil Change' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                                                record.maintenanceType === 'Tire Change' && 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
                                                record.maintenanceType === 'Inspection' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                                                record.maintenanceType === 'Repair' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
                                                record.maintenanceType === 'Service' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                            )}>
                                                {record.maintenanceType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                            {record.description}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {record.mileage ? `${record.mileage.toLocaleString('de-DE')} km` : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {record.cost ? `€${Number(record.cost).toFixed(2)}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {record.performedBy || '-'}
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
