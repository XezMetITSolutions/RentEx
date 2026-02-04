import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Wrench, Search, Car, Calendar, DollarSign, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

async function getMaintenanceRecords() {
    return await prisma.maintenanceRecord.findMany({
        orderBy: {
            performedDate: 'desc'
        },
        include: {
            car: true
        }
    });
}

export default async function MaintenancePage() {
    const records = await getMaintenanceRecords();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Wartung & Service</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Überblick über alle Fahrzeuginspektionen und Reparaturen</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                    <Link
                        href="/admin/maintenance/new"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Neuer Eintrag
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Wartungen Gesamt</p>
                        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{records.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Kosten (Gesamt)</p>
                        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            {formatCurrency(records.reduce((sum, rec) => sum + Number(rec.cost), 0))}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Diesen Monat</p>
                        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            {records.filter(r => new Date(r.performedDate).getMonth() === new Date().getMonth() && new Date(r.performedDate).getFullYear() === new Date().getFullYear()).length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-400">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-xs uppercase font-medium text-zinc-500 dark:text-zinc-400">
                            <tr>
                                <th className="px-6 py-3">Datum</th>
                                <th className="px-6 py-3">Fahrzeug</th>
                                <th className="px-6 py-3">Art der Wartung</th>
                                <th className="px-6 py-3">Beschreibung</th>
                                <th className="px-6 py-3">Ausgeführt von</th>
                                <th className="px-6 py-3 text-right">Kosten</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {records.map((record) => (
                                <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {format(new Date(record.performedDate), 'dd.MM.yyyy', { locale: de })}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                                        <div className="flex items-center gap-2">
                                            <Car className="w-4 h-4 text-zinc-400" />
                                            {record.car.brand} {record.car.model}
                                        </div>
                                        <div className="text-xs text-zinc-400 pl-6">{record.car.plate}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                                            {record.maintenanceType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={record.description}>
                                        {record.description}
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.performedBy}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-zinc-100">
                                        {formatCurrency(Number(record.cost))}
                                    </td>
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 italic">
                                        Keine Wartungseinträge gefunden.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
