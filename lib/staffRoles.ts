/**
 * Staff roles and admin-area permissions — single source of truth for the
 * sidebar (client) and the server-side guards.
 *
 * Roles are stored in German since scripts/migrate_staff_roles.ts; accounts
 * created earlier (or via scripts/make_admin.ts) may still carry the English
 * names, which are mapped here so they keep working.
 */
export const STAFF_ROLE = {
    ADMINISTRATOR: 'ADMINISTRATOR',
    FILIALLEITER: 'FILIALLEITER',
    MITARBEITER: 'MITARBEITER',
    FAHRER: 'FAHRER',
} as const;

export type StaffRoleName = (typeof STAFF_ROLE)[keyof typeof STAFF_ROLE];

const LEGACY_ROLES: Record<string, StaffRoleName> = {
    SUPERADMIN: 'ADMINISTRATOR',
    ADMIN: 'ADMINISTRATOR',
    MANAGER: 'FILIALLEITER',
    AGENT: 'MITARBEITER',
    DRIVER: 'FAHRER',
};

/** Maps legacy English role names to the current German ones. */
export function normalizeRole(role: string | null | undefined): string {
    if (!role) return '';
    const upper = role.toUpperCase();
    return LEGACY_ROLES[upper] ?? upper;
}

export const isAdministrator = (role: string | null | undefined) =>
    normalizeRole(role) === STAFF_ROLE.ADMINISTRATOR;

export const isManagerOrAbove = (role: string | null | undefined) =>
    isAdministrator(role) || normalizeRole(role) === STAFF_ROLE.FILIALLEITER;

const MANAGERS: string[] = [STAFF_ROLE.FILIALLEITER];
const OFFICE: string[] = [STAFF_ROLE.FILIALLEITER, STAFF_ROLE.MITARBEITER];
const EVERYONE: string[] = [STAFF_ROLE.FILIALLEITER, STAFF_ROLE.MITARBEITER, STAFF_ROLE.FAHRER];

/**
 * Admin areas (first path segment after /admin) and the roles besides
 * ADMINISTRATOR that may use them. Mirrors the sidebar menu.
 */
export const ADMIN_AREA_ROLES = {
    dashboard: EVERYONE,
    notifications: EVERYONE,
    fleet: EVERYONE,
    tasks: EVERYONE,
    reservations: OFFICE,
    customers: OFFICE,
    'check-in-setup': OFFICE,
    rechnungen: OFFICE,
    tracking: OFFICE,
    maintenance: MANAGERS,
    strafzettel: MANAGERS,
    finance: MANAGERS,
    fahrtenbuch: MANAGERS,
    reports: MANAGERS,
    'km-transfer': MANAGERS,
    marketing: MANAGERS,
    'competitor-pricing': MANAGERS,
    activity: MANAGERS,
    locations: MANAGERS,
    // Not a page: adding/removing cars, categories and fleet-wide changes.
    'fleet-management': MANAGERS,
    staff: [],
    settings: [],
    options: [],
    pricing: [],
    agb: [],
    'db-fix': [],
} satisfies Record<string, string[]>;

export type AdminArea = keyof typeof ADMIN_AREA_ROLES;

export function canAccessAdminArea(role: string | null | undefined, area: AdminArea): boolean {
    if (isAdministrator(role)) return true;
    return (ADMIN_AREA_ROLES[area] as string[]).includes(normalizeRole(role));
}
