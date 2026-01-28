'use client';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';

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

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    resource?: {
        carId: number;
        customerId: number;
        status: string;
    };
}

// Mock events - In production, fetch from API
const mockEvents: CalendarEvent[] = [
    {
        id: 1,
        title: 'BMW 320i - Ahmet Yılmaz',
        start: new Date(2026, 0, 18),
        end: new Date(2026, 0, 25),
        resource: { carId: 1, customerId: 1, status: 'Active' }
    },
    {
        id: 2,
        title: 'Mercedes C200 - Ayşe Demir',
        start: new Date(2026, 0, 22),
        end: new Date(2026, 0, 25),
        resource: { carId: 2, customerId: 2, status: 'Pending' }
    },
    {
        id: 3,
        title: 'Renault Clio - Mehmet Kaya',
        start: new Date(2026, 0, 10),
        end: new Date(2026, 0, 15),
        resource: { carId: 3, customerId: 3, status: 'Completed' }
    },
];

export default function ReservationCalendar() {
    const [events] = useState<CalendarEvent[]>(mockEvents);
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');

    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = '#3B82F6';

        if (event.resource?.status === 'Completed') {
            backgroundColor = '#6B7280';
        } else if (event.resource?.status === 'Pending') {
            backgroundColor = '#F59E0B';
        } else if (event.resource?.status === 'Active') {
            backgroundColor = '#10B981';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '13px',
                fontWeight: '500',
            }
        };
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Reservierungskalender</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('month')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Monat
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Woche
                    </button>
                    <button
                        onClick={() => setView('day')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Tag
                    </button>
                </div>
            </div>

            <div className="calendar-container" style={{ height: '600px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    view={view}
                    onView={(newView) => setView(newView as 'month' | 'week' | 'day')}
                    eventPropGetter={eventStyleGetter}
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
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-gray-600">Aktiv</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-amber-500"></div>
                    <span className="text-gray-600">Ausstehend</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-500"></div>
                    <span className="text-gray-600">Abgeschlossen</span>
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
          color: #374151;
          border-bottom: 2px solid #E5E7EB;
        }
        .rbc-today {
          background-color: #EFF6FF;
        }
        .rbc-off-range-bg {
          background-color: #F9FAFB;
        }
        .rbc-event {
          padding: 4px 6px;
        }
        .rbc-event:focus {
          outline: 2px solid #3B82F6;
        }
        .rbc-toolbar {
          padding: 12px 0;
          margin-bottom: 16px;
        }
        .rbc-toolbar button {
          color: #374151;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          background: white;
          font-weight: 500;
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover {
          background: #F3F4F6;
        }
        .rbc-toolbar button.rbc-active {
          background: #3B82F6;
          color: white;
          border-color: #3B82F6;
        }
      `}</style>
        </div>
    );
}
