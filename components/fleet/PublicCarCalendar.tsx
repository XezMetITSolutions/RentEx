'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameDay, 
    isWithinInterval, 
    isPast, 
    isToday, 
    startOfWeek, 
    endOfWeek,
    addDays,
    isBefore
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface PublicCarCalendarProps {
    rentals: { startDate: Date; endDate: Date }[];
    onDateSelect?: (start: Date, end: Date) => void;
    selectedStart?: Date | string;
    selectedEnd?: Date | string;
}

export default function PublicCarCalendar({ rentals, onDateSelect, selectedStart, selectedEnd }: PublicCarCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [dragStart, setDragStart] = useState<Date | null>(null);

    const nextMonth = addMonths(currentMonth, 1);

    const start = selectedStart ? new Date(selectedStart) : null;
    const end = selectedEnd ? new Date(selectedEnd) : null;

    // Reset selection dragging if user releases mouse anywhere on the window
    useEffect(() => {
        const handleMouseUp = () => {
            if (isSelecting) {
                setIsSelecting(false);
                if (dragStart && hoveredDate && onDateSelect) {
                    // Check booking conflicts
                    const hasConflict = bookedIntervals.some(interval => {
                        const s = new Date(interval.start);
                        s.setHours(0,0,0,0);
                        const e = new Date(interval.end);
                        e.setHours(0,0,0,0);
                        return s > dragStart && s < hoveredDate;
                    });
                    if (!hasConflict && !isBefore(hoveredDate, dragStart) && !isSameDay(hoveredDate, dragStart)) {
                        onDateSelect(dragStart, hoveredDate);
                    }
                }
            }
        };
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [isSelecting, dragStart, hoveredDate, onDateSelect]);

    // Parse rentals and check if a specific day is booked
    const bookedIntervals = useMemo(() => {
        return rentals.map(r => ({
            start: new Date(r.startDate),
            end: new Date(r.endDate)
        }));
    }, [rentals]);

    const isDayBooked = (date: Date) => {
        return bookedIntervals.some(interval => {
            const d = new Date(date);
            d.setHours(0,0,0,0);
            const s = new Date(interval.start);
            s.setHours(0,0,0,0);
            const e = new Date(interval.end);
            e.setHours(0,0,0,0);
            return d >= s && d <= e;
        });
    };

    const handleDateMouseDown = (date: Date) => {
        if (isDayBooked(date) || (isPast(date) && !isToday(date))) return;
        setIsSelecting(true);
        setDragStart(date);
        setHoveredDate(date);
        if (onDateSelect) {
            onDateSelect(date, addDays(date, 1));
        }
    };

    const handleDateMouseEnter = (date: Date) => {
        if (!isSelecting || !dragStart) return;
        if (isDayBooked(date) || (isPast(date) && !isToday(date))) return;
        
        // Prevent selecting backwards
        if (isBefore(date, dragStart)) return;

        // Check if there is any booking conflict in between dragStart and hovered date
        const hasConflict = bookedIntervals.some(interval => {
            const s = new Date(interval.start);
            s.setHours(0,0,0,0);
            return s > dragStart && s < date;
        });

        if (!hasConflict) {
            setHoveredDate(date);
        }
    };

    const handleDateClick = (date: Date) => {
        // Fallback for simple clicks without dragging
        if (isDayBooked(date) || (isPast(date) && !isToday(date))) return;

        if (!start || (start && end)) {
            if (onDateSelect) onDateSelect(date, addDays(date, 1));
        } else {
            if (isBefore(date, start)) {
                if (onDateSelect) onDateSelect(date, addDays(date, 1));
            } else {
                const hasBookingConflict = bookedIntervals.some(interval => {
                    const s = new Date(interval.start);
                    s.setHours(0,0,0,0);
                    return s > start && s < date;
                });

                if (hasBookingConflict) {
                    if (onDateSelect) onDateSelect(date, addDays(date, 1));
                } else {
                    if (onDateSelect) onDateSelect(start, date);
                }
            }
        }
    };

    // Touch event helpers
    const handleTouchStart = (e: React.TouchEvent, date: Date) => {
        if (isDayBooked(date) || (isPast(date) && !isToday(date))) return;
        setDragStart(date);
        setHoveredDate(date);
        setIsSelecting(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSelecting || !dragStart) return;
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!element) return;
        
        const dayStr = element.getAttribute('data-day');
        if (dayStr) {
            const date = new Date(dayStr);
            if (isDayBooked(date) || (isPast(date) && !isToday(date)) || isBefore(date, dragStart)) return;

            const hasConflict = bookedIntervals.some(interval => {
                const s = new Date(interval.start);
                s.setHours(0,0,0,0);
                return s > dragStart && s < date;
            });

            if (!hasConflict) {
                setHoveredDate(date);
            }
        }
    };

    const handleTouchEnd = () => {
        if (isSelecting) {
            setIsSelecting(false);
            if (dragStart && hoveredDate && onDateSelect) {
                if (!isBefore(hoveredDate, dragStart)) {
                    onDateSelect(dragStart, hoveredDate);
                }
            }
        }
    };

    const renderMonthDays = (monthDate: Date) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthStart);
        const startDateCycle = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDateCycle = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const days = eachDayOfInterval({ start: startDateCycle, end: endDateCycle });
        const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

        return (
            <div className="flex-1 min-w-[280px]">
                <h3 className="text-center font-bold text-gray-900 dark:text-white capitalize mb-4">
                    {format(monthDate, 'MMMM yyyy', { locale: de })}
                </h3>

                {/* Weekdays Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {weekDays.map(wd => (
                        <div key={wd} className="text-xs font-semibold text-gray-400 py-1">
                            {wd}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => {
                        const isCurrentMonth = format(day, 'M') === format(monthDate, 'M');
                        const isBooked = isDayBooked(day);
                        const isPastDay = isPast(day) && !isToday(day);
                        const isDisabled = isBooked || isPastDay;
                        
                        const isSelectedStart = start ? isSameDay(day, start) : false;
                        const isSelectedEnd = end ? isSameDay(day, end) : false;
                        
                        let isInSelectionRange = false;
                        if (isSelecting && dragStart) {
                            if (hoveredDate && !isBefore(day, dragStart) && !isBefore(hoveredDate, day)) {
                                isInSelectionRange = true;
                            }
                        } else if (start) {
                            if (end) {
                                isInSelectionRange = isWithinInterval(day, { start, end });
                            }
                        }

                        // Determine styles
                        let btnClass = "relative w-full aspect-square rounded-xl text-xs font-semibold flex items-center justify-center transition-all select-none ";
                        
                        if (!isCurrentMonth) {
                            btnClass += "text-gray-300 dark:text-zinc-700 pointer-events-none opacity-40 ";
                        } else if (isDisabled) {
                            btnClass += "text-gray-400 dark:text-zinc-500 line-through bg-gray-100/50 dark:bg-zinc-800/20 cursor-not-allowed ";
                            if (isBooked) {
                                btnClass += "border border-red-500/20 text-red-500/80 ";
                            }
                        } else if (isSelectedStart || (isSelecting && dragStart && isSameDay(day, dragStart))) {
                            btnClass += "bg-red-600 text-white shadow-md shadow-red-500/30 scale-105 z-10 ";
                        } else if (isSelectedEnd || (isSelecting && hoveredDate && isSameDay(day, hoveredDate))) {
                            btnClass += "bg-red-600 text-white shadow-md shadow-red-500/30 scale-105 z-10 ";
                        } else if (isInSelectionRange) {
                            btnClass += "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 ";
                        } else if (isToday(day)) {
                            btnClass += "border border-gray-400 dark:border-zinc-500 text-gray-900 dark:text-white ";
                        } else {
                            btnClass += "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/80 ";
                        }

                        return (
                            <button
                                key={day.toString()}
                                type="button"
                                data-day={day.toISOString()}
                                disabled={isDisabled || !isCurrentMonth}
                                onMouseDown={() => handleDateMouseDown(day)}
                                onMouseEnter={() => handleDateMouseEnter(day)}
                                onClick={() => handleDateClick(day)}
                                onTouchStart={(e) => handleTouchStart(e, day)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                className={btnClass}
                            >
                                <span>{format(day, 'd')}</span>
                                {isBooked && isCurrentMonth && (
                                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-zinc-900/30 rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-xl shadow-black/5">
            {/* Header controls */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-sm font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-2">
                    Datum Auswählen
                </span>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-600 dark:text-white transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Double Calendar Layout */}
            <div className="p-6 flex flex-col md:flex-row gap-8 overflow-x-auto justify-center select-none">
                {renderMonthDays(currentMonth)}
                {renderMonthDays(nextMonth)}
            </div>

            {/* Legend & Instructions */}
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-gray-500 dark:text-zinc-400">Belegt</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-transparent" />
                    <span className="text-gray-500 dark:text-zinc-400">Verfügbar</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                    <span className="text-gray-500 dark:text-zinc-400">Ausgewählt</span>
                </div>
                <div className="ml-auto flex items-center gap-1 text-gray-400 italic font-medium">
                    <Info className="w-3.5 h-3.5" />
                    <span>Ziehen oder Klicken zum Auswählen</span>
                </div>
            </div>
        </div>
    );
}
