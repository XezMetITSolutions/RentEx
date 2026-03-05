import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/km-transfer?customerId=X — Get balance + history
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (customerId) {
        const balance = await prisma.kmBalance.findUnique({
            where: { customerId: parseInt(customerId) },
        });
        const history = await prisma.kmTransfer.findMany({
            where: { OR: [{ fromId: parseInt(customerId) }, { toId: parseInt(customerId) }] },
            include: {
                from: { select: { id: true, firstName: true, lastName: true } },
                to: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        return NextResponse.json({ balance: balance?.balance ?? 0, history });
    }

    // Return all balances
    const balances = await prisma.kmBalance.findMany({
        include: {
            customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { balance: "desc" },
    });
    return NextResponse.json(balances);
}

// POST /api/admin/km-transfer — Execute a transfer between customers
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fromId, toId, amount, note } = body;

        if (!fromId || !toId || !amount || amount <= 0) {
            return NextResponse.json({ error: "fromId, toId und amount (> 0) erforderlich" }, { status: 400 });
        }
        if (fromId === toId) {
            return NextResponse.json({ error: "Absender und Empfänger dürfen nicht gleich sein" }, { status: 400 });
        }

        // Check sender balance
        const senderBalance = await prisma.kmBalance.findUnique({ where: { customerId: fromId } });
        if (!senderBalance || senderBalance.balance < amount) {
            return NextResponse.json({ error: "Nicht genug km-Guthaben" }, { status: 400 });
        }

        // Transaction: deduct from sender, add to receiver, create transfer record
        const [, , transfer] = await prisma.$transaction([
            prisma.kmBalance.update({
                where: { customerId: fromId },
                data: { balance: { decrement: amount } },
            }),
            prisma.kmBalance.upsert({
                where: { customerId: toId },
                update: { balance: { increment: amount } },
                create: { customerId: toId, balance: amount },
            }),
            prisma.kmTransfer.create({
                data: { fromId, toId, amount, note },
            }),
        ]);

        return NextResponse.json({ success: true, transfer });
    } catch (e) {
        return NextResponse.json({ error: "Fehler beim Transfer" }, { status: 500 });
    }
}
