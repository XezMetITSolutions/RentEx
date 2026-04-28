'use client';

import { BarChart3, PieChart, Calendar, FileText, Download, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ReportsData {
    carStats: {
        total: number;
        active: number;
        rented: number;
        maintenance: number;
    };
    upcomingMaintenance: any[];
    recentRentals: any[];
    popularCars: { name: string; count: number }[];
}

export default function ReportsView({ data }: { data: ReportsData }) {

    // Calculate percentages for progress bars
    const activePercent = (data.carStats.active / data.carStats.total) * 100 || 0;
    const rentedPercent = (data.carStats.rented / data.carStats.total) * 100 || 0;
    const maintenancePercent = (data.carStats.maintenance / data.carStats.total) * 100 || 0;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Berichte & Analysen</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Detaillierte Einblicke in Ihre Flottenleistung
                    </p>
                </div>
                <button
                    onClick={() => alert('Bericht wird generiert...')}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                    <Download className="h-4 w-4" />
                    Bericht herunterladen
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fleet Status Card */}
                <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-gray-400" />
                            Flottenstatus
                        </h3>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            Total: {data.carStats.total} Fzg.
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verfügbar</span>
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">{data.carStats.active} ({activePercent.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${activePercent}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vermietet</span>
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{data.carStats.rented} ({rentedPercent.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${rentedPercent}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wartung</span>
                                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{data.carStats.maintenance} ({maintenancePercent.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${maintenancePercent}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popular Cars */}
                <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-gray-400" />
                            Beliebte Modelle
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {data.popularCars.length > 0 ? (
                            data.popularCars.map((car, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm">
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{car.name}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        {car.count} Buchungen
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Keine Daten verfügbar
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Rentals Table */}
                <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-400" />
                            Letzte Buchungen
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kunde</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fahrzeug</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Datum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {data.recentRentals.length > 0 ? (
                                    data.recentRentals.map((rental) => (
                                        <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {rental.customer.firstName} {rental.customer.lastName}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {rental.car.brand} {rental.car.model}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {format(new Date(rental.startDate), 'dd.MM.yyyy')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Keine Buchungen gefunden
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Maintenance */}
                <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            Anstehende Wartungen
                        </h3>
                    </div>
                    <div className="p-6">
                        {data.upcomingMaintenance.length > 0 ? (
                            <div className="space-y-4">
                                {data.upcomingMaintenance.map((record) => (
                                    <div key={record.id} className="flex items-start gap-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30">
                                        <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {record.car.brand} {record.car.model}
                                            </h4>
                                            <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
                                                Fällig am: {format(new Date(record.nextDueDate), 'dd.MM.yyyy')}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {record.maintenanceType} - {record.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                <CheckCircle2 className="h-12 w-12 text-green-500 mb-3 opacity-20" />
                                <p>Alles im grünen Bereich!</p>
                                <p className="text-sm mt-1">Keine anstehenden Wartungen für die nächsten 30 Tage.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
