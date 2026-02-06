
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Car, AlertTriangle, CheckCircle, Search, Filter } from 'lucide-react';

async function getDamageRecords() {
    return await prisma.damageRecord.findMany({
        include: {
            car: true,
            rental: {
                include: {
                    customer: true
                }
            }
        },
        orderBy: { reportedDate: 'desc' }
    });
}

export const dynamic = 'force-dynamic';

export default async function DamagePage() {
    const records = await getDamageRecords();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schadenmanagement</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Erfassen und verwalten Sie Fahrzeugschäden visuell</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-50 text-gray-700 dark:text-gray-200">
                        <Filter className="h-4 w-4" />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
                        <AlertTriangle className="h-4 w-4" />
                        Schaden melden
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List View */}
                <div className="col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Kennzeichen oder ID suchen..."
                                className="w-full h-10 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {records.map((record) => (
                                <div key={record.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            {record.car.brand} {record.car.model}
                                            {record.status === 'open' && <span className="h-2 w-2 rounded-full bg-red-500"></span>}
                                        </h4>
                                        <span className="text-xs text-gray-500 font-mono">#{record.id}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{record.type}: {record.description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{format(new Date(record.reportedDate), 'dd.MM.yy', { locale: de })}</span>
                                        <span className={`px-2 py-0.5 rounded-full ${record.severity === 'High' ? 'bg-red-100 text-red-700' :
                                                record.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>{record.severity || 'Low'}</span>
                                    </div>
                                </div>
                            ))}
                            {records.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-3" />
                                    <p>Keine offenen Schäden</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Detail / Visual Board */}
                <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Fahrzeug Check-in/out</h2>
                            <p className="text-gray-500 text-sm">Visuelle Markierung von Schäden</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div> Kratzer
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div> Delle
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div> Steinschlag
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-8 flex items-center justify-center relative border border-dashed border-gray-200 dark:border-gray-700">

                        {/* Car Outline SVG */}
                        <div className="relative w-full max-w-lg aspect-[1.8/1]">
                            {/* Top View Car SVG Schematic */}
                            <svg viewBox="0 0 500 280" className="w-full h-full drop-shadow-xl text-gray-200 dark:text-gray-700 fill-white dark:fill-gray-800 stroke-gray-300 dark:stroke-gray-600 stroke-2">
                                <path d="M60,140 C60,200 120,240 250,240 C380,240 440,200 440,140 C440,80 380,40 250,40 C120,40 60,80 60,140 Z" />
                                {/* Windshield */}
                                <path d="M150,60 L350,60 L340,220 L160,220 Z" className="fill-blue-50/50 dark:fill-blue-900/20" />
                                {/* Wheels */}
                                <rect x="100" y="20" width="60" height="30" rx="5" className="fill-gray-800" />
                                <rect x="340" y="20" width="60" height="30" rx="5" className="fill-gray-800" />
                                <rect x="100" y="230" width="60" height="30" rx="5" className="fill-gray-800" />
                                <rect x="340" y="230" width="60" height="30" rx="5" className="fill-gray-800" />
                            </svg>

                            {/* Mock Markers based on records */}
                            {records.map((r, i) => (
                                <div
                                    key={r.id}
                                    className="absolute h-6 w-6 rounded-full bg-white dark:bg-gray-800 border-2 border-red-500 flex items-center justify-center text-[10px] font-bold shadow-lg cursor-pointer hover:scale-125 transition-transform"
                                    style={{
                                        left: `${r.xPosition || 30 + (i * 10)}%`,
                                        top: `${r.yPosition || 40 + (i * 5)}%`
                                    }}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm">Abbrechen</button>
                        <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm">Speichern</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
