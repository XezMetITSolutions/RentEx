/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
import { Calendar, AlertTriangle, CheckCircle, Clock, Car, Wrench, Droplet, CircleDot, ChevronRight } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { clsx } from 'clsx';
import Link from 'next/link';
import { getTodayEvents, getMaintenanceAlerts } from '@/app/actions/admin';

export default async function TodayOverview() {
    const todayEvents = await getTodayEvents();
    const maintenanceAlerts = await getMaintenanceAlerts();

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'pickup': return CheckCircle;
            case 'return': return Clock;
            case 'maintenance': return Wrench;
            default: return Calendar;
        }
    };

    const getMaintenanceIcon = (type: string) => {
        switch (type) {
            case 'oil': return Droplet;
            case 'tire': return CircleDot;
            case 'inspection': return Wrench;
            case 'vignette': return Car;
            default: return AlertTriangle;
        }
    };

    const getMaintenanceLabel = (type: string) => {
        switch (type) {
            case 'oil': return 'Ölwechsel';
            case 'tire': return 'Reifenwechsel';
            case 'inspection': return 'Pickerl (§57a / TÜV)';
            case 'vignette': return 'Autobahnvignette';
            default: return 'Wartung';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-hm-ink">
            {/* Today's Schedule */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col h-full">
                <div className="px-6 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="hm-display text-base font-bold text-hm-ink tracking-tight">Heutige Termine</h3>
                            <p className="font-mono text-[10px] text-hm-muted uppercase tracking-wider mt-0.5">
                                {format(new Date(), 'EEEE, dd. MMMM', { locale: de })}
                            </p>
                        </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                        {todayEvents.length} Gesamt
                    </span>
                </div>

                <div className="flex-1 p-5 space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar">
                    {todayEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-10 h-10 rounded-full bg-hm-paper-2 border border-hm-rule flex items-center justify-center mb-3">
                                <Calendar className="h-5 w-5 text-hm-muted" />
                            </div>
                            <p className="text-xs font-mono uppercase tracking-wider text-hm-muted">Keine Termine für heute geplant</p>
                        </div>
                    ) : (
                        todayEvents.map((event) => {
                            const Icon = getEventIcon(event.type);
                            return (
                                <div
                                    key={event.id}
                                    className="relative flex items-center gap-3.5 p-3.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule transition-colors group cursor-pointer"
                                >
                                    <Link href={`/admin/reservations/${event.id}`} className="absolute inset-0 z-0" />
                                    
                                    <div className={clsx(
                                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--hm-radius-input)] relative z-10 border',
                                        event.type === 'pickup' 
                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                                            : event.type === 'return' 
                                            ? 'bg-hm-accent/10 text-hm-accent border-hm-accent/20' 
                                            : 'bg-hm-paper-2 text-hm-muted border-hm-rule'
                                    )}>
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="flex-1 min-w-0 relative z-10">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="font-mono text-xs font-bold text-hm-ink tracking-tight">{event.time}</span>
                                            <span className={clsx(
                                                'font-mono px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border',
                                                event.type === 'pickup' 
                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' 
                                                    : 'bg-hm-paper-2 text-hm-ink border-hm-rule'
                                            )}>
                                                {event.type === 'pickup' ? 'Abholung' : 'Rückgabe'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-hm-ink truncate">{event.car}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-hm-muted">{event.customer}</span>
                                            {event.location && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-hm-rule"></span>
                                                    <span className="text-xs text-hm-muted">📍 {event.location}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-hm-muted group-hover:text-hm-ink transition-colors" />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Maintenance Alerts */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col h-full">
                <div className="px-6 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule text-hm-ink">
                            <AlertTriangle className="h-4 w-4 text-hm-accent" />
                        </div>
                        <div>
                            <h3 className="hm-display text-base font-bold text-hm-ink tracking-tight">Wartungserinnerungen</h3>
                            <p className="font-mono text-[10px] text-hm-muted uppercase tracking-wider mt-0.5">Anstehende Servicearbeiten</p>
                        </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-accent/10 text-hm-accent border border-hm-accent/20">
                        {maintenanceAlerts.filter(a => a.urgency === 'critical').length} Dringend
                    </span>
                </div>

                <div className="flex-1 p-5 space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar">
                    {maintenanceAlerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <p className="text-xs font-mono uppercase tracking-wider text-hm-muted">Alle Fahrzeuge einsatzbereit & gewartet</p>
                        </div>
                    ) : (
                        maintenanceAlerts.map((alert) => {
                            const Icon = getMaintenanceIcon(alert.type);
                            const daysUntil = differenceInDays(alert.dueDate, new Date());
                            const isCritical = alert.urgency === 'critical' || daysUntil < 0;

                            return (
                                <div
                                    key={alert.id}
                                    className="p-3.5 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper hover:bg-hm-paper-2 transition-colors flex items-start gap-3.5"
                                >
                                    <div className={clsx(
                                        'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--hm-radius-input)] border',
                                        isCritical 
                                            ? 'bg-hm-accent/10 text-hm-accent border-hm-accent/20' 
                                            : 'bg-hm-paper-2 text-hm-muted border-hm-rule'
                                    )}>
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-hm-ink truncate">{alert.car}</p>
                                            <span className={clsx(
                                                'font-mono px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border',
                                                daysUntil < 0 ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                    daysUntil <= 7 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                                        'bg-hm-paper-2 text-hm-muted border-hm-rule'
                                            )}>
                                                {daysUntil < 0 ? `${Math.abs(daysUntil)}d überfällig` :
                                                    daysUntil === 0 ? 'Heute' :
                                                        `in ${daysUntil}d`}
                                            </span>
                                        </div>

                                        <p className="text-xs font-medium text-hm-ink-2">{getMaintenanceLabel(alert.type)}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs">
                                            <div className="flex items-center gap-1.5 font-mono">
                                                <span className="text-[10px] uppercase text-hm-muted">Kennzeichen:</span>
                                                <span className="font-semibold text-hm-ink bg-hm-paper-2 px-1.5 py-0.5 rounded border border-hm-rule text-[11px]">{alert.plate}</span>
                                            </div>
                                            {alert.currentMileage && (
                                                <div className="flex items-center gap-1.5 font-mono pl-3 border-l border-hm-rule">
                                                    <span className="text-[10px] uppercase text-hm-muted">km:</span>
                                                    <span className="font-semibold text-hm-ink hm-tnum">{alert.currentMileage.toLocaleString('de-AT')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="px-6 py-3.5 border-t border-hm-rule bg-hm-paper rounded-b-[var(--hm-radius-card)]">
                    <Link 
                        href="/admin/maintenance" 
                        className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted hover:text-hm-accent flex items-center gap-1.5 transition-colors"
                    >
                        Wartungsübersicht öffnen <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
