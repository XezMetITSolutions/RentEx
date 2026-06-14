import { Calendar, AlertTriangle, CheckCircle, Clock, Car, Wrench, Droplet, CircleDot, ChevronRight } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { clsx } from 'clsx';
import Link from 'next/link';

interface TodayEvent {
    id: number;
    type: 'pickup' | 'return' | 'maintenance';
    time: string;
    car: string;
    customer: string;
    location?: string;
    status: 'upcoming';
}

interface MaintenanceAlert {
    id: number;
    car: string;
    plate: string;
    type: 'oil' | 'tire' | 'inspection' | 'vignette';
    dueDate: Date;
    urgency: 'critical' | 'warning' | 'info';
    lastService?: Date;
    currentMileage?: number;
}

interface TodayOverviewProps {
    todayEvents: TodayEvent[];
    maintenanceAlerts: MaintenanceAlert[];
}

export default function TodayOverview({ todayEvents, maintenanceAlerts }: TodayOverviewProps) {

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
            case 'inspection': return 'TÜV/Inspektion';
            case 'vignette': return 'Vignette';
            default: return 'Wartung';
        }
    };

    const getUrgencyStyles = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50';
            case 'warning': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50';
            default: return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Schedule */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-full transition-all hover:border-gray-300 dark:hover:border-gray-700">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Heutige Termine</h3>
                            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">
                                {format(new Date(), 'EEEE, dd. MMMM', { locale: de })}
                            </p>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-[10px] font-bold uppercase tracking-tight rounded-md shadow-xs">
                        {todayEvents.length} Gesamt
                    </span>
                </div>

                <div className="flex-1 p-6 space-y-4 max-h-[440px] overflow-y-auto custom-scrollbar">
                    {todayEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                                <Calendar className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 italic">Keine Termine für heute geplant</p>
                        </div>
                    ) : (
                        todayEvents.map((event) => {
                            const Icon = getEventIcon(event.type);
                            return (
                                <div
                                    key={event.id}
                                    className="relative flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all hover:shadow-md cursor-pointer group"
                                >
                                    <Link href={`/admin/reservations/${event.id}`} className="absolute inset-0 z-0" />
                                    <div className={clsx(
                                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg relative z-10 border',
                                        event.type === 'pickup' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' :
                                            event.type === 'return' ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' :
                                                'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50'
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 min-w-0 relative z-10">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">{event.time}</span>
                                            <span className={clsx(
                                                'px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight rounded-md border',
                                                event.type === 'pickup' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' :
                                                    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50'
                                            )}>
                                                {event.type === 'pickup' ? 'Abholung' : 'Rückgabe'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{event.car}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{event.customer}</span>
                                            {event.location && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">📍 {event.location}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Maintenance Alerts */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-full transition-all hover:border-gray-300 dark:hover:border-gray-700">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-gray-400" />
                        <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Wartungserinnerungen</h3>
                            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">Anstehende Servicearbeiten</p>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-tight rounded-md border border-red-100 dark:border-red-800/50">
                        {maintenanceAlerts.filter(a => a.urgency === 'critical').length} Dringend
                    </span>
                </div>

                <div className="flex-1 p-6 space-y-4 max-h-[440px] overflow-y-auto custom-scrollbar">
                    {maintenanceAlerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                                <CheckCircle className="h-6 w-6 text-emerald-500" />
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 italic">Alle Fahrzeuge sind gewartet</p>
                        </div>
                    ) : (
                        maintenanceAlerts.map((alert) => {
                            const Icon = getMaintenanceIcon(alert.type);
                            const daysUntil = differenceInDays(alert.dueDate, new Date());

                            return (
                                <div
                                    key={alert.id}
                                    className={clsx(
                                        'flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md',
                                        getUrgencyStyles(alert.urgency)
                                    )}
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-black/20 border border-current opacity-60">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <p className="text-sm font-bold tracking-tight">{alert.car}</p>
                                            <span className={clsx(
                                                'px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight rounded-md shadow-xs border',
                                                daysUntil < 0 ? 'bg-red-500 text-white border-red-600' :
                                                    daysUntil <= 7 ? 'bg-amber-500 text-white border-amber-600' :
                                                        'bg-blue-500 text-white border-blue-600'
                                            )}>
                                                {daysUntil < 0 ? `${Math.abs(daysUntil)} Tage fällig` :
                                                    daysUntil === 0 ? 'Heute' :
                                                        `in ${daysUntil} Tagen`}
                                            </span>
                                        </div>

                                        <p className="text-xs font-semibold mb-1 opacity-90">{getMaintenanceLabel(alert.type)}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase opacity-60 font-bold">Kennzeichen</span>
                                                <span className="text-[11px] font-mono font-bold">{alert.plate}</span>
                                            </div>
                                            {alert.currentMileage && (
                                                <div className="flex flex-col border-l border-current border-opacity-10 pl-3">
                                                    <span className="text-[10px] uppercase opacity-60 font-bold">Laufleistung</span>
                                                    <span className="text-[11px] font-bold">{alert.currentMileage.toLocaleString('de-AT')} km</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50 rounded-b-xl">
                    <Link href="/admin/maintenance" className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors">
                        Komplette Wartungsliste <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
