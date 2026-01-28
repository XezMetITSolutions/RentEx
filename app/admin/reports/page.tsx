'use client';

import { FileText, Download, Calendar, TrendingUp, Users, Car, DollarSign } from 'lucide-react';
import { useState } from 'react';
import ExportButtons from '@/components/admin/ExportButtons';

export default function ReportsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    const reportTypes = [
        {
            id: 'financial',
            name: 'Finanzbericht',
            description: 'Detaillierte Übersicht über Einnahmen, Ausgaben und Gewinne',
            icon: DollarSign,
            color: 'bg-green-500',
        },
        {
            id: 'rentals',
            name: 'Vermietungsbericht',
            description: 'Statistiken zu allen Vermietungen und Reservierungen',
            icon: Calendar,
            color: 'bg-blue-500',
        },
        {
            id: 'fleet',
            name: 'Flottenbericht',
            description: 'Fahrzeugauslastung, Wartung und Performance',
            icon: Car,
            color: 'bg-purple-500',
        },
        {
            id: 'customers',
            name: 'Kundenbericht',
            description: 'Kundenanalyse, Loyalität und Segmentierung',
            icon: Users,
            color: 'bg-orange-500',
        },
        {
            id: 'performance',
            name: 'Performance-Bericht',
            description: 'KPIs, Trends und Geschäftsentwicklung',
            icon: TrendingUp,
            color: 'bg-red-500',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Berichte & Analysen</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Erstellen und exportieren Sie detaillierte Geschäftsberichte
                    </p>
                </div>

                <div className="flex gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="today">Heute</option>
                        <option value="week">Diese Woche</option>
                        <option value="month">Dieser Monat</option>
                        <option value="quarter">Dieses Quartal</option>
                        <option value="year">Dieses Jahr</option>
                        <option value="custom">Benutzerdefiniert</option>
                    </select>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Berichte erstellt</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">247</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Downloads</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">1,432</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Letzter Bericht</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Heute</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Geplant</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">12</p>
                        </div>
                        <div className="h-12 w-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTypes.map((report) => (
                    <div
                        key={report.id}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start gap-4">
                            <div className={`h-12 w-12 rounded-lg ${report.color} flex items-center justify-center flex-shrink-0`}>
                                <report.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    {report.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    {report.description}
                                </p>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                                        Vorschau
                                    </button>
                                    <ExportButtons
                                        onExportExcel={() => console.log('Export Excel:', report.id)}
                                        onExportPDF={() => console.log('Export PDF:', report.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Scheduled Reports */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Geplante Berichte</h2>
                </div>
                <div className="p-6">
                    <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Keine geplanten Berichte</p>
                        <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                            Bericht planen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
