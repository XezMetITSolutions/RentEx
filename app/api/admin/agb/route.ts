import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/agb — List all versions
export async function GET() {
    const versions = await prisma.agbVersion.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(versions);
}

// POST /api/admin/agb — Create a new AGB version
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { version, content } = body;

        if (!version || !content) {
            return NextResponse.json({ error: "version und content erforderlich" }, { status: 400 });
        }

        const agb = await prisma.agbVersion.create({
            data: { version, content, isActive: false },
        });
        return NextResponse.json(agb, { status: 201 });
    } catch (e: any) {
        if (e.code === "P2002") {
            return NextResponse.json({ error: "Versionsnummer bereits vorhanden" }, { status: 409 });
        }
        return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
    }
}
