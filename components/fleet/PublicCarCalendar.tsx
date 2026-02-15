'use client';

import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState, useMemo } from 'react';

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

interface PublicCarCalendarProps {
    rentals: { startDate: Date; endDate: Date }[];
    onDateSelect?: (start: Date, end: Date) => void;
}

export default function PublicCarCalendar({ rentals, onDateSelect }: PublicCarCalendarProps) {
    const [view, setView] = useState<any>(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const events = useMemo(() => {
        return rentals.map((r, idx) => ({
            id: idx,
            title: 'Belegt',
            start: new Date(r.startDate),
            end: new Date(r.endDate),
            allDay: true
        }));
    }, [rentals]);

    const handleSelectSlot = ({ start, end }: { start: Date, end: Date }) => {
        if (onDateSelect) {
            // Adjust end date because react-big-calendar returns exclusive end date for multi-day selection
            // or sometimes it depends on the view. For Month view, usually exclusive.
            // Let's ensure we pass correct dates.
            // If it's a single day click, start == end (or close).
            // If drag, end is the day after.

            // Common pattern: treat as inclusive range for the app logic
            // But BigCalendar 'end' is exclusive 00:00 of next day.
            // So we subtract 1ms to get back to the previous day or keep as is depending on requirement.
            // Let's pass raw dates and let parent handle formatting/logic or normalize here.

            // Actually, for BookingWidget we likely want YYYY-MM-DD strings.
            // Let's just pass the Date objects.
            onDateSelect(start, end);
        }
    };

    const eventStyleGetter = () => {
        return {
            style: {
                backgroundColor: '#EF4444', // Red for busy
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 5px',
                textAlign: 'center' as const
            }
        };
    };

    return (
        <div className="bg-zinc-900/50 rounded-3xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <h2 className="font-semibold text-white">Verfügbarkeitskalender</h2>
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setView(Views.MONTH)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === Views.MONTH ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Monat
                    </button>
                    <button
                        onClick={() => setView(Views.WEEK)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === Views.WEEK ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                        Woche
                    </button>
                </div>
            </div>

            <div className="p-4" style={{ height: '500px' }}>
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
                        event: 'Status',
                        noEventsInRange: 'In diesem Zeitraum sind keine Buchungen vorhanden.',
                        showMore: (total) => `+ ${total} mehr`,
                    }}
                    className="public-calendar"
                />
            </div>

            <div className="px-6 py-3 bg-white/5 border-t border-white/10 flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500 opacity-80"></div>
                    <span className="text-gray-400">Belegt / Reserviert</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-zinc-800 border border-white/10"></div>
                    <span className="text-gray-400">Verfügbar</span>
                </div>
                <div className="ml-auto text-gray-500 italic">
                    * Klicken & Ziehen um Zeitraum zu wählen
                </div>
            </div>

            <style jsx global>{`
                .public-calendar .rbc-off-range-bg {
                    background-color: rgba(255, 255, 255, 0.02);
                }
                .public-calendar .rbc-today {
                    background-color: rgba(239, 68, 68, 0.1);
                }
                .public-calendar .rbc-month-view, 
                .public-calendar .rbc-time-view, 
                .public-calendar .rbc-agenda-view {
                    border-color: rgba(255, 255, 255, 0.1);
                    background: transparent;
                }
                .public-calendar .rbc-day-bg, 
                .public-calendar .rbc-month-row, 
                .public-calendar .rbc-time-content, 
                .public-calendar .rbc-header {
                    border-color: rgba(255, 255, 255, 0.1) !important;
                }
                .public-calendar .rbc-header {
                    color: #9ca3af;
                    padding: 10px;
                    font-size: 13px;
                }
                .public-calendar .rbc-button-link {
                    color: #e5e7eb;
                }
                .public-calendar .rbc-toolbar button {
                    color: #e5e7eb;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .public-calendar .rbc-toolbar button:active, 
                .public-calendar .rbc-toolbar button.rbc-active {
                    background-color: rgba(255, 255, 255, 0.1);
                    box-shadow: none;
                }
                .public-calendar .rbc-toolbar button:hover {
                    background-color: rgba(255, 255, 255, 0.05);
                }
                .public-calendar .rbc-event {
                    border: none;
                }
                .public-calendar .rbc-show-more {
                    color: #ef4444;
                    background: transparent;
                    font-weight: 600;
                }
                /* Selection Highlight */
                .public-calendar .rbc-slot-selection {
                    background-color: rgba(239, 68, 68, 0.3);
                    border: 1px solid rgba(239, 68, 68, 0.5);
                }
            `}</style>
        </div>
    );
}
