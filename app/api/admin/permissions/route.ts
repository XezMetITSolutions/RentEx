import { NextRequest } from "next/server";
import { requireAdminApiModule } from '@/lib/adminAccess';
import { apiError, apiOk } from "@/lib/apiResponse";
import { auditLog } from "@/lib/audit";
import {
    ALL_ADMIN_MODULES,
    CONFIGURABLE_ROLES,
    DEFAULT_ROLE_PERMISSIONS,
    getRolePermissions,
    saveRolePermissions
} from "@/lib/rolePermissions";

// GET /api/admin/permissions — Get current permissions and all modules
export async function GET() {
    const auth = await requireAdminApiModule('Berechtigungen');
    if (auth.response) return auth.response;

    try {
        const permissions = await getRolePermissions();
        return apiOk({
            permissions,
            modules: ALL_ADMIN_MODULES,
            roles: CONFIGURABLE_ROLES,
            defaults: DEFAULT_ROLE_PERMISSIONS,
        });
    } catch (e: any) {
        return apiError(e.message || "Fehler beim Laden der Berechtigungen", 500);
    }
}

// POST /api/admin/permissions — Update role permissions matrix
export async function POST(req: NextRequest) {
    const auth = await requireAdminApiModule('Berechtigungen');
    if (auth.response) return auth.response;
    const session = auth.session;

    try {
        const body = await req.json();
        const { permissions } = body;

        if (!permissions || typeof permissions !== 'object') {
            return apiError("Ungültiges Format für Berechtigungen", 400);
        }

        const saved = await saveRolePermissions(permissions, session.email);

        await auditLog({
            action: 'SETTINGS_UPDATE',
            entityType: 'SystemSettings',
            actor: { kind: 'admin', id: session.id, name: session.name },
            description: `Rollenberechtigungen aktualisiert von ${session.email}`,
            metadata: { updatedBy: session.email, permissions: saved },
        });

        return apiOk({
            message: "Berechtigungen erfolgreich gespeichert",
            permissions: saved
        });
    } catch (e: any) {
        return apiError(e.message || "Fehler beim Speichern der Berechtigungen", 500);
    }
}
