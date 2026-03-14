import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

/**
 * POST /api/cron/birthday-coupons
 * Run daily (e.g. via Vercel Cron or external scheduler at midnight)
 * Generates and emails a birthday coupon for every customer whose birthday is today
 */
export async function POST(req: NextRequest) {
    // Cron secret guard
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;

    // Find customers whose birthday is today
    const customers = await prisma.customer.findMany({
        where: {
            dateOfBirth: { not: null },
            isBlacklisted: false,
        },
    });

    const birthdayCustomers = customers.filter((c) => {
        if (!c.dateOfBirth) return false;
        const dob = new Date(c.dateOfBirth);
        return dob.getDate() === todayDay && dob.getMonth() + 1 === todayMonth;
    });

    let processed = 0;
    const results: { email: string; coupon: string; success: boolean }[] = [];

    for (const customer of birthdayCustomers) {
        try {
            // Generate unique coupon code
            const code = `BDAY-${customer.id}-${today.getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

            // Create coupon (10% birthday discount, valid 30 days)
            const coupon = await prisma.discountCoupon.create({
                data: {
                    code,
                    description: `Geburtstags-Gutschein für ${customer.firstName} ${customer.lastName}`,
                    discountType: "PERCENTAGE",
                    discountValue: 10,
                    validFrom: today,
                    validUntil: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
                    usageLimit: 1,
                    isActive: true,
                    isPersonal: true,
                    customerId: customer.id,
                    triggerType: "BIRTHDAY",
                },
            });

            // Send email
            await resend.emails.send({
                from: process.env.EMAIL_FROM || "noreply@rentex.at",
                to: customer.email,
                subject: `🎂 Alles Gute zum Geburtstag, ${customer.firstName}! Ihr Geschenk wartet.`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #dc2626;">🎂 Herzlichen Glückwunsch zum Geburtstag!</h1>
                        <p>Liebe/r ${customer.firstName} ${customer.lastName},</p>
                        <p>wir wünschen Ihnen alles Gute zu Ihrem besonderen Tag und möchten ihn mit einem kleinen Geschenk feiern!</p>
                        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Ihr persönlicher Gutscheincode</p>
                            <p style="margin: 8px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #dc2626;">${code}</p>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">10% Rabatt auf Ihre nächste Buchung | Gültig 30 Tage</p>
                        </div>
                        <p>Genießen Sie Ihren Geburtstag – und Ihre nächste Fahrt mit RentEx!</p>
                        <p>Mit freundlichen Grüßen,<br/>Ihr RentEx-Team</p>
                    </div>
                `,
            });

            results.push({ email: customer.email, coupon: code, success: true });
            processed++;
        } catch (e) {
            results.push({ email: customer.email, coupon: "", success: false });
        }
    }

    return NextResponse.json({
        date: today.toISOString().split("T")[0],
        birthdayCount: birthdayCustomers.length,
        processed,
        results,
    });
}
