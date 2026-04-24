'use client';

import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import { de } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Wrench, History, ClipboardList } from 'lucide-react';
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

interface CarCalendarProps {
    rentals: any[];
    maintenance: any[];
    tasks: any[];
}

interface CalendarEvent {
    id: string | number;
    title: string;
    start: Date;
    end: Date;
    type: 'rental' | 'maintenance' | 'task';
    status?: string;
    resource?: any;
}

export default function CarCalendar({ rentals, maintenance, tasks, carId }: { rentals: any[], maintenance: any[], tasks: any[], carId: number }) {
    const [view, setView] = useState<any>(Views.MONTH);
    const [date, setDate] = useState(new Date());
    const router = useRouter();

    const events = useMemo(() => {
        const rentalEvents: CalendarEvent[] = rentals.map(r => ({
            id: `rental-${r.id}`,
            title: `Miete: ${r.customer.firstName} ${r.customer.lastName}`,
            start: new Date(r.startDate),
            end: new Date(r.endDate),
            type: 'rental',
            status: r.status,
            resource: r
        }));

        const maintenanceEvents: CalendarEvent[] = maintenance.map(m => ({
            id: `maintenance-${m.id}`,
            title: `Wartung: ${m.maintenanceType}`,
            start: new Date(m.performedDate),
            end: m.nextDueDate ? new Date(m.nextDueDate) : addHours(new Date(m.performedDate), 4),
            type: 'maintenance',
            resource: m
        }));

        const taskEvents: CalendarEvent[] = tasks.map(t => ({
            id: `task-${t.id}`,
            title: `Aufgabe: ${t.title}`,
            start: new Date(t.dueDate || t.createdAt),
            end: addHours(new Date(t.dueDate || t.createdAt), 2),
            type: 'task',
            status: t.status,
            resource: t
        }));

        return [...rentalEvents, ...maintenanceEvents, ...taskEvents];
    }, [rentals, maintenance, tasks]);

    const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
        const startStr = format(start, 'yyyy-MM-dd');
        const endStr = format(end, 'yyyy-MM-dd');
        router.push(`/admin/reservations/new?carId=${carId}&startDate=${startStr}&endDate=${endStr}`);
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        if (event.type === 'rental') {
            router.push(`/admin/reservations/${event.resource.id}`);
        }
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = '#3B82F6'; // Default blue

        if (event.type === 'maintenance') {
            backgroundColor = '#EF4444'; // Red for maintenance
        } else if (event.type === 'task') {
            backgroundColor = '#8B5CF6'; // Purple for tasks
        } else if (event.type === 'rental') {
            if (event.status === 'Completed') backgroundColor = '#6B7280'; // Gray
            else if (event.status === 'Pending') backgroundColor = '#F59E0B'; // Amber
            else if (event.status === 'Active') backgroundColor = '#10B981'; // Green
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                padding: '2px 5px'
            }
        };
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                    <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Fahrzeug-Kalender</h2>
                </div>
                <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <button
                        onClick={() => setView(Views.MONTH)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === Views.MONTH ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        Monat
                    </button>
                    <button
                        onClick={() => setView(Views.WEEK)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === Views.WEEK ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        Woche
                    </button>
                    <button
                        onClick={() => setView(Views.DAY)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === Views.DAY ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        Tag
                    </button>
                </div>
            </div>

            <div className="p-4" style={{ height: '600px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    view={view}
                    onView={(newView) => setView(newView)}
                    date={date}
                    onNavigate={(newDate) => setDate(newDate)}
                    eventPropGetter={eventStyleGetter}
                    selectable
                    onSelectSlot={handleSelectSlot}
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
                        noEventsInRange: 'Keine Einträge in diesem Zeitraum',
                        showMore: (total) => `+ ${total} mehr`,
                    }}
                    className="dark:text-zinc-300 font-sans"
                />
            </div>

            {/* Legend */}
            <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">Aktive Miete</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-500"></div>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">Ausstehend</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-500"></div>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">Abgeschlossen</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500"></div>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">Wartung</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-500"></div>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium">Aufgabe</span>
                </div>
            </div>

            <style jsx global>{`
                .rbc-calendar {
                    font-family: inherit;
                }
                .dark .rbc-off-range-bg {
                    background-color: rgba(24, 24, 27, 0.5);
                }
                .dark .rbc-today {
                    background-color: rgba(63, 63, 70, 0.3);
                }
                .dark .rbc-month-view, .dark .rbc-time-view, .dark .rbc-agenda-view {
                    border-color: #27272a;
                }
                .dark .rbc-day-bg, .dark .rbc-month-row, .dark .rbc-time-content, .dark .rbc-header {
                    border-color: #27272a !important;
                }
                .dark .rbc-header {
                    color: #a1a1aa;
                }
                .rbc-toolbar button {
                    color: inherit;
                    border: 1px solid #e4e4e7;
                }
                .dark .rbc-toolbar button {
                    border-color: #27272a;
                }
                .rbc-toolbar button:active, .rbc-toolbar button.rbc-active {
                    background-color: #f4f4f5;
                    box-shadow: none;
                }
                .dark .rbc-toolbar button:active, .dark .rbc-toolbar button.rbc-active {
                    background-color: #27272a;
                }
            `}</style>
        </div>
    );
}
