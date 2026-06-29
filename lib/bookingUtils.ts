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
