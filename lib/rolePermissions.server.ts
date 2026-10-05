import prisma from '@/lib/prisma';
import {
    DEFAULT_ROLE_PERMISSIONS,
    mergeNewModulesFromDefaults,
} from '@/lib/rolePermissions';

const SETTINGS_KEY = 'role_permissions';

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
