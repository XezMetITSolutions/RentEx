import prisma from '@/lib/prisma';
import { Calendar, AlertTriangle, CheckCircle, Clock, Car, Wrench, Droplet, CircleDot } from 'lucide-react';
import { format, addDays, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { clsx } from 'clsx';

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

async function getTodayEvents() {
    const today = new Date();
    const startDay = startOfDay(today);
    const endDay = endOfDay(today);

    const rentals = await prisma.rental.findMany({
        where: {
            OR: [
                {
                    startDate: {
                        gte: startDay,
                        lte: endDay
                    },
                    status: 'Pending'
                },
                {
                    endDate: {
                        gte: startDay,
                        lte: endDay
                    },
                    status: 'Active'
                }
            ]
        },
        include: {
            car: true,
            customer: true,
            pickupLocation: true,
            returnLocation: true
        },
        orderBy: {
            startDate: 'asc'
        }
    });

    return rentals.map(rental => {
        const isPickup = rental.startDate >= startDay && rental.startDate <= endDay;
        // Access name safely
        const locName = isPickup
            ? rental.pickupLocation?.name
            : rental.returnLocation?.name;

        return {
            id: rental.id,
            type: isPickup ? 'pickup' as const : 'return' as const,
            time: format(isPickup ? rental.startDate : rental.endDate, 'HH:mm'),
            car: `${rental.car.brand} ${rental.car.model}`,
            customer: `${rental.customer.firstName} ${rental.customer.lastName}`,
            location: locName, // Use the name string
            status: 'upcoming' as const
        };
    });
}

async function getMaintenanceAlerts() {
    const cars = await prisma.car.findMany({
        where: {
            isActive: true
        }
    });

    const alerts: MaintenanceAlert[] = [];
    const today = new Date();

    for (const car of cars) {
        // Oil change alert
        if (car.nextOilChange) {
            const daysUntil = differenceInDays(car.nextOilChange, today);
            if (daysUntil <= 30) {
                alerts.push({
                    id: car.id * 10 + 1,
                    car: `${car.brand} ${car.model}`,
                    plate: car.plate,
                    type: 'oil',
                    dueDate: car.nextOilChange,
                    urgency: daysUntil < 0 ? 'critical' : daysUntil <= 7 ? 'warning' : 'info',
                    lastService: car.lastOilChange || undefined,
                    currentMileage: car.currentMileage || undefined
                });
            }
        }

        // Inspection alert
        if (car.nextInspection) {
            const daysUntil = differenceInDays(car.nextInspection, today);
            if (daysUntil <= 30) {
                alerts.push({
                    id: car.id * 10 + 2,
                    car: `${car.brand} ${car.model}`,
                    plate: car.plate,
                    type: 'inspection',
                    dueDate: car.nextInspection,
                    urgency: daysUntil < 0 ? 'critical' : daysUntil <= 7 ? 'warning' : 'info',
                    lastService: car.lastServiceDate || undefined,
                    currentMileage: car.currentMileage || undefined
                });
            }
        }

        // Vignette alert
        if (car.vignetteValidUntil) {
            const daysUntil = differenceInDays(car.vignetteValidUntil, today);
            if (daysUntil <= 30) {
                alerts.push({
                    id: car.id * 10 + 3,
                    car: `${car.brand} ${car.model}`,
                    plate: car.plate,
                    type: 'vignette',
                    dueDate: car.vignetteValidUntil,
                    urgency: daysUntil < 0 ? 'critical' : daysUntil <= 7 ? 'warning' : 'info',
                    currentMileage: car.currentMileage || undefined
                });
            }
        }

        // Tire change alert (if last tire change was more than 6 months ago)
        if (car.lastTireChange) {
            const daysSinceChange = differenceInDays(today, car.lastTireChange);
            if (daysSinceChange >= 150) {
                alerts.push({
                    id: car.id * 10 + 4,
                    car: `${car.brand} ${car.model}`,
                    plate: car.plate,
                    type: 'tire',
                    dueDate: addDays(car.lastTireChange, 180),
                    urgency: daysSinceChange >= 180 ? 'warning' : 'info',
                    lastService: car.lastTireChange,
                    currentMileage: car.currentMileage || undefined
                });
            }
        }
    }

    // Sort by urgency and date
    return alerts.sort((a, b) => {
        const urgencyOrder = { critical: 0, warning: 1, info: 2 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
            return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return a.dueDate.getTime() - b.dueDate.getTime();
    });
}

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
            case 'inspection': return 'TÜV/Inspektion';
            case 'vignette': return 'Vignette';
            default: return 'Wartung';
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'warning': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            default: return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Schedule */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Heutige Termine</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {format(new Date(), 'EEEE, dd. MMMM yyyy', { locale: de })}
                                </p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full">
                            {todayEvents.length} Termine
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
                    {todayEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">Keine Termine für heute</p>
                        </div>
                    ) : (
                        todayEvents.map((event) => {
                            const Icon = getEventIcon(event.type);
                            return (
                                <div
                                    key={event.id}
                                    className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <div className={clsx(
                                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                                        event.type === 'pickup' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                                            event.type === 'return' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                                                'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{event.time}</span>
                                            <span className={clsx(
                                                'px-2 py-0.5 text-xs font-medium rounded-full',
                                                event.type === 'pickup' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                            )}>
                                                {event.type === 'pickup' ? 'Abholung' : 'Rückgabe'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{event.car}</p>
                                        {event.customer && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kunde: {event.customer}</p>
                                        )}
                                        {event.location && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">📍 {event.location}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Maintenance Alerts */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Wartungserinnerungen</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Anstehende Servicearbeiten</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-semibold rounded-full">
                            {maintenanceAlerts.filter(a => a.urgency === 'critical').length} Dringend
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
                    {maintenanceAlerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <CheckCircle className="h-12 w-12 text-green-300 dark:text-green-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400">Alle Wartungen aktuell</p>
                        </div>
                    ) : (
                        maintenanceAlerts.map((alert) => {
                            const Icon = getMaintenanceIcon(alert.type);
                            const daysUntil = differenceInDays(alert.dueDate, new Date());

                            return (
                                <div
                                    key={alert.id}
                                    className={clsx(
                                        'flex items-start gap-4 p-4 rounded-lg border transition-colors',
                                        getUrgencyColor(alert.urgency)
                                    )}
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/50 dark:bg-black/20">
                                        <Icon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold">{alert.car}</p>
                                            <span className={clsx(
                                                'px-2 py-0.5 text-xs font-bold rounded-full',
                                                daysUntil < 0 ? 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100' :
                                                    daysUntil <= 7 ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100' :
                                                        'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100'
                                            )}>
                                                {daysUntil < 0 ? `${Math.abs(daysUntil)} Tage überfällig` :
                                                    daysUntil === 0 ? 'Heute' :
                                                        `in ${daysUntil} Tagen`}
                                            </span>
                                        </div>

                                        <p className="text-sm font-medium mb-1">{getMaintenanceLabel(alert.type)}</p>
                                        <p className="text-xs opacity-75">Kennzeichen: {alert.plate}</p>

                                        {alert.lastService && (
                                            <p className="text-xs opacity-75 mt-1">
                                                Letzter Service: {format(alert.lastService, 'dd.MM.yyyy', { locale: de })}
                                            </p>
                                        )}

                                        {alert.currentMileage && (
                                            <p className="text-xs opacity-75">
                                                Kilometerstand: {alert.currentMileage.toLocaleString('de-DE')} km
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3">
                    <a href="/admin/maintenance" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                        Alle Wartungen anzeigen →
                    </a>
                </div>
            </div>
        </div>
    );
}
