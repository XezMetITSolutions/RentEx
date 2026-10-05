import { getAdminSession, requireAdmin } from '@/lib/adminAuth';
import { apiForbidden, apiUnauthorized } from '@/lib/apiResponse';
import { staffCanAccessModule } from '@/lib/rolePermissions';
import { getRolePermissions } from '@/lib/rolePermissions.server';
import type { NextResponse } from 'next/server';

type StaffSession = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>;

/**
 * API route guard: session + module permission.
 * Usage:
 *   const auth = await requireAdminApiModule('Wartung');
 *   if (auth.response) return auth.response;
 *   const session = auth.session;
 */
export async function requireAdminApiModule(
    moduleId: string
): Promise<
    | { session: StaffSession; response: null }
    | { session: null; response: NextResponse }
> {
    const session = await getAdminSession();
    if (!session) {
        return { session: null, response: apiUnauthorized() };
    }

    const permissions = await getRolePermissions();
    if (!staffCanAccessModule(session, permissions, moduleId)) {
        return {
            session: null,
            response: apiForbidden('Keine Berechtigung für dieses Modul'),
        };
    }

    return { session, response: null };
}

/** Server-action / page guard: throws if missing session or module access. */
export async function requireAdminModule(moduleId: string): Promise<StaffSession> {
    const staff = await requireAdmin();
    const permissions = await getRolePermissions();
    if (!staffCanAccessModule(staff, permissions, moduleId)) {
        throw new Error('Keine Berechtigung für dieses Modul');
    }
    return staff;
}
