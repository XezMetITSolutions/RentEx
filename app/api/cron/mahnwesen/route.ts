import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

// Days after which each Mahnung is sent
const MAHNUNG_DELAYS = { 1: 3, 2: 10, 3: 21 }; // days after due date

/**
 * POST /api/cron/mahnwesen
 * Run daily — checks for unpaid/overdue rentals and sends Mahnung emails
 */
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    let m1Sent = 0, m2Sent = 0, m3Sent = 0;

    // Find all unpaid, completed rentals
    const overdueRentals = await prisma.rental.findMany({
        where: {
            paymentStatus: { in: ["Pending", "Partial"] },
            status: { in: ["Completed", "Active"] },
            endDate: { lt: now },
        },
        include: {
            customer: { select: { firstName: true, lastName: true, email: true } },
            car: { select: { brand: true, model: true, plate: true } },
        },
    });

    for (const rental of overdueRentals) {
        const daysPastDue = Math.floor(
            (now.getTime() - new Date(rental.endDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        const totalOwed = Number(rental.totalAmount) - Number(rental.depositPaid ?? 0);
        const dueDate = new Date(rental.endDate);

        const sendMahnung = async (level: 1 | 2 | 3) => {
            const subject = level === 3
                ? `⚠️ LETZTE MAHNUNG – Rechnung ${rental.contractNumber ?? rental.id}`
                : `Zahlungserinnerung (Mahnung ${level}) – Rechnung ${rental.contractNumber ?? rental.id}`;

            const urgencyColor = level === 1 ? "#f59e0b" : level === 2 ? "#ef4444" : "#7f1d1d";

            await resend.emails.send({
                from: process.env.EMAIL_FROM || "noreply@rentex.at",
                to: rental.customer.email,
                subject,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: ${urgencyColor}; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
                            <h2 style="margin: 0;">${level === 3 ? "⚠️ LETZTE MAHNUNG" : `Mahnung ${level}`}</h2>
                        </div>
                        <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
                            <p>Sehr geehrte/r ${rental.customer.firstName} ${rental.customer.lastName},</p>
                            <p>trotz unserer bisherigen Hinweise haben wir noch keinen Zahlungseingang feststellen können.</p>
                            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                                <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Fahrzeug</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${rental.car.brand} ${rental.car.model} (${rental.car.plate})</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Vertragsnr.</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${rental.contractNumber ?? rental.id}</td></tr>
                                <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">Offener Betrag</td>
                                    <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: ${urgencyColor};">€ ${totalOwed.toFixed(2)}</td></tr>
                            </table>
                            ${level === 3 ? `<p style="color: #7f1d1d; font-weight: bold;">⚠️ Sollte die Zahlung nicht innerhalb von 7 Tagen eingehen, werden wir die Forderung an ein Inkassobüro übergeben.</p>` : ""}
                            <p>Bitte überweisen Sie den offenen Betrag umgehend oder kontaktieren Sie uns.</p>
                            <p>Mit freundlichen Grüßen,<br/>RentEx GmbH</p>
                        </div>
                    </div>
                `,
            });

            await prisma.mahnungRecord.create({
                data: { rentalId: rental.id, level, amount: totalOwed, dueDate },
            });

            const updateData: Record<string, unknown> = { isOverdue: true };
            if (level === 1) updateData.mahnung1SentAt = now;
            if (level === 2) updateData.mahnung2SentAt = now;
            if (level === 3) updateData.mahnung3SentAt = now;

            await prisma.rental.update({ where: { id: rental.id }, data: updateData as Parameters<typeof prisma.rental.update>[0]["data"] });
        };

        // Determine which Mahnung level to send
        try {
            if (daysPastDue >= MAHNUNG_DELAYS[3] && !rental.mahnung3SentAt) {
                await sendMahnung(3); m3Sent++;
            } else if (daysPastDue >= MAHNUNG_DELAYS[2] && !rental.mahnung2SentAt) {
                await sendMahnung(2); m2Sent++;
            } else if (daysPastDue >= MAHNUNG_DELAYS[1] && !rental.mahnung1SentAt) {
                await sendMahnung(1); m1Sent++;
            }
        } catch {
            // Continue processing others
        }
    }

    return NextResponse.json({
        processed: overdueRentals.length,
        mahnung1Sent: m1Sent,
        mahnung2Sent: m2Sent,
        mahnung3Sent: m3Sent,
    });
}
