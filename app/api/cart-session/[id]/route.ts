import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/cart-session/[id] — Check session status
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await prisma.cartSession.findUnique({ where: { id } });
    if (!session) return NextResponse.json({ valid: false, expired: true });

    const now = new Date();
    const expired = now > new Date(session.expiresAt);
    const remainingSeconds = expired
        ? 0
        : Math.ceil((new Date(session.expiresAt).getTime() - now.getTime()) / 1000);

    return NextResponse.json({ valid: !expired, expired, remainingSeconds, session });
}

// PATCH /api/cart-session/[id] — Extend by 5 minutes (max 1 extension)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await prisma.cartSession.findUnique({ where: { id } });
    if (!session) return NextResponse.json({ error: "Session nicht gefunden" }, { status: 404 });

    const now = new Date();
    if (now > new Date(session.expiresAt)) {
        return NextResponse.json({ error: "Session bereits abgelaufen" }, { status: 410 });
    }

    const newExpiry = new Date(new Date(session.expiresAt).getTime() + 5 * 60 * 1000);
    const updated = await prisma.cartSession.update({
        where: { id },
        data: { expiresAt: newExpiry },
    });

    return NextResponse.json({
        expiresAt: updated.expiresAt,
        remainingSeconds: Math.ceil((newExpiry.getTime() - now.getTime()) / 1000),
    });
}
