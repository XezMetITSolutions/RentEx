import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/cron/cart-cleanup
 * Run every 5 minutes — removes expired cart sessions and unlocks cars
 */
export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const result = await prisma.cartSession.deleteMany({
        where: { expiresAt: { lte: now } },
    });

    return NextResponse.json({ cleaned: result.count, timestamp: now.toISOString() });
}
