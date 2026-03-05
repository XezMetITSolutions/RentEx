import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/gdpr/consent — Record customer's GDPR consent
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { customerId, version } = body;

        if (!customerId || !version) {
            return NextResponse.json({ error: "customerId und version erforderlich" }, { status: 400 });
        }

        const updated = await prisma.customer.update({
            where: { id: parseInt(customerId) },
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

// DELETE /api/gdpr/consent — Request data erasure (Right to be Forgotten)
export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { customerId } = body;

        if (!customerId) {
            return NextResponse.json({ error: "customerId erforderlich" }, { status: 400 });
        }

        // Mark erasure request — actual deletion done manually after legal review
        await prisma.customer.update({
            where: { id: parseInt(customerId) },
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
