import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/auth";
import { apiOk, apiUnauthorized, apiNotFound, apiValidation, apiInternal, apiError } from "@/lib/apiResponse";
import { auditLog } from "@/lib/audit";

// GET /api/admin/staff/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) return apiUnauthorized();

    const { id } = await params;
    const staff = await prisma.staff.findUnique({
        where: { id: parseInt(id) },
        include: { location: true },
    });
    if (!staff) return apiNotFound();
    const { passwordHash: _ignored, ...safe } = staff;
    return apiOk(safe);
}

// PUT /api/admin/staff/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) return apiUnauthorized();

    // Only ADMINISTRATOR can update staff
    if (session.role !== 'ADMINISTRATOR') {
        return apiError("Nur Super-Admins können Mitarbeiter bearbeiten", 403);
    }

    const { id } = await params;
    try {
        const body = await req.json();
        const { name, email, role, locationId, isActive, password } = body;

        const updateData: Record<string, unknown> = { name, email, role, isActive };
        if (locationId !== undefined) updateData.locationId = locationId ? parseInt(locationId) : null;

        if (password) {
            updateData.passwordHash = hashPassword(password);
        }

        const staff = await prisma.staff.update({
            where: { id: parseInt(id) },
            data: updateData as Parameters<typeof prisma.staff.update>[0]["data"],
        });
        const { passwordHash: _ignored, ...safe } = staff;

        await auditLog({
            action: 'STAFF_UPDATED',
            entityType: 'Staff',
            entityId: staff.id,
            actor: { kind: 'admin', id: session.id, name: session.name },
            description: `Mitarbeiter aktualisiert: ${staff.email}`,
            metadata: {
                fieldsChanged: Object.keys(updateData),
                passwordReset: Boolean(password),
            },
        });

        return apiOk(safe);
    } catch (e) {
        return apiInternal("Fehler beim Aktualisieren");
    }
}

// DELETE /api/admin/staff/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) return apiUnauthorized();

    // Only ADMINISTRATOR can delete staff
    if (session.role !== 'ADMINISTRATOR') {
        return apiError("Nur Super-Admins können Mitarbeiter löschen", 403);
    }

    const { id } = await params;
    // Prevent admin from deleting themselves
    if (session.id === parseInt(id)) {
        return apiValidation("Eigenes Konto kann nicht gelöscht werden.");
    }

    const target = await prisma.staff.findUnique({ where: { id: parseInt(id) } });
    await prisma.staff.delete({ where: { id: parseInt(id) } });

    await auditLog({
        action: 'STAFF_DELETED',
        entityType: 'Staff',
        entityId: parseInt(id),
        actor: { kind: 'admin', id: session.id, name: session.name },
        description: `Mitarbeiter gelöscht: ${target?.email ?? id}`,
    });

    return apiOk({ success: true });
}
