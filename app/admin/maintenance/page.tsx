/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Wrench, Plus, Car as CarIcon, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

export const dynamic = 'force-dynamic';

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

    const getMaintenanceBadge = (type: string) => {
        switch (type) {
            case 'Oil Change': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            case 'Tire Change': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'Inspection': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
            case 'Repair': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
            default: return 'bg-hm-paper-2 text-hm-muted border-hm-rule';
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
                            Flotte · Werkstatt & Service
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Wartungsverwaltung
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Prüftermine, Serviceintervalle & Werkstatthistorie
                    </p>
                </div>
                <Link 
                    href="/admin/maintenance/new" 
                    className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-hm-accent-ink transition-colors shadow-xs"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Wartung hinzufügen
                </Link>
            </div>

            {/* Alerts for upcoming maintenance */}
            {carsNeedingMaintenance.length > 0 && (
                <div className="bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-card)] p-5">
                    <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-hm-rule">
                        <div className="p-2 bg-hm-accent/10 border border-hm-accent/20 rounded-[var(--hm-radius-input)] text-hm-accent">
                            <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                {carsNeedingMaintenance.length} Fahrzeuge benötigen zeitnah Service
                            </h3>
                            <p className="font-mono text-[10px] text-hm-muted uppercase tracking-wider mt-0.5">
                                Fälligkeiten innerhalb der nächsten 30 Tage
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {carsNeedingMaintenance.slice(0, 6).map((car) => (
                            <Link
                                key={car.id}
                                href={`/admin/fleet/${car.id}`}
                                className="flex items-center gap-3 p-3 bg-hm-paper-2 hover:bg-hm-paper-3 border border-hm-rule rounded-[var(--hm-radius-input)] transition-colors group"
                            >
                                <div className="p-2 bg-hm-paper rounded border border-hm-rule text-hm-muted group-hover:text-hm-ink transition-colors">
                                    <CarIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-hm-ink truncate">
                                        {car.brand} {car.model}
                                    </p>
                                    <span className="font-mono text-[10px] text-hm-muted uppercase">
                                        {car.plate}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Maintenance Records Table */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                <div className="px-6 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper">
                    <div className="flex items-center gap-2.5">
                        <Wrench className="w-4 h-4 text-hm-accent" />
                        <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">Wartungshistorie</h2>
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                        {records.length} Einträge
                    </span>
                </div>

                {records.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Wrench className="h-10 w-10 text-hm-muted/40 mb-3" />
                        <p className="text-xs font-mono uppercase tracking-wider text-hm-muted">Keine Wartungseinträge vorhanden</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-hm-paper-2 text-[11px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Datum</th>
                                    <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-6 py-3 font-semibold">Wartungsart</th>
                                    <th className="px-6 py-3 font-semibold">Beschreibung</th>
                                    <th className="px-6 py-3 font-semibold">Kilometer</th>
                                    <th className="px-6 py-3 font-semibold text-right">Kosten</th>
                                    <th className="px-6 py-3 font-semibold">Dienstleister</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {records.map((record) => (
                                    <tr key={record.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-hm-ink">
                                            {format(new Date(record.performedDate), 'dd.MM.yyyy', { locale: de })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-hm-ink">
                                                {record.car.brand} {record.car.model}
                                            </div>
                                            <div className="inline-block mt-0.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink-2">
                                                {record.car.plate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                'inline-flex items-center rounded-[var(--hm-radius-pill)] px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border',
                                                getMaintenanceBadge(record.maintenanceType)
                                            )}>
                                                {record.maintenanceType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-hm-ink-2 max-w-xs truncate">
                                            {record.description}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-hm-ink hm-tnum">
                                            {record.mileage ? `${record.mileage.toLocaleString('de-AT')} km` : '—'}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-hm-ink text-right hm-tnum">
                                            {record.cost ? `€${Number(record.cost).toFixed(2)}` : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-hm-muted font-mono">
                                            {record.performedBy || '—'}
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
