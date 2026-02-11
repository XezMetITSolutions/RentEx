import prisma from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import FahrtenbuchForm from './FahrtenbuchForm';

export const dynamic = 'force-dynamic';

async function getCarsWithEntries() {
    const cars = await prisma.car.findMany({
        where: { isActive: true },
        orderBy: [{ brand: 'asc' }, { model: 'asc' }],
        include: {
            fahrtenbuchEntries: {
                orderBy: { datum: 'desc' },
                take: 50,
            },
        },
    });
    return cars;
}

export default async function FahrtenbuchPage() {
    const cars = await getCarsWithEntries();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fahrtenbuch</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Kilometerbuch für Finanzamt (Dienst- und Privatfahrten)
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Neuer Eintrag</h2>
                        <FahrtenbuchForm cars={cars} />
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {cars.map((car) => (
                        <div key={car.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {car.brand} {car.model}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{car.plate} · {car.fahrtenbuchEntries.length} Einträge</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                                            <th className="px-4 py-3">Datum</th>
                                            <th className="px-4 py-3">Start km</th>
                                            <th className="px-4 py-3">Ende km</th>
                                            <th className="px-4 py-3">Strecke</th>
                                            <th className="px-4 py-3">Zweck</th>
                                            <th className="px-4 py-3">Fahrtzweck</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {car.fahrtenbuchEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                                    Noch keine Einträge. Neuen Eintrag oben anlegen.
                                                </td>
                                            </tr>
                                        ) : (
                                            car.fahrtenbuchEntries.map((e) => (
                                                <tr key={e.id} className="border-b border-gray-100 dark:border-gray-700/50">
                                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{format(new Date(e.datum), 'dd.MM.yyyy', { locale: de })}</td>
                                                    <td className="px-4 py-2">{e.startKm}</td>
                                                    <td className="px-4 py-2">{e.endKm}</td>
                                                    <td className="px-4 py-2 font-medium">{e.endKm - e.startKm} km</td>
                                                    <td className="px-4 py-2">
                                                        <span className={e.zweck === 'DIENSTFAHRT' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                            {e.zweck === 'DIENSTFAHRT' ? 'Dienst' : 'Privat'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{e.fahrtzweck || '–'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-2">
                <a
                    href="/api/admin/fahrtenbuch-export?format=csv"
                    className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                    Fahrtenbuch als CSV exportieren (Finanzamt)
                </a>
            </div>
        </div>
    );
}
