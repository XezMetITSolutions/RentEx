/**
 * Shared refusals for bookings and handovers: a car that cannot legally
 * finish the rental, a price Stripe cannot charge, and an odometer reading
 * that is almost certainly a typo.
 */
import { RENTAL_TERMS } from './config';

export function bookingRejectedReason(
    car: {
        dailyRate: unknown;
        insuranceValidUntil?: Date | null;
        nextInspection?: Date | null;
    },
    end: Date,
    days: number,
): string | null {
    if (!(Number(car.dailyRate) > 0)) {
        return 'Für dieses Fahrzeug ist kein gültiger Tagespreis hinterlegt.';
    }
    if (days > RENTAL_TERMS.MAX_RENTAL_DAYS) {
        return `Online sind höchstens ${RENTAL_TERMS.MAX_RENTAL_DAYS} Tage am Stück buchbar. Für längere Mieten rufen Sie uns bitte an.`;
    }
    if (car.insuranceValidUntil && new Date(car.insuranceValidUntil) < end) {
        return 'Die Versicherung dieses Fahrzeugs endet vor der Rückgabe.';
    }
    if (car.nextInspection && new Date(car.nextInspection) < end) {
        return 'Das Fahrzeug braucht vor Mietende eine §57a-Überprüfung und kann deshalb nicht reserviert werden.';
    }
    return null;
}

export function onlineAmountRejected(totalEur: number): string | null {
    if (Math.round(totalEur * 100) < RENTAL_TERMS.MIN_ONLINE_CENTS) {
        return 'Der Betrag ist zu niedrig für eine Kartenzahlung. Bitte wählen Sie Zahlung bei Abholung oder rufen Sie uns an.';
    }
    return null;
}

function assertReading(km: number, label: string): number {
    const rounded = Math.round(km);
    if (!Number.isFinite(rounded) || rounded <= 0 || rounded > 2_000_000) {
        throw new Error(`${label} ist unplausibel. Bitte den Tacho prüfen.`);
    }
    return rounded;
}

/** Pickup reading may sit slightly under the last known value (a previous typo), not hundreds of kilometres under it. */
export function assertPickupMileage(entered: number, lastKnown: number | null): number {
    const km = assertReading(entered, 'Abhol-Kilometerstand');
    if (lastKnown && lastKnown > 100 && km < lastKnown - 100) {
        throw new Error(
            `Der Kilometerstand (${km.toLocaleString('de-DE')}) liegt deutlich unter dem letzten Stand (${lastKnown.toLocaleString('de-DE')} km).`,
        );
    }
    return km;
}

export function assertReturnMileage(entered: number, pickupKm: number, days: number): number {
    const km = assertReading(entered, 'Rückgabe-Kilometerstand');
    if (km < pickupKm) {
        throw new Error(
            `Der Rückgabe-Kilometerstand (${km.toLocaleString('de-DE')} km) darf nicht geringer sein als der Start-Kilometerstand (${pickupKm.toLocaleString('de-DE')} km).`,
        );
    }
    const driven = km - pickupKm;
    const span = Math.max(1, days);
    if (driven / span > RENTAL_TERMS.MAX_KM_PER_DAY) {
        throw new Error(
            `Der Zählerstand springt um ${driven.toLocaleString('de-DE')} km. Das ist mehr als ${RENTAL_TERMS.MAX_KM_PER_DAY.toLocaleString('de-DE')} km pro Tag. Bitte das Foto prüfen.`,
        );
    }
    return km;
}
