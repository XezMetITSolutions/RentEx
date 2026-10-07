import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { emailTemplates, sendEmail } from "@/lib/notificationTemplates";
import { loadMailRental, sendRentalMail } from "@/lib/rentalMail";
import crypto from "crypto";
import { cancelNoShowRentals, cancelStaleUnpaidRentals, closeLapsedRentals } from "@/lib/availability";
import { BUSINESS } from "@/lib/config";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

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


    const today = new Date();
    const viennaDay = (offset: number) => {
        const base = formatInTimeZone(today, BUSINESS.TIME_ZONE, 'yyyy-MM-dd');
        const [y, m, d] = base.split('-').map(Number);
        const shifted = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + offset));
        return shifted.toISOString().slice(0, 10);
    };
    const tomorrow = fromZonedTime(`${viennaDay(1)}T00:00:00`, BUSINESS.TIME_ZONE);
    const dayAfter = fromZonedTime(`${viennaDay(2)}T00:00:00`, BUSINESS.TIME_ZONE);

    const results: any = {
        pickupReminders: null,
        returnReminders: null,
        birthday: null,
        mahnwesen: null,
        cartCleanup: null
    };

    // 1. Pickup Reminders (1 day before start)
    try {
        const upcoming = await prisma.rental.findMany({
            where: {
                status: { in: ["Confirmed", "Pending"] },
                startDate: { gte: tomorrow, lt: dayAfter },
            },
            include: { customer: true, car: true, pickupLocation: true, returnLocation: true },
        });
        let pickupSent = 0;
        for (const rental of upcoming) {
            if (!rental.customer || !rental.car || !rental.contractNumber) continue;
            const already = await prisma.notification.findFirst({
                where: { type: 'PickupReminder', relatedType: 'Rental', relatedId: rental.id, status: 'Sent' },
            });
            if (already) continue;
            const sent = await sendRentalMail(rental.id, { type: 'pickupReminder' });
            if (sent) {
                pickupSent++;
                await prisma.notification.create({
                    data: { type: 'PickupReminder', recipient: rental.customer.email, subject: rental.contractNumber, message: 'Abholerinnerung', status: 'Sent', sentAt: new Date(), relatedType: 'Rental', relatedId: rental.id },
                });
            }
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
            include: { customer: true, car: true, pickupLocation: true, returnLocation: true },
        });
        let returnSent = 0;
        for (const rental of returning) {
            if (!rental.customer || !rental.car || !rental.contractNumber) continue;
            const already = await prisma.notification.findFirst({
                where: { type: 'ReturnReminder', relatedType: 'Rental', relatedId: rental.id, status: 'Sent' },
            });
            if (already) continue;
            const sent = await sendRentalMail(rental.id, { type: 'returnReminder' });
            if (sent) {
                returnSent++;
                await prisma.notification.create({
                    data: { type: 'ReturnReminder', recipient: rental.customer.email, subject: rental.contractNumber, message: 'Rückgabeerinnerung', status: 'Sent', sentAt: new Date(), relatedType: 'Rental', relatedId: rental.id },
                });
            }
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
            const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
            await sendEmail(customer.email, emailTemplates.birthday(customer, { code, percent: 10, validUntil }));
            birthdayProcessed++;
        }
        results.birthday = { processed: birthdayProcessed };
    } catch (e: any) {
        results.birthday = { error: e.message };
    }

    // 4. Mahnwesen
    try {
        const delays = { 1: 3, 2: 10, 3: 21 };
        const overdue = await prisma.rental.findMany({
            where: {
                paymentStatus: { in: ["Pending", "Partial"] },
                status: { in: ["Completed", "Active"] },
                endDate: { lt: today }
            },
            include: { customer: true, car: true, payments: true }
        });

        let m1 = 0, m2 = 0, m3 = 0;
        for (const rental of overdue) {
            const daysPast = Math.floor((today.getTime() - new Date(rental.endDate).getTime()) / (1000 * 60 * 60 * 24));
            const paid = rental.payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const totalOwed = Number(rental.totalAmount) + Number(rental.extraCharges ?? 0) + Number(rental.fuelCharge ?? 0) - paid;
            if (totalOwed <= 0) continue;
            
            const sendM = async (level: 1 | 2 | 3) => {
                const mailRental = await loadMailRental(rental.id);
                if (!mailRental) return;
                const dueDate = new Date(today.getTime() + (level === 3 ? 7 : 10) * 24 * 60 * 60 * 1000);
                const sent = await sendEmail(rental.customer.email, emailTemplates.dunning(mailRental, {
                    level,
                    owed: totalOwed,
                    dueDate,
                    iban: process.env.COMPANY_IBAN || null,
                }));
                if (!sent) return;
                await prisma.mahnungRecord.create({
                    data: { rentalId: rental.id, level, amount: totalOwed, dueDate: new Date(rental.endDate) }
                });
                const update: any = { isOverdue: true };
                update[`mahnung${level}SentAt`] = today;
                await prisma.rental.update({ where: { id: rental.id }, data: update });
            };

            if (daysPast >= delays[3] && !rental.mahnung3SentAt) { await sendM(3); m3++; }
            else if (daysPast >= delays[2] && !rental.mahnung2SentAt) { await sendM(2); m2++; }
            else if (daysPast >= delays[1] && !rental.mahnung1SentAt) { await sendM(1); m1++; }
        }
        results.mahnwesen = { m1, m2, m3 };
    } catch (e: any) {
        results.mahnwesen = { error: e.message };
    }

    // 5. Review requests: once, the day after the car came back. Only with a review link configured.
    const reviewUrl = process.env.GOOGLE_REVIEW_URL;
    if (reviewUrl) {
        try {
            const yesterday = fromZonedTime(`${viennaDay(-1)}T00:00:00`, BUSINESS.TIME_ZONE);
            const startOfToday = fromZonedTime(`${viennaDay(0)}T00:00:00`, BUSINESS.TIME_ZONE);
            const returned = await prisma.rental.findMany({
                where: { status: 'Completed', actualReturnDate: { gte: yesterday, lt: startOfToday } },
                select: { id: true, customer: { select: { email: true } } },
            });
            let reviewSent = 0;
            for (const rental of returned) {
                const already = await prisma.notification.findFirst({
                    where: { type: 'ReviewRequest', relatedType: 'Rental', relatedId: rental.id },
                });
                if (already) continue;
                if (await sendRentalMail(rental.id, { type: 'reviewRequest', reviewUrl })) {
                    reviewSent++;
                    await prisma.notification.create({
                        data: { type: 'ReviewRequest', recipient: rental.customer.email, subject: 'Bewertungsanfrage', message: 'Bewertungsanfrage', status: 'Sent', sentAt: new Date(), relatedType: 'Rental', relatedId: rental.id },
                    });
                }
            }
            results.reviewRequests = { sent: reviewSent };
        } catch (e: any) {
            results.reviewRequests = { error: e.message };
        }
    }

    // 6. Cart Cleanup
    try {
        const cleanup = await prisma.cartSession.deleteMany({
            where: { expiresAt: { lte: today } }
        });
        results.cartCleanup = { cleaned: cleanup.count };
    } catch (e: any) {
        results.cartCleanup = { error: e.message };
    }

    // 7. Abandoned online checkouts (backstop for missed Stripe "expired" webhooks)
    try {
        results.staleOnlineBookings = { cancelled: await cancelStaleUnpaidRentals() };
        results.noShows = { cancelled: await cancelNoShowRentals() };
        results.lapsed = await closeLapsedRentals();
    } catch (e: any) {
        results.staleOnlineBookings = { error: e.message };
    }

    return NextResponse.json(results);
}
