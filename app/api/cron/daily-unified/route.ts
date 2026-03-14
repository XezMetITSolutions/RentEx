import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const results: any = {
        birthday: null,
        mahnwesen: null,
        cartCleanup: null
    };

    // 1. Birthday Coupons
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
            await resend.emails.send({
                from: process.env.EMAIL_FROM || "noreply@rentex.at",
                to: customer.email,
                subject: `🎂 Alles Gute zum Geburtstag, ${customer.firstName}! Ihr Geschenk wartet.`,
                html: `<p>Alles Gute zum Geburtstag! Ihr Code: <strong>${code}</strong></p>`
            });
            birthdayProcessed++;
        }
        results.birthday = { processed: birthdayProcessed };
    } catch (e: any) {
        results.birthday = { error: e.message };
    }

    // 2. Mahnwesen
    try {
        const delays = { 1: 3, 2: 10, 3: 21 };
        const overdue = await prisma.rental.findMany({
            where: {
                paymentStatus: { in: ["Pending", "Partial"] },
                status: { in: ["Completed", "Active"] },
                endDate: { lt: today }
            },
            include: { customer: true, car: true }
        });

        let m1 = 0, m2 = 0, m3 = 0;
        for (const rental of overdue) {
            const daysPast = Math.floor((today.getTime() - new Date(rental.endDate).getTime()) / (1000 * 60 * 60 * 24));
            const totalOwed = Number(rental.totalAmount) - Number(rental.depositPaid ?? 0);
            
            const sendM = async (level: 1 | 2 | 3) => {
                await resend.emails.send({
                    from: process.env.EMAIL_FROM || "noreply@rentex.at",
                    to: rental.customer.email,
                    subject: `Mahnung ${level} - Rechnung ${rental.contractNumber ?? rental.id}`,
                    html: `<p>Sehr geehrte/r ${rental.customer.firstName}, bitte zahlen Sie € ${totalOwed.toFixed(2)}.</p>`
                });
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

    // 3. Cart Cleanup
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
