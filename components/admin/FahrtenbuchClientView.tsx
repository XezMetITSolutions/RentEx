/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { useState, useMemo } from 'react';
import {
    BookOpen,
    Download,
    Car as CarIcon,
    Gauge,
    Briefcase,
    Calendar,
    Trash2,
    ShieldCheck,
    Search,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { clsx } from 'clsx';
import FahrtenbuchForm, { CarOption } from '@/app/admin/fahrtenbuch/FahrtenbuchForm';
import { deleteFahrtenbuchEntry } from '@/app/actions/admin';

interface FahrtenbuchEntryItem {
    id: number;
    datum: string;
    startKm: number;
    endKm: number;
    zweck: string;
    fahrtzweck: string | null;
    carId: number;
}

interface CarWithEntries extends CarOption {
    entries: FahrtenbuchEntryItem[];
}

interface FahrtenbuchClientViewProps {
    cars: CarWithEntries[];
}

export default function FahrtenbuchClientView({ cars }: FahrtenbuchClientViewProps) {
    const [selectedCarFilter, setSelectedCarFilter] = useState<number | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Calculate metrics
    const { totalKm, businessKm, businessPercent, tripsThisMonth, totalTrips } = useMemo(() => {
        let total = 0;
        let business = 0;
        let thisMonthCount = 0;
        let tripsCount = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        cars.forEach((car) => {
            car.entries.forEach((e) => {
                const dist = Math.max(0, e.endKm - e.startKm);
                total += dist;
                tripsCount += 1;
                if (e.zweck === 'DIENSTFAHRT') {
                    business += dist;
                }
                const d = new Date(e.datum);
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                    thisMonthCount += 1;
                }
            });
        });

        const bPercent = total > 0 ? (business / total) * 100 : 100;

        return {
            totalKm: total,
            businessKm: business,
            businessPercent: bPercent,
            tripsThisMonth: thisMonthCount,
            totalTrips: tripsCount,
        };
    }, [cars]);

    // Filter displayed cars & entries
    const displayedCars = useMemo(() => {
        let list = selectedCarFilter === 'ALL' ? cars : cars.filter((c) => c.id === selectedCarFilter);

        if (!searchQuery.trim()) return list;

        const q = searchQuery.toLowerCase().trim();
        return list
            .map((car) => {
                const matchesCar =
                    car.brand.toLowerCase().includes(q) ||
                    car.model.toLowerCase().includes(q) ||
                    car.plate.toLowerCase().includes(q);

                const matchingEntries = car.entries.filter((e) => {
                    return (
                        matchesCar ||
                        (e.fahrtzweck && e.fahrtzweck.toLowerCase().includes(q)) ||
                        e.zweck.toLowerCase().includes(q) ||
                        String(e.startKm).includes(q) ||
                        String(e.endKm).includes(q)
                    );
                });

                return {
                    ...car,
                    entries: matchingEntries,
                };
            })
            .filter((car) => car.entries.length > 0 || car.brand.toLowerCase().includes(q) || car.plate.toLowerCase().includes(q));
    }, [cars, selectedCarFilter, searchQuery]);

    const handleDelete = async (entryId: number) => {
        if (!confirm('Diesen Fahrtenbuch-Eintrag wirklich unwiderruflich löschen?')) {
            return;
        }
        setDeletingId(entryId);
        try {
            await deleteFahrtenbuchEntry(entryId);
        } catch (error) {
            console.error('Failed to delete entry:', error);
            alert('Fehler beim Löschen des Eintrags');
        } finally {
            setDeletingId(null);
        }
    };

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
                        Finanzamt-konforme Kilometeraufzeichnung für Dienst- und Privatfahrten (§ 26 EStG / Sachbezug)
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <a
                        href="/api/admin/fahrtenbuch-export?format=csv"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Download className="w-3.5 h-3.5 text-hm-muted" />
                        CSV Export (Finanzamt)
                    </a>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">
                            Gesamtfahrleistung
                        </span>
                        <div className="p-2 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Gauge className="w-4 h-4 text-hm-accent" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl font-bold text-hm-ink mt-3 hm-tnum">
                        {totalKm.toLocaleString('de-AT')} km
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        Aus insgesamt {totalTrips} erfassten Fahrten
                    </p>
                </div>

                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">
                            Dienstfahrten-Quote
                        </span>
                        <div className="p-2 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Briefcase className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-3 hm-tnum">
                        {businessPercent.toFixed(1)}%
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        {businessKm.toLocaleString('de-AT')} km betrieblich veranlasst
                    </p>
                </div>

                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">
                            Fahrten diesen Monat
                        </span>
                        <div className="p-2 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl font-bold text-hm-ink mt-3 hm-tnum">
                        {tripsThisMonth}
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        Laufende Periode ({format(new Date(), 'MMMM yyyy', { locale: de })})
                    </p>
                </div>

                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">
                            Erfasste Fahrzeuge
                        </span>
                        <div className="p-2 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <CarIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="hm-display text-2xl font-bold text-hm-ink mt-3 hm-tnum">
                        {cars.length}
                    </p>
                    <p className="text-[11px] font-mono text-hm-muted mt-2">
                        Aktive Flottenfahrzeuge im Log
                    </p>
                </div>
            </div>

            {/* Vehicle Selector Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-hm-paper p-3 rounded-[var(--hm-radius-card)] border border-hm-rule">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                        onClick={() => setSelectedCarFilter('ALL')}
                        className={clsx(
                            "px-3 py-1.5 rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer",
                            selectedCarFilter === 'ALL'
                                ? "bg-hm-ink text-hm-paper shadow-xs"
                                : "bg-hm-paper-2 text-hm-muted hover:text-hm-ink border border-hm-rule"
                        )}
                    >
                        Alle Fahrzeuge ({cars.length})
                    </button>
                    {cars.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCarFilter(c.id)}
                            className={clsx(
                                "px-3 py-1.5 rounded-[var(--hm-radius-input)] font-mono text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer",
                                selectedCarFilter === c.id
                                    ? "bg-hm-ink text-hm-paper font-semibold shadow-xs"
                                    : "bg-hm-paper-2 text-hm-muted hover:text-hm-ink border border-hm-rule"
                            )}
                        >
                            <span>{c.brand} {c.model}</span>
                            <span className="font-mono text-[10px] opacity-70">({c.plate})</span>
                            <span className="text-[10px] px-1 py-0.2 rounded bg-black/10 dark:bg-white/10">
                                {c.entries.length}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative shrink-0">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-hm-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Fahrtzweck, Ort, km..."
                        className="pl-8 pr-3 py-1.5 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono bg-hm-paper-2 text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors w-full sm:w-56"
                    />
                </div>
            </div>

            {/* Main Content Layout */}
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
                    {displayedCars.length === 0 ? (
                        <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule p-12 text-center font-mono text-xs text-hm-muted uppercase tracking-wider">
                            Keine Fahrtenbuch-Einträge für diese Filterkriterien vorhanden.
                        </div>
                    ) : (
                        displayedCars.map((car) => (
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
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink-2">
                                                    {car.plate}
                                                </span>
                                                <span className="font-mono text-[11px] text-hm-muted">
                                                    Aktueller Tachostand: {(car.latestEndKm ?? car.currentMileage ?? 0).toLocaleString('de-AT')} km
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                                        {car.entries.length} Fahrten
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
                                                <th className="px-4 py-3 font-semibold text-right">Aktion</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-hm-rule">
                                            {car.entries.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center font-mono text-xs text-hm-muted uppercase tracking-wider">
                                                        Noch keine Fahrten für dieses Fahrzeug erfasst.
                                                    </td>
                                                </tr>
                                            ) : (
                                                car.entries.map((e) => {
                                                    const distance = e.endKm - e.startKm;
                                                    return (
                                                        <tr key={e.id} className="hover:bg-hm-paper-2/50 transition-colors group">
                                                            <td className="px-4 py-3 font-mono text-xs text-hm-ink">
                                                                {format(new Date(e.datum), 'dd.MM.yyyy', { locale: de })}
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs text-hm-muted hm-tnum">
                                                                {e.startKm.toLocaleString('de-AT')}
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs text-hm-muted hm-tnum">
                                                                {e.endKm.toLocaleString('de-AT')}
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs font-bold text-hm-ink hm-tnum">
                                                                +{distance.toLocaleString('de-AT')} km
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-[10px]">
                                                                <span className={clsx(
                                                                    "px-2 py-0.5 rounded-[var(--hm-radius-pill)] font-bold uppercase tracking-wider border",
                                                                    e.zweck === 'DIENSTFAHRT'
                                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                                                        : 'bg-hm-paper-2 text-hm-muted border-hm-rule'
                                                                )}>
                                                                    {e.zweck === 'DIENSTFAHRT' ? 'Dienst' : 'Privat'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-hm-ink font-medium">
                                                                {e.fahrtzweck || '–'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <button
                                                                    onClick={() => handleDelete(e.id)}
                                                                    disabled={deletingId === e.id}
                                                                    className="p-1.5 text-hm-muted hover:text-red-600 rounded-[var(--hm-radius-input)] hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                                                    title="Eintrag löschen"
                                                                >
                                                                    {deletingId === e.id ? (
                                                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                                                                    ) : (
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    )}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Compliance Footer */}
            <div className="flex items-start gap-3 p-4 bg-hm-paper-2 rounded-[var(--hm-radius-card)] border border-hm-rule">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-hm-ink">
                        Österreichisches Steuerrecht (§ 26 Z 4 EStG)
                    </h4>
                    <p className="text-xs text-hm-muted">
                        Ein ordnungsgemäßes elektronisches Fahrtenbuch muss fortlaufend, zeitnah und manipulationssicher geführt werden. Zweck, Reiseroute sowie genauer Anfangs- und Endkilometerstand müssen lückenlos dokumentiert sein.
                    </p>
                </div>
            </div>
        </div>
    );
}
