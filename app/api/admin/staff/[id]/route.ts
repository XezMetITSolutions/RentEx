import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { hashPassword } from "@/lib/auth";

// GET /api/admin/staff/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

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
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

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
        return NextResponse.json(safe);
    } catch (e) {
        return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
    }
}

// DELETE /api/admin/staff/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

    const { id } = await params;
    // Prevent admin from deleting themselves
    if (session.id === parseInt(id)) {
        return NextResponse.json({ error: "Eigenes Konto kann nicht gelöscht werden." }, { status: 400 });
    }

    await prisma.staff.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
}
