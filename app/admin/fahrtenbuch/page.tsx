/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import FahrtenbuchForm from './FahrtenbuchForm';
import { BookOpen, Download, Car as CarIcon } from 'lucide-react';

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
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Finanzen & Recht · Konformes Fahrtenbuch
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Elektronisches Fahrtenbuch
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Finanzamt-konforme Kilometeraufzeichnung für Dienst- und Privatfahrten (§ 26 EStG)
                    </p>
                </div>
                <a
                    href="/api/admin/fahrtenbuch-export?format=csv"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                >
                    <Download className="w-3.5 h-3.5 text-hm-muted" />
                    CSV Export (Finanzamt)
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form (Left Column) */}
                <div className="lg:col-span-4">
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule p-5 sticky top-24">
                        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-hm-rule">
                            <BookOpen className="w-4 h-4 text-hm-accent" />
                            <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">Neuer Eintrag</h2>
                        </div>
                        <FahrtenbuchForm cars={cars} />
                    </div>
                </div>

                {/* Logs List (Right Column) */}
                <div className="lg:col-span-8 space-y-6">
                    {cars.map((car) => (
                        <div key={car.id} className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                            <div className="px-5 py-4 border-b border-hm-rule bg-hm-paper flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink">
                                        <CarIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-hm-ink text-sm">
                                            {car.brand} {car.model}
                                        </h3>
                                        <div className="inline-block mt-0.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink-2">
                                            {car.plate}
                                        </div>
                                    </div>
                                </div>
                                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                                    {car.fahrtenbuchEntries.length} Fahrten
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-hm-paper-2 text-[11px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Datum</th>
                                            <th className="px-4 py-3 font-semibold">Start km</th>
                                            <th className="px-4 py-3 font-semibold">Ende km</th>
                                            <th className="px-4 py-3 font-semibold">Strecke</th>
                                            <th className="px-4 py-3 font-semibold">Zweck</th>
                                            <th className="px-4 py-3 font-semibold">Fahrtzweck / Route</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-hm-rule">
                                        {car.fahrtenbuchEntries.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center font-mono text-xs text-hm-muted uppercase tracking-wider">
                                                    Noch keine Fahrten für dieses Fahrzeug erfasst.
                                                </td>
                                            </tr>
                                        ) : (
                                            car.fahrtenbuchEntries.map((e) => (
                                                <tr key={e.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-xs text-hm-ink">
                                                        {format(new Date(e.datum), 'dd.MM.yyyy', { locale: de })}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-hm-muted hm-tnum">{e.startKm.toLocaleString('de-AT')}</td>
                                                    <td className="px-4 py-3 font-mono text-xs text-hm-muted hm-tnum">{e.endKm.toLocaleString('de-AT')}</td>
                                                    <td className="px-4 py-3 font-mono text-xs font-bold text-hm-ink hm-tnum">
                                                        {e.endKm - e.startKm} km
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-[10px]">
                                                        <span className={e.zweck === 'DIENSTFAHRT' 
                                                            ? 'px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider' 
                                                            : 'px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 text-hm-muted border border-hm-rule font-bold uppercase tracking-wider'
                                                        }>
                                                            {e.zweck === 'DIENSTFAHRT' ? 'Dienst' : 'Privat'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-hm-ink font-medium">
                                                        {e.fahrtzweck || '–'}
                                                    </td>
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
        </div>
    );
}
