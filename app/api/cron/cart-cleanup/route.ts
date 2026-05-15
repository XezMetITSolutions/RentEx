import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST /api/cron/cart-cleanup
 * Run every 5 minutes — removes expired cart sessions and unlocks cars
 */
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


    const now = new Date();
    const result = await prisma.cartSession.deleteMany({
        where: { expiresAt: { lte: now } },
    });

    return NextResponse.json({ cleaned: result.count, timestamp: now.toISOString() });
}
