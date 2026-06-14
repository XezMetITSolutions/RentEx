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

    const { id } = await params;
    const staffId = parseInt(id);

    // Fetch current target to check existing role
    const target = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!target) return apiNotFound();

    // Role authorization check
    if (session.role !== 'ADMINISTRATOR') {
        if (session.role === 'FILIALLEITER') {
            // Can only modify MITARBEITER or FAHRER
            if (target.role === 'ADMINISTRATOR' || target.role === 'FILIALLEITER') {
                return apiError("Filialleiter können Super-Admins oder andere Filialleiter nicht bearbeiten", 403);
            }
        } else {
            return apiError("Nicht autorisiert", 403);
        }
    }

    try {
        const body = await req.json();
        const { name, email, role, locationId, isActive, password } = body;

        // If shifting role, verify target role is permitted
        if (session.role === 'FILIALLEITER' && role && role !== 'MITARBEITER' && role !== 'FAHRER') {
            return apiError("Filialleiter können nur Mitarbeiter und Fahrer zuweisen", 403);
        }

        const updateData: Record<string, unknown> = { name, email, isActive };
        if (role !== undefined) updateData.role = role;
        
        // Location id check
        if (session.role === 'FILIALLEITER') {
            updateData.locationId = session.locationId;
        } else if (locationId !== undefined) {
            updateData.locationId = locationId ? parseInt(locationId) : null;
        }

        if (password) {
            updateData.passwordHash = hashPassword(password);
        }

        const staff = await prisma.staff.update({
            where: { id: staffId },
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

    const { id } = await params;
    const staffId = parseInt(id);

    // Prevent admin from deleting themselves
    if (session.id === staffId) {
        return apiValidation("Eigenes Konto kann nicht gelöscht werden.");
    }

    const target = await prisma.staff.findUnique({ where: { id: staffId } });
    if (!target) return apiNotFound();

    // Role authorization check
    if (session.role !== 'ADMINISTRATOR') {
        if (session.role === 'FILIALLEITER') {
            // Can only delete MITARBEITER or FAHRER
            if (target.role === 'ADMINISTRATOR' || target.role === 'FILIALLEITER') {
                return apiError("Filialleiter können Super-Admins oder andere Filialleiter nicht löschen", 403);
            }
        } else {
            return apiError("Nicht autorisiert", 403);
        }
    }

    await prisma.staff.delete({ where: { id: staffId } });

    await auditLog({
        action: 'STAFF_DELETED',
        entityType: 'Staff',
        entityId: staffId,
        actor: { kind: 'admin', id: session.id, name: session.name },
        description: `Mitarbeiter gelöscht: ${target?.email ?? id}`,
    });

    return apiOk({ success: true });
}
