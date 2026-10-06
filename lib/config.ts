/** Public origin of the site, used for canonical URLs, sitemap, emails and Stripe redirects. */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://rent-ex.at').replace(/\/$/, '');

export const AUTH_CONFIG = {
    CUSTOMER_SESSION_TTL: 60 * 60 * 24 * 30,
    ADMIN_SESSION_TTL: 60 * 60 * 12,
    MOBILE_CUSTOMER_TOKEN_TTL: 60 * 60 * 24 * 30,
    MOBILE_STAFF_TOKEN_TTL: 60 * 60 * 12,
    PASSWORD_SALT_LENGTH: 16,
    PASSWORD_KEY_LENGTH: 64,
    PASSWORD_SCRYPT_OPTS: { N: 16384, r: 8, p: 1 },
};

/** The rental business. Booking times are wall-clock times in this time zone. */
export const BUSINESS = {
    TIME_ZONE: 'Europe/Vienna',
    PHONE: '+43 660 9996800',
    PHONE_TEL: '+436609996800',
    PICKUP_ADDRESS: 'Illstraße 75a',
    PICKUP_POSTAL_CODE: '6800',
    PICKUP_CITY: 'Feldkirch',
} as const;

/**
 * Staffed opening hours per weekday (0 = Sunday). `null` = closed. Pickups and
 * returns outside these hours are handled as keyless self check-in/out.
 */
export const OPENING_HOURS: Record<number, { open: string; close: string } | null> = {
    0: null,
    1: { open: '08:00', close: '18:00' },
    2: { open: '08:00', close: '18:00' },
    3: { open: '08:00', close: '18:00' },
    4: { open: '08:00', close: '18:00' },
    5: { open: '08:00', close: '18:00' },
    6: { open: '09:00', close: '15:00' },
};

/** Unpaid online bookings release the car after this many minutes. Stripe requires ≥ 30. */
export const PENDING_PAYMENT_TTL_MINUTES = 30;

/** Fallback rental terms (from the AGB/FAQ) for cars without their own values. */
export const RENTAL_TERMS = {
    FUEL_POLICY: 'voll / voll',
    REFUEL_FEE_EUR: 18,
    EXTRA_KM_RANGE: '0,33 – 0,45 € / km',
    MIN_DRIVER_AGE: 18,
} as const;

export const FEES_CONFIG = {
    STRAFZETTEL_PROCESSING_FEE: 25.00,
};

export const STAFF_ROLES = {
    SUPERADMIN: 'SUPERADMIN',
    MANAGER: 'MANAGER',
    AGENT: 'AGENT',
    DRIVER: 'DRIVER',
} as const;

export const RENTAL_STATUS = {
    PENDING: 'Pending',
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
} as const;

export const MAINTENANCE_ALERT_THRESHOLDS = {
    OIL_CHANGE_DAYS: 30,
    OIL_CHANGE_WARNING: 7,
    INSPECTION_DAYS: 30,
    INSPECTION_WARNING: 7,
    VIGNETTE_DAYS: 30,
    VIGNETTE_WARNING: 7,
    TIRE_CHANGE_MONTHS: 6,
    TIRE_CHANGE_DAYS: 180,
    TIRE_CHANGE_WARNING_DAYS: 150,
} as const;

export type StaffRole = typeof STAFF_ROLES[keyof typeof STAFF_ROLES];
export type RentalStatus = typeof RENTAL_STATUS[keyof typeof RENTAL_STATUS];
