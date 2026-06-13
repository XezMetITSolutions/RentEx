import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/lib/notificationTemplates";

/**
 * POST /api/cron/birthday-coupons
 * Run daily (e.g. via Vercel Cron or external scheduler at midnight)
 * Generates and emails a birthday coupon for every customer whose birthday is today
 */
export async function POST(req: NextRequest) {
    // Cron secret guard
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret && process.env.NODE_ENV === "production") {
        throw new Error("CRON_SECRET must be set in production");
    }

    const providedSecret = authHeader?.replace("Bearer ", "");
    
    if (!cronSecret || !providedSecret || !crypto.timingSafeEqual(Buffer.from(providedSecret), Buffer.from(cronSecret))) {
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

            // Send email via custom SMTP
            const subject = `🎁 Alles Gute zum Geburtstag, ${customer.firstName}! Ihr Geschenk wartet.`;
            const body = `
Herzlichen Glückwunsch zum Geburtstag!

Liebe/r ${customer.firstName} ${customer.lastName},

wir wünschen Ihnen alles Gute zu Ihrem besonderen Tag und möchten ihn mit einem kleinen Geschenk feiern!

Ihr persönlicher Gutscheincode:
${code}

10% Rabatt auf Ihre nächste Buchung | Gültig 30 Tage

Genießen Sie Ihren Geburtstag – und Ihre nächste Fahrt mit RentEx!

Mit freundlichen Grüßen,
Ihr RentEx-Team
            `.trim();

            await sendEmail(customer.email, { subject, body });

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
