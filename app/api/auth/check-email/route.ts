import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * Tells the checkout whether to offer "sign in" for an e-mail. Only accounts
 * with a password count — guest records can book again without signing in —
 * and the endpoint is rate-limited so it can't be used to probe customer lists.
 */
export async function GET(request: NextRequest) {
    const rl = rateLimit(`check-email:${getClientIp(request)}`, { limit: 20, windowSeconds: 60 * 10 });
    if (!rl.allowed) {
        return NextResponse.json({ exists: false }, { status: 429 });
    }

    const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    if (!email) {
        return NextResponse.json({ exists: false });
    }

    const customer = await prisma.customer.findFirst({
        where: { email: { equals: email, mode: "insensitive" }, passwordHash: { not: null } },
        select: { id: true },
    });

    return NextResponse.json({ exists: !!customer });
}
