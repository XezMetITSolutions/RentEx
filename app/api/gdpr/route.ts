import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAuthCustomerId } from "@/lib/mobileAuth";

async function resolveCustomerId(req: NextRequest): Promise<number | null> {
    // Web session (cookie)
    const sessionId = await getSession();
    if (sessionId) return sessionId;
    // Mobile app (Bearer token)
    const mobileId = getAuthCustomerId(req);
    return mobileId;
}

// POST /api/gdpr — Record customer's GDPR consent
export async function POST(req: NextRequest) {
    try {
        const authenticatedId = await resolveCustomerId(req);
        if (!authenticatedId) {
            return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
        }

        const body = await req.json();
        const { customerId, version } = body;

        if (!customerId || !version) {
            return NextResponse.json({ error: "customerId und version erforderlich" }, { status: 400 });
        }

        // Prevent IDOR: customer may only update their own record
        if (parseInt(customerId) !== authenticatedId) {
            return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
        }

        const updated = await prisma.customer.update({
            where: { id: authenticatedId },
            data: {
                gdprConsentDate: new Date(),
                gdprConsentVersion: version,
            },
        });

        return NextResponse.json({ success: true, customerId: updated.id });
    } catch {
        return NextResponse.json({ error: "Fehler beim Speichern der Einwilligung" }, { status: 500 });
    }
}

// DELETE /api/gdpr — Request data erasure (Right to be Forgotten)
export async function DELETE(req: NextRequest) {
    try {
        const authenticatedId = await resolveCustomerId(req);
        if (!authenticatedId) {
            return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
        }

        const body = await req.json();
        const { customerId } = body;

        if (!customerId) {
            return NextResponse.json({ error: "customerId erforderlich" }, { status: 400 });
        }

        // Prevent IDOR: customer may only request erasure of their own data
        if (parseInt(customerId) !== authenticatedId) {
            return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
        }

        // Mark erasure request — actual deletion done manually after legal review
        await prisma.customer.update({
            where: { id: authenticatedId },
            data: { gdprDeleteRequestedAt: new Date() },
        });

        return NextResponse.json({
            success: true,
            message: "Löschantrag registriert. Ihre Daten werden innerhalb von 30 Tagen gelöscht.",
        });
    } catch {
        return NextResponse.json({ error: "Fehler beim Registrieren des Löschantrags" }, { status: 500 });
    }
}
