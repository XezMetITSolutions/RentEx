import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { emailTemplates, escapeHtml, sendEmail, wrapHtmlLayout } from "@/lib/notificationTemplates";
import crypto from "crypto";
import { ABANDONED_ONLINE_BOOKING_MINUTES } from "@/lib/availability";
import { cancelUnpaidOnlineBooking } from "@/lib/bookingLifecycle";
import { businessTodayBounds } from "@/lib/bookingUtils";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret && process.env.NODE_ENV === "production") {
        throw new Error("CRON_SECRET must be set in production");
    }

    const providedSecret = authHeader?.replace("Bearer ", "");

    if (!cronSecret || !providedSecret || !crypto.timingSafeEqual(Buffer.from(providedSecret), Buffer.from(cronSecret))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    // sendEmail() uses SMTP or Resend, whichever is configured. (This route used
    // to require RESEND_API_KEY and failed completely without it — no reminders,
    // birthday coupons, dunning or cleanup ran after the switch to SMTP.)
    const today = new Date();
    // "Tomorrow" is the next Vienna calendar day, not the next 24 h in UTC.
    const { start: tomorrow, end: dayAfter } = businessTodayBounds(1);

    const results: any = {
        pickupReminders: null,
        returnReminders: null,
        birthday: null,
        mahnwesen: null,
        cartCleanup: null,
        abandonedBookings: null
    };

    // 0. Abandoned online checkouts (safety net for missed `checkout.session.expired` webhooks)
    try {
        const cutoff = new Date(Date.now() - ABANDONED_ONLINE_BOOKING_MINUTES * 60_000);
        const abandoned = await prisma.rental.findMany({
            where: { status: 'Pending', paymentMethod: 'Online', paymentStatus: { not: 'Paid' }, createdAt: { lt: cutoff } },
            select: { id: true },
        });
        let cancelled = 0;
        for (const { id } of abandoned) {
            if (await cancelUnpaidOnlineBooking(id)) cancelled++;
        }
        results.abandonedBookings = { cancelled };
    } catch (e: any) {
        results.abandonedBookings = { error: e.message };
    }

    // 1. Pickup Reminders (1 day before start)
    try {
        const upcoming = await prisma.rental.findMany({
            where: {
                status: { in: ["Confirmed", "Pending"] },
                startDate: { gte: tomorrow, lt: dayAfter },
                // Unpaid online checkouts are not real bookings yet.
                NOT: { paymentMethod: "Online", paymentStatus: { not: "Paid" } },
            },
            include: { customer: true, car: true, pickupLocation: true },
        });
        let pickupSent = 0;
        for (const rental of upcoming) {
            if (!rental.customer || !rental.car || !rental.contractNumber) continue;
            const sent = await sendEmail(rental.customer.email, emailTemplates.pickupReminder({
                contractNumber: rental.contractNumber,
                customer: { firstName: rental.customer.firstName, lastName: rental.customer.lastName, email: rental.customer.email },
                car: { brand: rental.car.brand, model: rental.car.model, plate: rental.car.plate },
                rental: { startDate: rental.startDate, endDate: rental.endDate, pickupLocation: rental.pickupLocation?.name, totalAmount: Number(rental.totalAmount) },
            }));
            if (sent) pickupSent++;
        }
        results.pickupReminders = { sent: pickupSent };
    } catch (e: any) {
        results.pickupReminders = { error: e.message };
    }

    // 2. Return Reminders (1 day before end)
    try {
        const returning = await prisma.rental.findMany({
            where: {
                status: "Active",
                endDate: { gte: tomorrow, lt: dayAfter },
            },
            include: { customer: true, car: true, pickupLocation: true },
        });
        let returnSent = 0;
        for (const rental of returning) {
            if (!rental.customer || !rental.car || !rental.contractNumber) continue;
            const sent = await sendEmail(rental.customer.email, emailTemplates.returnReminder({
                contractNumber: rental.contractNumber,
                customer: { firstName: rental.customer.firstName, lastName: rental.customer.lastName, email: rental.customer.email },
                car: { brand: rental.car.brand, model: rental.car.model, plate: rental.car.plate },
                rental: { startDate: rental.startDate, endDate: rental.endDate, pickupLocation: rental.pickupLocation?.name, totalAmount: Number(rental.totalAmount) },
            }));
            if (sent) returnSent++;
        }
        results.returnReminders = { sent: returnSent };
    } catch (e: any) {
        results.returnReminders = { error: e.message };
    }

    // 3. Birthday Coupons
    try {
        const todayDay = today.getDate();
        const todayMonth = today.getMonth() + 1;
        const customers = await prisma.customer.findMany({
            where: { dateOfBirth: { not: null }, isBlacklisted: false }
        });
        const birthdayCustomers = customers.filter((c) => {
            if (!c.dateOfBirth) return false;
            const dob = new Date(c.dateOfBirth);
            return dob.getDate() === todayDay && dob.getMonth() + 1 === todayMonth;
        });

        let birthdayProcessed = 0;
        for (const customer of birthdayCustomers) {
            // Idempotent: a cron retry must not create a second coupon this year.
            const alreadyGiven = await prisma.discountCoupon.count({
                where: { customerId: customer.id, triggerType: "BIRTHDAY", code: { startsWith: `BDAY-${customer.id}-${today.getFullYear()}-` } },
            });
            if (alreadyGiven > 0) continue;
            const code = `BDAY-${customer.id}-${today.getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
            await prisma.discountCoupon.create({
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
                    triggerType: "BIRTHDAY"
                }
            });
            await sendEmail(customer.email, {
                subject: `🎂 Alles Gute zum Geburtstag, ${customer.firstName}! Ihr Geschenk wartet.`,
                body: `Alles Gute zum Geburtstag! Ihr 10% Rabattcode lautet: ${code}. Gilt für 30 Tage.`,
                html: wrapHtmlLayout(
                    "ALLES GUTE ZUM GEBURTSTAG",
                    "IHR GESCHENK IST DA",
                    `
                    <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Hallo ${escapeHtml(customer.firstName)},</h2>
                    <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                        wir wünschen Ihnen von Herzen alles Gute zum Geburtstag! 🎉
                    </p>
                    <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 25px;">
                        Als kleines Geschenk erhalten Sie einen <strong>10% Rabattgutschein</strong> für Ihre nächste Fahrzeugmiete bei uns.
                    </p>

                    <!-- Coupon Code Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #27272a; border-radius: 12px; margin-bottom: 25px;">
                        <tr>
                            <td align="center" style="padding: 25px;">
                                <span style="color: #dc2626; font-size: 12px; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 6px;">Ihr exklusiver Geburtstagscode:</span>
                                <strong style="color: #ffffff; font-size: 22px; letter-spacing: 2px; font-family: monospace; display: block; background-color: #09090b; padding: 10px 20px; border-radius: 8px; width: fit-content; margin: 0 auto;">${code}</strong>
                                <span style="color: #a1a1aa; font-size: 11px; display: block; margin-top: 10px;">Gültig für 30 Tage ab heute.</span>
                            </td>
                        </tr>
                    </table>
                    `
                )
            });
            birthdayProcessed++;
        }
        results.birthday = { processed: birthdayProcessed };
    } catch (e: any) {
        results.birthday = { error: e.message };
    }

    // 4. Mahnwesen — levels are sent strictly in order (1 → 2 → 3), each only
    // after the previous one plus the waiting period.
    try {
        const DAYS_AFTER_RETURN = 3;   // first reminder
        const DAYS_BETWEEN_LEVELS = 7; // reminder 2 and 3
        const dayMs = 24 * 60 * 60 * 1000;
        const overdue = await prisma.rental.findMany({
            where: {
                paymentStatus: { in: ["Pending", "Partial"] },
                status: { in: ["Completed", "Active"] },
                endDate: { lt: today },
                mahnung3SentAt: null,
            },
            include: { customer: true, car: true, payments: true }
        });

        let m1 = 0, m2 = 0, m3 = 0;
        for (const rental of overdue) {
            // What is still open: rent + extra charges − payments received.
            // (The deposit is a security, not a payment, so it is not deducted.)
            const paid = rental.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const totalOwed = Math.round((Number(rental.totalAmount) + Number(rental.extraCharges ?? 0) - paid) * 100) / 100;
            if (totalOwed <= 0) continue;

            const daysSince = (d: Date) => (today.getTime() - new Date(d).getTime()) / dayMs;
            let level: 1 | 2 | 3 | null = null;
            if (!rental.mahnung1SentAt) {
                if (daysSince(rental.endDate) >= DAYS_AFTER_RETURN) level = 1;
            } else if (!rental.mahnung2SentAt) {
                if (daysSince(rental.mahnung1SentAt) >= DAYS_BETWEEN_LEVELS) level = 2;
            } else if (daysSince(rental.mahnung2SentAt) >= DAYS_BETWEEN_LEVELS) {
                level = 3;
            }
            if (!level || !rental.customer) continue;

            const amount = new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(totalOwed);
            const reference = rental.contractNumber ?? String(rental.id);
            const sent = await sendEmail(rental.customer.email, {
                subject: `${level}. Mahnung – Vertrag ${reference}`,
                body: `Sehr geehrte/r ${rental.customer.firstName} ${rental.customer.lastName}, für Vertrag ${reference} ist noch ein Betrag von ${amount} offen. Bitte überweisen Sie diesen umgehend.`,
                html: wrapHtmlLayout(
                    `${level}. MAHNUNG`,
                    `VERTRAG ${reference}`,
                    `
                    <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6;">Sehr geehrte/r ${escapeHtml(rental.customer.firstName)} ${escapeHtml(rental.customer.lastName)},</p>
                    <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6;">für Ihren Mietvertrag <strong>${reference}</strong>${rental.car ? ` (${rental.car.brand} ${rental.car.model})` : ''} ist noch ein Betrag von <strong style="color: #ffffff;">${amount}</strong> offen.</p>
                    <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6;">Bitte überweisen Sie den Betrag umgehend. Sollte sich Ihre Zahlung mit diesem Schreiben überschnitten haben, betrachten Sie es bitte als gegenstandslos.</p>
                    `
                ),
            });
            if (!sent) continue; // retry tomorrow instead of recording an unsent reminder

            await prisma.mahnungRecord.create({
                data: { rentalId: rental.id, level, amount: totalOwed, dueDate: new Date(rental.endDate) }
            });
            await prisma.rental.update({
                where: { id: rental.id },
                data: { isOverdue: true, [`mahnung${level}SentAt`]: today },
            });
            if (level === 1) m1++; else if (level === 2) m2++; else m3++;
        }
        results.mahnwesen = { m1, m2, m3 };
    } catch (e: any) {
        results.mahnwesen = { error: e.message };
    }

    // 5. Cart Cleanup
    try {
        const cleanup = await prisma.cartSession.deleteMany({
            where: { expiresAt: { lte: today } }
        });
        results.cartCleanup = { cleaned: cleanup.count };
    } catch (e: any) {
        results.cartCleanup = { error: e.message };
    }

    return NextResponse.json(results);
}
