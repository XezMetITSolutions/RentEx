import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();
    
    if (!email) {
        return NextResponse.json({ exists: false });
    }
    
    const customer = await prisma.customer.findUnique({
        where: { email },
        select: { passwordHash: true }
    });

    // Only accounts with a password can log in; guest customers may book again
    // with the same e-mail, so they must not be asked to sign in.
    return NextResponse.json({ exists: !!customer?.passwordHash });
}
