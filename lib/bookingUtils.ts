import { fromZonedTime } from 'date-fns-tz';
import { BUSINESS, OPENING_HOURS } from './config';

/**
 * Turns a booking date ("2026-11-10") and time ("10:00") into the instant they
 * mean in Feldkirch. Plain `new Date("…T10:00")` would use the runtime's zone,
 * which is UTC on Cloudflare Workers and shifts every booking by 1–2 hours.
 */
export function parseBookingDateTime(dateStr: string, timeStr: string): Date {
    const time = /^\d{2}:\d{2}$/.test(timeStr) ? timeStr : '10:00';
    return fromZonedTime(`${dateStr}T${time}:00`, BUSINESS.TIME_ZONE);
}

/** 2 hours past a full day still count as that day; anything more is another day. Minimum 1. */
export function chargeableDaysBetween(start: Date, end: Date): number {
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return 1;
    const totalHours = diffMs / (1000 * 60 * 60);
    const fullDays = Math.floor(totalHours / 24);
    const extraHours = totalHours % 24;
    return Math.max(1, extraHours > 2 ? fullDays + 1 : fullDays);
}

export function calculateChargeableDays(startDateStr: string, startTimeStr: string, endDateStr: string, endTimeStr: string): number {
    return chargeableDaysBetween(parseBookingDateTime(startDateStr, startTimeStr), parseBookingDateTime(endDateStr, endTimeStr));
}

/** Weekday (0 = Sunday) of a "YYYY-MM-DD" date, independent of the runtime's zone. */
function weekdayOf(dateStr: string): number {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, (m || 1) - 1, d || 1)).getUTCDay();
}

export function getOpeningHours(dateStr: string) {
    return OPENING_HOURS[weekdayOf(dateStr)] ?? null;
}

export function isOutsideOpeningHours(dateStr: string, timeStr: string): boolean {
    const hours = getOpeningHours(dateStr);
    if (!hours) return true;
    return timeStr < hours.open || timeStr > hours.close;
}
