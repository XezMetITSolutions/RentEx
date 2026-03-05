import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

const CART_DURATION_MINUTES = 15;

// POST /api/cart-session — Lock a car for 15 minutes
export async function POST(req: NextRequest) {
    const ip = getClientIp(req);
    const rl = rateLimit(`cart:${ip}`, { limit: 10, windowSeconds: 60 });
    if (!rl.allowed) {
        return NextResponse.json({ error: "Zu viele Anfragen. Bitte warten." }, { status: 429 });
    }

    try {
        const body = await req.json();
        const { carId, startDate, endDate, options, guestEmail, customerId } = body;

        if (!carId) {
            return NextResponse.json({ error: "carId erforderlich" }, { status: 400 });
        }

        // Check if car is already locked by another session
        const now = new Date();
        const existing = await prisma.cartSession.findFirst({
            where: {
                carId: parseInt(carId),
                expiresAt: { gt: now },
            },
        });

        if (existing) {
            const remainingMs = new Date(existing.expiresAt).getTime() - now.getTime();
            const remainingMin = Math.ceil(remainingMs / 60000);
            return NextResponse.json(
                { error: `Fahrzeug ist bereits reserviert. Noch ${remainingMin} Minute(n).`, locked: true },
                { status: 409 }
            );
        }

        // Release any expired sessions for this car first
        await prisma.cartSession.deleteMany({
            where: { carId: parseInt(carId), expiresAt: { lte: now } },
        });

        const sessionKey = `${ip}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const expiresAt = new Date(now.getTime() + CART_DURATION_MINUTES * 60 * 1000);

        const session = await prisma.cartSession.create({
            data: {
                carId: parseInt(carId),
                sessionKey,
                expiresAt,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                options: options ? JSON.stringify(options) : null,
                guestEmail: guestEmail || null,
                customerId: customerId ? parseInt(customerId) : null,
            },
        });

        return NextResponse.json({
            sessionId: session.id,
            sessionKey: session.sessionKey,
            expiresAt: session.expiresAt,
            remainingSeconds: CART_DURATION_MINUTES * 60,
        });
    } catch (e) {
        return NextResponse.json({ error: "Fehler beim Erstellen der Session" }, { status: 500 });
    }
}

// DELETE /api/cart-session — Release lock (by sessionKey in body)
export async function DELETE(req: NextRequest) {
    try {
        const { sessionKey } = await req.json();
        if (!sessionKey) return NextResponse.json({ error: "sessionKey erforderlich" }, { status: 400 });

        await prisma.cartSession.deleteMany({ where: { sessionKey } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Fehler beim Freigeben" }, { status: 500 });
    }
}
