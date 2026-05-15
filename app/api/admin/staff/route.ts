import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/auth";
import { apiOk, apiUnauthorized, apiValidation, apiError, apiInternal, ERROR_CODES } from "@/lib/apiResponse";
import { auditLog } from "@/lib/audit";

// GET /api/admin/staff
export async function GET() {
    const session = await getAdminSession();
    if (!session) return apiUnauthorized();

    try {
        const staff = await prisma.staff.findMany({
            include: { location: { select: { id: true, name: true } } },
            orderBy: { createdAt: "desc" },
        });
        // Never return passwordHash
        return apiOk(staff.map(({ passwordHash: _ignored, ...s }) => s));
    } catch (e) {
        return apiInternal("Fehler beim Laden der Mitarbeiter");
    }
}

// POST /api/admin/staff — Create new staff member
export async function POST(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) return apiUnauthorized();
    
    // Only SUPERADMIN can create staff
    if (session.role !== 'SUPERADMIN') {
        return apiError("Nur Super-Admins können Mitarbeiter erstellen", 403);
    }

    try {
        const body = await req.json();
        const { name, email, role, locationId, password } = body;

        if (!name || !email || !role || !password) {
            return apiValidation("Fehlende Pflichtfelder");
        }

        const passwordHash = hashPassword(password);

        const staff = await prisma.staff.create({
            data: {
                name,
                email,
                role,
                passwordHash,
                locationId: locationId ? parseInt(locationId) : null,
            },
        });

        const { passwordHash: _ignored, ...safe } = staff;

        await auditLog({
            action: 'STAFF_CREATED',
            entityType: 'Staff',
            entityId: staff.id,
            actor: { kind: 'admin', id: session.id, name: session.name },
            description: `Mitarbeiter erstellt: ${staff.email} (${staff.role})`,
            metadata: { email: staff.email, role: staff.role, locationId: staff.locationId },
        });

        return apiOk(safe, 201);
    } catch (e: any) {
        if (e.code === "P2002") {
            return apiError("E-Mail bereits vergeben", 409, ERROR_CODES.CONFLICT);
        }
        return apiInternal("Fehler beim Erstellen");
    }
}
