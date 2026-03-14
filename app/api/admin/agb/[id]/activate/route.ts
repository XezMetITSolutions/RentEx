import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

// POST /api/admin/agb/[id]/activate — Activate version & notify all customers
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
                await resend.emails.send({
                    from: process.env.EMAIL_FROM || "noreply@rentex.at",
                    to: customer.email,
                    subject: `AGB Update – Version ${agb.version}`,
                    html: `
                        <h2>Sehr geehrte/r ${customer.firstName} ${customer.lastName},</h2>
                        <p>wir möchten Sie darüber informieren, dass unsere Allgemeinen Geschäftsbedingungen (AGB) aktualisiert wurden.</p>
                        <p><strong>Neue Version: ${agb.version}</strong></p>
                        <p>
                            Die aktualisierten AGB finden Sie unter:<br/>
                            <a href="https://rentex.at/terms">https://rentex.at/terms</a>
                        </p>
                        <p>Mit freundlichen Grüßen,<br/>Ihr RentEx-Team</p>
                    `,
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
