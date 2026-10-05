/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
'use client';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CalendarDays, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';

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
        carBrand?: string;
        carModel?: string;
        carPlate?: string;
        customerName?: string;
        status: string;
        totalAmount?: number;
    };
}

interface ReservationCalendarProps {
    rentals?: any[];
}

export default function ReservationCalendar({ rentals = [] }: ReservationCalendarProps) {
    const router = useRouter();
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    // Map real rentals from DB to CalendarEvent
    const events: CalendarEvent[] = useMemo(() => {
        if (!rentals || rentals.length === 0) return [];

        return rentals.map((r) => {
            const customerName = `${r.customer?.firstName || ''} ${r.customer?.lastName || ''}`.trim() || 'Kunde';
            const carInfo = r.car ? `${r.car.brand} ${r.car.model}` : 'Fahrzeug';
            const plate = r.car?.plate ? `(${r.car.plate})` : '';

            return {
                id: r.id,
                title: `${carInfo} ${plate} · ${customerName}`,
                start: new Date(r.startDate),
                end: new Date(r.endDate),
                resource: {
                    carBrand: r.car?.brand,
                    carModel: r.car?.model,
                    carPlate: r.car?.plate,
                    customerName,
                    status: r.status || 'Active',
                    totalAmount: r.totalAmount ? Number(r.totalAmount) : 0
                }
            };
        });
    }, [rentals]);

    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = '#3B82F6';
        let borderColor = '#2563EB';

        if (event.resource?.status === 'Completed') {
            backgroundColor = '#64748B';
            borderColor = '#475569';
        } else if (event.resource?.status === 'Pending') {
            backgroundColor = '#F59E0B';
            borderColor = '#D97706';
        } else if (event.resource?.status === 'Active') {
            backgroundColor = '#10B981';
            borderColor = '#059669';
        } else if (event.resource?.status === 'Cancelled') {
            backgroundColor = '#EF4444';
            borderColor = '#DC2626';
        }

        return {
            style: {
                backgroundColor,
                borderLeft: `4px solid ${borderColor}`,
                borderRadius: '6px',
                opacity: 0.95,
                color: 'white',
                borderTop: '0',
                borderRight: '0',
                borderBottom: '0',
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                padding: '3px 6px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }
        };
    };

    return (
        <div className="space-y-4">
            {/* View Selector & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hm-rule">
                <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-hm-accent" />
                    <div>
                        <h2 className="text-base font-bold text-hm-ink">Reservierungskalender</h2>
                        <p className="text-xs text-hm-muted">
                            Klicken Sie auf eine Reservierung, um Details aufzurufen ({events.length} Buchungen).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-hm-paper-2 rounded-[var(--hm-radius-input)] p-1 border border-hm-rule">
                    <button
                        onClick={() => setView('month')}
                        className={clsx(
                            "px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                            view === 'month'
                                ? "bg-hm-paper text-hm-ink shadow-xs"
                                : "text-hm-muted hover:text-hm-ink"
                        )}
                    >
                        Monat
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={clsx(
                            "px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                            view === 'week'
                                ? "bg-hm-paper text-hm-ink shadow-xs"
                                : "text-hm-muted hover:text-hm-ink"
                        )}
                    >
                        Woche
                    </button>
                    <button
                        onClick={() => setView('day')}
                        className={clsx(
                            "px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                            view === 'day'
                                ? "bg-hm-paper text-hm-ink shadow-xs"
                                : "text-hm-muted hover:text-hm-ink"
                        )}
                    >
                        Tag
                    </button>
                </div>
            </div>

            {/* Calendar */}
            <div className="calendar-container h-[650px] w-full">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    view={view}
                    date={currentDate}
                    onNavigate={(newDate) => setCurrentDate(newDate)}
                    onView={(newView) => setView(newView as 'month' | 'week' | 'day')}
                    onSelectEvent={(event) => {
                        router.push(`/admin/reservations/${event.id}`);
                    }}
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
                        event: 'Buchung',
                        noEventsInRange: 'Keine Reservierungen in diesem Zeitraum',
                        showMore: (total) => `+ ${total} mehr`,
                    }}
                />
            </div>

            {/* Status Legend */}
            <div className="pt-3 border-t border-hm-rule flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="font-semibold text-hm-ink">Legende:</span>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-hm-muted">Aktiv ({rentals.filter(r => r.status === 'Active').length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-hm-muted">Ausstehend ({rentals.filter(r => r.status === 'Pending').length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-500" />
                        <span className="text-hm-muted">Abgeschlossen ({rentals.filter(r => r.status === 'Completed').length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-hm-muted">Storniert ({rentals.filter(r => r.status === 'Cancelled').length})</span>
                    </div>
                </div>

                <div className="text-[11px] text-hm-muted italic">
                    💡 Tipp: Klick auf einen Eintrag öffnet die Buchungsdetails.
                </div>
            </div>

            {/* Custom Hallmark-adapted styles for react-big-calendar */}
            <style jsx global>{`
                .rbc-calendar {
                    font-family: inherit;
                    color: inherit;
                }
                .rbc-header {
                    padding: 10px 4px;
                    font-weight: 700;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--hm-ink);
                    border-bottom: 1px solid var(--hm-rule) !important;
                }
                .rbc-month-view, .rbc-time-view {
                    border: 1px solid var(--hm-rule) !important;
                    border-radius: var(--hm-radius-card);
                    overflow: hidden;
                    background-color: var(--hm-paper);
                }
                .rbc-day-bg + .rbc-day-bg, .rbc-month-row + .rbc-month-row {
                    border-color: var(--hm-rule) !important;
                }
                .rbc-today {
                    background-color: var(--hm-paper-2) !important;
                }
                .rbc-off-range-bg {
                    background-color: var(--hm-paper-2) !important;
                    opacity: 0.4;
                }
                .rbc-date-cell {
                    padding: 4px 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--hm-ink);
                }
                .rbc-off-range .rbc-button-link {
                    color: var(--hm-muted) !important;
                }
                .rbc-event {
                    margin: 1.5px 3px !important;
                    transition: transform 0.15s ease, filter 0.15s ease;
                }
                .rbc-event:hover {
                    transform: scale(1.01);
                    filter: brightness(1.08);
                }
                .rbc-toolbar {
                    padding: 8px 0 16px 0;
                    margin-bottom: 8px;
                }
                .rbc-toolbar button {
                    color: var(--hm-ink);
                    padding: 6px 14px;
                    border-radius: var(--hm-radius-input);
                    border: 1px solid var(--hm-rule);
                    background: var(--hm-paper);
                    font-size: 12px;
                    font-weight: 600;
                    transition: all 0.15s ease;
                }
                .rbc-toolbar button:hover {
                    background: var(--hm-paper-2);
                    border-color: var(--hm-muted);
                }
                .rbc-toolbar button.rbc-active {
                    background: var(--hm-accent);
                    color: white;
                    border-color: var(--hm-accent);
                }
                .rbc-toolbar-label {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--hm-ink);
                }
            `}</style>
        </div>
    );
}
