import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/notificationTemplates";
import { getAdminSession } from "@/lib/adminAuth";

// POST /api/admin/agb/[id]/activate — Activate version & notify all customers
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { id } = await params;
    try {
        // 1. Deactivate all others
        await prisma.agbVersion.updateMany({ data: { isActive: false } });

        // 2. Activate this version
        const agb = await prisma.agbVersion.update({
            where: { id: parseInt(id) },
            data: { isActive: true },
        });

        // 3. Notify all customers via email
        const customers = await prisma.customer.findMany({
            where: { email: { not: undefined }, isBlacklisted: false },
            select: { email: true, firstName: true, lastName: true },
        });

        let notifiedCount = 0;
        for (const customer of customers) {
            try {
                await sendEmail(customer.email, {
                    subject: `AGB Update – Version ${agb.version}`,
                    body: `Sehr geehrte/r ${customer.firstName} ${customer.lastName},

wir möchten Sie darüber informieren, dass unsere Allgemeinen Geschäftsbedingungen (AGB) aktualisiert wurden.

Neue Version: ${agb.version}

Die aktualisierten AGB finden Sie unter:
https://rent-ex.vercel.app/terms

Mit freundlichen Grüßen,
Ihr RentEx-Team`
                });
                notifiedCount++;
            } catch {
                // Continue even if one email fails
            }
        }

        // 4. Mark notification time
        await prisma.agbVersion.update({
            where: { id: parseInt(id) },
            data: { notifiedAt: new Date() },
        });

        return NextResponse.json({
            success: true,
            agb,
            notifiedCustomers: notifiedCount,
        });
    } catch (e) {
        return NextResponse.json({ error: "Fehler beim Aktivieren" }, { status: 500 });
    }
}
