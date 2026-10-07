import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { emailTemplates, sendEmail } from "@/lib/notificationTemplates";
import { requireAdminApiModule } from '@/lib/adminAccess';

// POST /api/admin/agb/[id]/activate — Activate version & notify all customers
export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAdminApiModule('AGB Versionen');
    if (auth.response) return auth.response;
    const session = auth.session;

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
            where: { isBlacklisted: false, isActive: true, gdprDeleteRequestedAt: null },
            select: { email: true, firstName: true, lastName: true },
        });

        let notifiedCount = 0;
        for (const customer of customers) {
            if (await sendEmail(customer.email, emailTemplates.agbUpdate(customer, { version: agb.version }))) {
                notifiedCount++;
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
