import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/staff
export async function GET() {
    try {
        const staff = await prisma.staff.findMany({
            include: { location: { select: { id: true, name: true } } },
            orderBy: { createdAt: "desc" },
        });
        // Never return passwordHash
        return NextResponse.json(staff.map(({ passwordHash: _ignored, ...s }) => s));
    } catch (e) {
        return NextResponse.json({ error: "Fehler beim Laden der Mitarbeiter" }, { status: 500 });
    }
}

// POST /api/admin/staff — Create new staff member
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, role, locationId, password } = body;

        if (!name || !email || !role || !password) {
            return NextResponse.json({ error: "Fehlende Pflichtfelder" }, { status: 400 });
        }

        const { scryptSync, randomBytes } = await import("crypto");
        const salt = randomBytes(16).toString("hex");
        const hash = scryptSync(password, salt, 64).toString("hex");
        const passwordHash = `${salt}:${hash}`;

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
        return NextResponse.json(safe, { status: 201 });
    } catch (e: any) {
        if (e.code === "P2002") {
            return NextResponse.json({ error: "E-Mail bereits vergeben" }, { status: 409 });
        }
        return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
    }
}
