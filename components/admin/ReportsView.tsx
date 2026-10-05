/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { BarChart3, PieChart, Calendar, FileText, Download, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';

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
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadReport = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch('/api/admin/reports/export', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Report generation failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Flottenreport_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading report:', error);
            toast.error('Fehler beim Herunterladen des Reports');
        } finally {
            setIsDownloading(false);
        }
    };

    const activePercent = (data.carStats.active / data.carStats.total) * 100 || 0;
    const rentedPercent = (data.carStats.rented / data.carStats.total) * 100 || 0;
    const maintenancePercent = (data.carStats.maintenance / data.carStats.total) * 100 || 0;

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Analyse · Flottenberichte & Auslastung
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Berichte & Analysen
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Detaillierte Einblicke in Flottenauslastung, Modellpopularität und Servicefälligkeiten
                    </p>
                </div>
                <button
                    onClick={handleDownloadReport}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-hm-accent-ink transition-colors shadow-xs disabled:opacity-50"
                >
                    {isDownloading ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Wird generiert...
                        </>
                    ) : (
                        <>
                            <Download className="h-3.5 w-3.5" />
                            Bericht herunterladen
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fleet Status Card */}
                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper p-5 border border-hm-rule">
                    <div className="flex items-center justify-between pb-4 mb-5 border-b border-hm-rule">
                        <h3 className="hm-display text-base font-bold text-hm-ink flex items-center gap-2 tracking-tight">
                            <PieChart className="h-4 w-4 text-hm-accent" />
                            Flottenstatus & Auslastung
                        </h3>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                            Total: {data.carStats.total} Fzg.
                        </span>
                    </div>

                    <div className="space-y-5 font-mono">
                        <div>
                            <div className="flex justify-between items-center mb-1.5 text-xs">
                                <span className="text-hm-muted">Verfügbar</span>
                                <span className="font-bold text-emerald-700 dark:text-emerald-400">{data.carStats.active} ({activePercent.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-hm-paper-2 rounded-full h-2 overflow-hidden border border-hm-rule">
                                <div className="bg-emerald-600 h-2 rounded-full transition-all" style={{ width: `${activePercent}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5 text-xs">
                                <span className="text-hm-muted">Vermietet (im Einsatz)</span>
                                <span className="font-bold text-hm-accent">{data.carStats.rented} ({rentedPercent.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-hm-paper-2 rounded-full h-2 overflow-hidden border border-hm-rule">
                                <div className="bg-hm-accent h-2 rounded-full transition-all" style={{ width: `${rentedPercent}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5 text-xs">
                                <span className="text-hm-muted">In Wartung / Werkstatt</span>
                                <span className="font-bold text-amber-600">{data.carStats.maintenance} ({maintenancePercent.toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-hm-paper-2 rounded-full h-2 overflow-hidden border border-hm-rule">
                                <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: `${maintenancePercent}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popular Cars */}
                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper p-5 border border-hm-rule">
                    <div className="flex items-center justify-between pb-4 mb-5 border-b border-hm-rule">
                        <h3 className="hm-display text-base font-bold text-hm-ink flex items-center gap-2 tracking-tight">
                            <BarChart3 className="h-4 w-4 text-hm-accent" />
                            Meistgebuchte Modelle
                        </h3>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                            Top 5
                        </span>
                    </div>

                    <div className="space-y-2.5">
                        {data.popularCars.length > 0 ? (
                            data.popularCars.map((car, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-6 h-6 rounded bg-hm-paper border border-hm-rule font-mono font-bold text-xs text-hm-ink">
                                            {idx + 1}
                                        </div>
                                        <span className="text-xs font-semibold text-hm-ink">{car.name}</span>
                                    </div>
                                    <span className="font-mono text-xs font-semibold text-hm-muted">
                                        {car.count} Buchungen
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 font-mono text-xs text-hm-muted uppercase tracking-wider">
                                Keine Buchungsdaten verfügbar
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Rentals Table */}
                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper border border-hm-rule overflow-hidden">
                    <div className="p-5 border-b border-hm-rule">
                        <h3 className="hm-display text-base font-bold text-hm-ink flex items-center gap-2 tracking-tight">
                            <FileText className="h-4 w-4 text-hm-accent" />
                            Letzte Buchungen
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-hm-paper-2 text-[11px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Kunde</th>
                                    <th className="px-5 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-5 py-3 font-semibold">Datum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {data.recentRentals.length > 0 ? (
                                    data.recentRentals.map((rental) => (
                                        <tr key={rental.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                            <td className="px-5 py-3.5 font-medium text-xs text-hm-ink">
                                                {rental.customer.firstName} {rental.customer.lastName}
                                            </td>
                                            <td className="px-5 py-3.5 text-xs font-mono text-hm-muted">
                                                {rental.car.brand} {rental.car.model}
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-xs text-hm-muted">
                                                {format(new Date(rental.startDate), 'dd.MM.yyyy')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-8 text-center font-mono text-xs text-hm-muted uppercase tracking-wider">
                                            Keine Buchungen gefunden
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Maintenance */}
                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper border border-hm-rule overflow-hidden">
                    <div className="p-5 border-b border-hm-rule">
                        <h3 className="hm-display text-base font-bold text-hm-ink flex items-center gap-2 tracking-tight">
                            <Calendar className="h-4 w-4 text-hm-accent" />
                            Anstehende Wartungen
                        </h3>
                    </div>
                    <div className="p-5">
                        {data.upcomingMaintenance.length > 0 ? (
                            <div className="space-y-3">
                                {data.upcomingMaintenance.map((record) => (
                                    <div key={record.id} className="flex items-start gap-3 p-3 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule">
                                        <div className="p-1.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-semibold text-hm-ink truncate">
                                                    {record.car.brand} {record.car.model}
                                                </h4>
                                                <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                                    Fällig: {format(new Date(record.nextDueDate), 'dd.MM.yyyy')}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-mono text-hm-muted mt-0.5 truncate">
                                                {record.maintenanceType} {record.description ? `· ${record.description}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center font-mono text-xs text-hm-muted">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-2 opacity-50" />
                                <p className="font-semibold text-hm-ink">Alles im grünen Bereich!</p>
                                <p className="text-[11px] mt-0.5">Keine anstehenden Wartungen für die nächsten 30 Tage.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
