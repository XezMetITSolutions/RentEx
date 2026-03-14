import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/staff/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const staff = await prisma.staff.findUnique({
        where: { id: parseInt(id) },
        include: { location: true },
    });
    if (!staff) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    const { passwordHash: _ignored, ...safe } = staff;
    return NextResponse.json(safe);
}

// PUT /api/admin/staff/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { name, email, role, locationId, isActive, password } = body;

        const updateData: Record<string, unknown> = { name, email, role, isActive };
        if (locationId !== undefined) updateData.locationId = locationId ? parseInt(locationId) : null;

        if (password) {
            const { scryptSync, randomBytes } = await import("crypto");
            const salt = randomBytes(16).toString("hex");
            const hash = scryptSync(password, salt, 64).toString("hex");
            updateData.passwordHash = `${salt}:${hash}`;
        }

        const staff = await prisma.staff.update({
            where: { id: parseInt(id) },
            data: updateData as Parameters<typeof prisma.staff.update>[0]["data"],
        });
        const { passwordHash: _ignored, ...safe } = staff;
        return NextResponse.json(safe);
    } catch (e) {
        return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
    }
}

// DELETE /api/admin/staff/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.staff.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
}
