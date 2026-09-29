import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { de } from "date-fns/locale";

/** All pickup/return times are entered in the rental office's local time. */
export const BUSINESS_TIME_ZONE = "Europe/Vienna";

/**
 * date-fns `format` in Vienna time. Use this for booking dates: server
 * rendering runs in UTC, so a plain `format` would show times 1–2 h early.
 */
export function formatBusinessDate(date: Date | string | number, pattern: string): string {
    return formatInTimeZone(date, BUSINESS_TIME_ZONE, pattern, { locale: de });
}

/**
 * Parses a "YYYY-MM-DD" date and "HH:MM" time as Vienna wall-clock time.
 * The server runtime (Cloudflare Workers) is UTC, so a plain `new Date()`
 * would shift every booking by one to two hours. Returns null when invalid.
 */
export function parseBookingDateTime(dateStr: string | null | undefined, timeStr: string | null | undefined): Date | null {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
    const date = fromZonedTime(`${dateStr}T${timeStr}:00`, BUSINESS_TIME_ZONE);
    return isNaN(date.getTime()) ? null : date;
}

/** Today's date ("YYYY-MM-DD") in the rental office's time zone. */
export function todayInBusinessTimeZone(): string {
    return new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TIME_ZONE }).format(new Date());
}

/**
 * Start (inclusive) and end (exclusive) of a Vienna calendar day as UTC
 * instants — today, or `offsetDays` later. Correct on 23/25-hour DST days.
 */
export function businessTodayBounds(offsetDays = 0): { start: Date; end: Date } {
    const dayAt = (offset: number) => {
        const d = new Date(`${todayInBusinessTimeZone()}T12:00:00Z`);
        d.setUTCDate(d.getUTCDate() + offset);
        return fromZonedTime(`${d.toISOString().slice(0, 10)}T00:00:00`, BUSINESS_TIME_ZONE);
    };
    return { start: dayAt(offsetDays), end: dayAt(offsetDays + 1) };
}

export function calculateChargeableDays(startDateStr: string, startTimeStr: string, endDateStr: string, endTimeStr: string): number {
    const start = new Date(`${startDateStr}T${startTimeStr}:00`);
    const end = new Date(`${endDateStr}T${endTimeStr}:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return 1;
    
    const totalHours = diffMs / (1000 * 60 * 60);
    const fullDays = Math.floor(totalHours / 24);
    const extraHours = totalHours % 24;
    
    // Grace period of 2 hours
    const chargeableDays = extraHours > 2 ? fullDays + 1 : fullDays;
    return Math.max(1, chargeableDays);
}

export function isOutsideOpeningHours(dateStr: string, timeStr: string): boolean {
    const date = new Date(dateStr);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const [hour, minute] = timeStr.split(':').map(Number);
    const timeVal = hour + minute / 60;
    
    if (day === 0) {
        // Sunday is closed
        return true;
    } else if (day === 6) {
        // Saturday: 09:00 - 15:00
        return timeVal < 9 || timeVal > 15;
    } else {
        // Monday - Friday: 08:00 - 18:00
        return timeVal < 8 || timeVal > 18;
    }
}
