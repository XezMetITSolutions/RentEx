export const AUTH_CONFIG = {
    CUSTOMER_SESSION_TTL: 60 * 60 * 24 * 30,
    ADMIN_SESSION_TTL: 60 * 60 * 12,
    MOBILE_CUSTOMER_TOKEN_TTL: 60 * 60 * 24 * 30,
    MOBILE_STAFF_TOKEN_TTL: 60 * 60 * 12,
    PASSWORD_SALT_LENGTH: 16,
    PASSWORD_KEY_LENGTH: 64,
    PASSWORD_SCRYPT_OPTS: { N: 16384, r: 8, p: 1 },
};

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
