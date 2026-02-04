'use client';

import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const locales = {
    'de': de,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface RentalEvent {
    id: number;
    car: {
        brand: string;
        model: string;
        plate: string;
    };
    customer: {
        firstName: string;
        lastName: string;
    };
    startDate: Date;
    endDate: Date;
    status: string;
}

export default function ReservationCalendar({ rentals }: { rentals: any[] }) {
    const router = useRouter();
    const [view, setView] = useState<View>('month');

    // Map Prisma rentals to Calendar events
    const events = rentals.map(rental => ({
        id: rental.id,
        title: `${rental.car.brand} ${rental.car.model} - ${rental.customer.firstName} ${rental.customer.lastName}`,
        start: new Date(rental.startDate),
        end: new Date(rental.endDate),
        resource: {
            carPlate: rental.car.plate,
            status: rental.status
        }
    }));

    const eventStyleGetter = (event: any) => {
        let backgroundColor = '#3B82F6'; // blue-600

        if (event.resource?.status === 'Completed') {
            backgroundColor = '#52525b'; // zinc-600
        } else if (event.resource?.status === 'Pending') {
            backgroundColor = '#FB923C'; // orange-400
        } else if (event.resource?.status === 'Active') {
            backgroundColor = '#22c55e'; // green-500
        } else if (event.resource?.status === 'Cancelled') {
            backgroundColor = '#ef4444'; // red-500
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
            }
        };
    };

    const handleSelectEvent = (event: any) => {
        router.push(`/admin/reservations/${event.id}`);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Kalenderübersicht</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('month')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === 'month' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                    >
                        Monat
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === 'week' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                    >
                        Woche
                    </button>
                    <button
                        onClick={() => setView('day')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === 'day' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                    >
                        Tag
                    </button>
                </div>
            </div>

            <div className="calendar-container h-[600px] text-zinc-900 dark:text-zinc-100">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    view={view}
                    onView={(newView) => setView(newView)}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    culture="de"
                    messages={{
                        next: 'Weiter',
                        previous: 'Zurück',
                        today: 'Heute',
                        month: 'Monat',
                        week: 'Woche',
                        day: 'Tag',
                        agenda: 'Agenda',
                        date: 'Datum',
                        time: 'Zeit',
                        event: 'Ereignis',
                        noEventsInRange: 'Keine Reservierungen in diesem Zeitraum',
                        showMore: (total) => `+ ${total} mehr`,
                    }}
                />
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-zinc-600 dark:text-zinc-400">Aktiv</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                    <span className="text-zinc-600 dark:text-zinc-400">Ausstehend/Reserviert</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
                    <span className="text-zinc-600 dark:text-zinc-400">Abgeschlossen</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-zinc-600 dark:text-zinc-400">Storniert</span>
                </div>
            </div>

            <style jsx global>{`
        .rbc-calendar {
            font-family: inherit;
        }
        .rbc-header {
            padding: 12px 4px;
            font-weight: 600;
            font-size: 14px;
        }
        .rbc-event {
            padding: 2px 6px;
        }
        .rbc-toolbar {
            margin-bottom: 16px;
        }
        .rbc-toolbar button {
            border-radius: 6px;
        }
        
        /* Dark Mode Overrides */
        .dark .rbc-off-range-bg {
            background-color: #18181b; /* zinc-950 */
        }
        .dark .rbc-today {
            background-color: #27272a; /* zinc-800 */
        }
        .dark .rbc-header {
            color: #d4d4d8; /* zinc-300 */
            border-bottom-color: #3f3f46; /* zinc-700 */
        }
        .dark .rbc-month-view, 
        .dark .rbc-time-view,
        .dark .rbc-agenda-view {
            border-color: #3f3f46; /* zinc-700 */
        }
        .dark .rbc-day-bg + .rbc-day-bg,
        .dark .rbc-month-row + .rbc-month-row {
            border-color: #3f3f46;
        }
        .dark .rbc-day-slot .rbc-time-slot {
            border-color: #3f3f46;
        }
        .dark .rbc-timeslot-group {
            border-color: #3f3f46;
        }
        .dark .rbc-time-content > * + * > * {
            border-color: #3f3f46;
        }
        .dark .rbc-time-header-content {
            border-color: #3f3f46;
        }
        .dark .rbc-toolbar button {
            color: #d4d4d8;
            border-color: #3f3f46;
        }
        .dark .rbc-toolbar button:hover {
            background-color: #27272a;
        }
        .dark .rbc-toolbar button.rbc-active {
            background-color: #fafafa;
            color: #000;
        }
        .dark .rbc-show-more {
            color: #d4d4d8;
        }
      `}</style>
        </div>
    );
}
