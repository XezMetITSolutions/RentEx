import prisma from '@/lib/prisma';

export interface AdminModuleItem {
    id: string;
    name: string;
    category: string;
    href: string;
    description: string;
    badgeKey?: 'notifications' | 'live';
}

export const ADMIN_CATEGORY_ORDER = [
    'Hauptmenü',
    'Operativ',
    'Flotte',
    'Preise & Marketing',
    'Finanzen & Berichte',
    'System & Recht',
] as const;

export const ALL_ADMIN_MODULES: AdminModuleItem[] = [
    // Hauptmenü
    { id: 'Dashboard', name: 'Dashboard', category: 'Hauptmenü', href: '/admin', description: 'Übersicht, Metriken und Schnellzugriff' },
    { id: 'Aufgaben', name: 'Aufgaben', category: 'Hauptmenü', href: '/admin/tasks', description: 'Operatives Aufgaben- & To-Do-Board' },
    { id: 'Benachrichtigungen', name: 'Benachrichtigungen', category: 'Hauptmenü', href: '/admin/notifications', description: 'System- und Kundenbenachrichtigungen', badgeKey: 'notifications' },
    { id: 'Aktivitätsprotokoll', name: 'Aktivitätsprotokoll', category: 'Hauptmenü', href: '/admin/activity', description: 'Audit-Logs und Systemaktivitäten' },

    // Operativ
    { id: 'Reservierungen', name: 'Reservierungen', category: 'Operativ', href: '/admin/reservations', description: 'Buchungsübersicht, Kalender und Detailansicht' },
    { id: 'Kunden', name: 'Kunden', category: 'Operativ', href: '/admin/customers', description: 'Kundenkartei, Verifizierung und Historie' },
    { id: 'Check-In', name: 'Check-In', category: 'Operativ', href: '/admin/check-in-setup', description: 'Übergabeprotokolle und Check-In Prozess' },
    { id: 'Check-Out', name: 'Check-Out', category: 'Operativ', href: '/admin/check-out', description: 'Anstehende und überfällige Fahrzeugrückgaben' },
    { id: 'Standorte', name: 'Standorte', category: 'Operativ', href: '/admin/locations', description: 'Filialverwaltung und Standortübersicht' },

    // Flotte
    { id: 'Fahrzeugflotte', name: 'Fahrzeugflotte', category: 'Flotte', href: '/admin/fleet', description: 'Fahrzeugbestand, Tarife und Status' },
    { id: 'GPS Tracking', name: 'GPS Tracking', category: 'Flotte', href: '/admin/tracking', description: 'Live-Telemetrie und Fahrzeugpositionen', badgeKey: 'live' },
    { id: 'Wartung', name: 'Wartung', category: 'Flotte', href: '/admin/maintenance', description: 'Inspektionen, TÜV und Werkstatttermine' },
    { id: 'KM Transfer', name: 'KM Transfer', category: 'Flotte', href: '/admin/km-transfer', description: 'Kilometer-Kontingente übertragen' },
    { id: 'Strafzettel', name: 'Strafzettel', category: 'Flotte', href: '/admin/strafzettel', description: 'Bußgelder und Behördenanfragen' },

    // Preise & Marketing
    { id: 'Marketing', name: 'Marketing', category: 'Preise & Marketing', href: '/admin/marketing', description: 'Gutscheincodes, Rabatte und Kampagnen' },
    { id: 'Preise & Marktanalyse', name: 'Preise & Marktanalyse', category: 'Preise & Marketing', href: '/admin/pricing', description: 'Dynamische Preisgestaltung und Algorithmen' },
    { id: 'Mitbewerber', name: 'Mitbewerber', category: 'Preise & Marketing', href: '/admin/competitor-pricing', description: 'Marktvergleich und Konkurrenzpreise' },
    { id: 'Zusatzoptionen', name: 'Zusatzoptionen', category: 'Preise & Marketing', href: '/admin/options', description: 'Extras, Kindersitze und Schutzpakete' },

    // Finanzen & Berichte
    { id: 'Finanzen', name: 'Finanzen', category: 'Finanzen & Berichte', href: '/admin/finance', description: 'Umsatz, Einnahmen und Ausgaben' },
    { id: 'Rechnungen', name: 'Rechnungen', category: 'Finanzen & Berichte', href: '/admin/rechnungen', description: 'Rechnungsarchiv und PDF-Belege' },
    { id: 'Fahrtenbuch', name: 'Fahrtenbuch', category: 'Finanzen & Berichte', href: '/admin/fahrtenbuch', description: 'Fahrtenverzeichnis und KM-Dokumentation' },
    { id: 'Berichte', name: 'Berichte', category: 'Finanzen & Berichte', href: '/admin/reports', description: 'Detaillierte Analysen und Exportfunktion' },

    // System & Recht
    { id: 'Mitarbeiter', name: 'Mitarbeiter', category: 'System & Recht', href: '/admin/staff', description: 'Mitarbeiterverwaltung und Zugänge' },
    { id: 'Berechtigungen', name: 'Berechtigungen', category: 'System & Recht', href: '/admin/permissions', description: 'Rollen- und Rechte-Matrix (Superadmin)' },
    { id: 'AGB Versionen', name: 'AGB Versionen', category: 'System & Recht', href: '/admin/agb', description: 'Rechtliche Texte und Vertragsversionen' },
    { id: 'Einstellungen', name: 'Einstellungen', category: 'System & Recht', href: '/admin/settings', description: 'System- und Unternehmenskonfiguration' },
];

export const CONFIGURABLE_ROLES = [
    { role: 'FILIALLEITER', label: 'Filialleiter / Manager', color: 'blue' },
    { role: 'MITARBEITER', label: 'Mitarbeiter / Agent', color: 'emerald' },
    { role: 'FAHRER', label: 'Fahrer / Driver', color: 'amber' },
] as const;

export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
    'SUPERADMIN': ['all'],
    'ADMINISTRATOR': ['all'],
    'FILIALLEITER': [
        'Dashboard', 'Aufgaben', 'Benachrichtigungen',
        'Reservierungen', 'Kunden', 'Check-In', 'Check-Out', 'Standorte',
        'Fahrzeugflotte', 'GPS Tracking', 'Wartung', 'KM Transfer', 'Strafzettel',
        'Zusatzoptionen',
        'Finanzen', 'Rechnungen', 'Fahrtenbuch', 'Berichte'
    ],
    'MITARBEITER': [
        'Dashboard', 'Aufgaben', 'Benachrichtigungen',
        'Reservierungen', 'Kunden', 'Check-In', 'Check-Out',
        'Fahrzeugflotte', 'GPS Tracking', 'Wartung', 'Rechnungen'
    ],
    'FAHRER': [
        'Dashboard', 'Aufgaben', 'Reservierungen', 'Fahrzeugflotte', 'Check-In', 'Check-Out'
    ]
};

const MODULES_BY_HREF_LENGTH = [...ALL_ADMIN_MODULES].sort(
    (a, b) => b.href.length - a.href.length
);

export function getAdminMenuGroups(): Array<{ title: string; items: AdminModuleItem[] }> {
    const byCategory = new Map<string, AdminModuleItem[]>();
    for (const mod of ALL_ADMIN_MODULES) {
        const list = byCategory.get(mod.category) ?? [];
        list.push(mod);
        byCategory.set(mod.category, list);
    }
    return ADMIN_CATEGORY_ORDER.filter((cat) => byCategory.has(cat)).map((title) => ({
        title,
        items: byCategory.get(title)!,
    }));
}

/** Resolve sidebar module id from pathname (ignores query string). */
export function resolveAdminModuleIdFromPath(pathname: string): string | null {
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
        return null;
    }
    if (!pathname.startsWith('/admin')) {
        return null;
    }

    for (const mod of MODULES_BY_HREF_LENGTH) {
        if (mod.href === '/admin') {
            if (pathname === '/admin') return mod.id;
            continue;
        }
        if (pathname === mod.href || pathname.startsWith(`${mod.href}/`)) {
            return mod.id;
        }
    }

    return 'UNKNOWN';
}

export function staffCanAccessModule(
    staff: { role: string },
    permissions: Record<string, string[]>,
    moduleId: string
): boolean {
    if (moduleId === 'Berechtigungen') {
        return staff.role === 'SUPERADMIN' || staff.role === 'ADMINISTRATOR';
    }

    if (moduleId === 'UNKNOWN') {
        return staff.role === 'SUPERADMIN' || staff.role === 'ADMINISTRATOR';
    }

    if (staff.role === 'SUPERADMIN' || staff.role === 'ADMINISTRATOR') {
        return true;
    }

    const perms = permissions[staff.role] ?? [];
    if (perms.includes('all')) return true;
    return perms.includes(moduleId);
}

export function staffCanAccessAdminPath(
    pathname: string,
    staff: { role: string },
    permissions: Record<string, string[]>
): boolean {
    const moduleId = resolveAdminModuleIdFromPath(pathname);
    if (moduleId === null) return true;
    return staffCanAccessModule(staff, permissions, moduleId);
}

const SETTINGS_KEY = 'role_permissions';

/** Append newly shipped modules from code defaults without revoking custom saves. */
function mergeNewModulesFromDefaults(permissions: Record<string, string[]>): Record<string, string[]> {
    const out = { ...permissions };
    for (const { role } of CONFIGURABLE_ROLES) {
        const list = out[role];
        if (!list || list.includes('all')) continue;
        const defaults = DEFAULT_ROLE_PERMISSIONS[role] ?? [];
        const missing = defaults.filter((id) => !list.includes(id));
        if (missing.length) out[role] = [...list, ...missing];
    }
    return out;
}

export async function getRolePermissions(): Promise<Record<string, string[]>> {
    try {
        const row = await prisma.systemSettings.findUnique({
            where: { key: SETTINGS_KEY }
        });
        if (row && row.value) {
            const parsed = JSON.parse(row.value);
            return mergeNewModulesFromDefaults({
                ...DEFAULT_ROLE_PERMISSIONS,
                ...parsed,
                'SUPERADMIN': ['all'],
                'ADMINISTRATOR': ['all'],
            });
        }
    } catch (e) {
        console.error('Error fetching role permissions from SystemSettings:', e);
    }
    return DEFAULT_ROLE_PERMISSIONS;
}

export async function saveRolePermissions(permissions: Record<string, string[]>, updatedBy?: string) {
    // Ensure Superadmin and Administrator cannot be restricted
    const sanitized = {
        ...permissions,
        'SUPERADMIN': ['all'],
        'ADMINISTRATOR': ['all'],
    };

    const value = JSON.stringify(sanitized);

    await prisma.systemSettings.upsert({
        where: { key: SETTINGS_KEY },
        update: { value, updatedBy },
        create: {
            key: SETTINGS_KEY,
            value,
            category: 'SECURITY',
            description: 'Rollenberechtigungen für Admin-Sidebar und Module',
            updatedBy
        }
    });

    return sanitized;
}
