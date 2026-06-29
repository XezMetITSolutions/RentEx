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
        select: { id: true }
    });
    
    return NextResponse.json({ exists: !!customer });
}
