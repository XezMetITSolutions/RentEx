/**
 * Car statuses that customers may see and book. Whether a car is free for a
 * given period is decided by its rentals; "Rented"/"Reserved" only describe
 * the current moment and must not hide the car for later dates.
 */
export const BOOKABLE_CAR_STATUSES = ['Active', 'Rented', 'Reserved'];

/** Internal fleet data that must never be sent to the public site or app. */
const INTERNAL_CAR_FIELDS = [
    'vin',
    'chassisNumber',
    'insuranceCompany',
    'insurancePolicyNumber',
    'insuranceValidUntil',
    'purchasePrice',
    'purchaseDate',
    'purchaseMileage',
    'currentValue',
    'internalNotes',
    'damageHistory',
    'latitude',
    'longitude',
    'registrationDate',
    'nextInspection',
    'lastOilChange',
    'nextOilChange',
    'lastTireChange',
    'nextServiceDate',
    'lastServiceDate',
    'nextServiceKm',
    'vignetteValidUntil',
    'vignetteType',
] as const;

type InternalField = (typeof INTERNAL_CAR_FIELDS)[number];

/** Removes internal fleet data from a car before it leaves the server. */
export function toPublicCar<T extends object>(car: T): Omit<T, InternalField> {
    const copy = { ...car } as Record<string, unknown>;
    for (const field of INTERNAL_CAR_FIELDS) delete copy[field];
    return copy as Omit<T, InternalField>;
}
