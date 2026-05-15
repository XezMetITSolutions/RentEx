import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";

export async function GET() {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const cars = await prisma.car.findMany({
            select: {
                id: true,
                plate: true,
                brand: true,
                model: true,
            },
            orderBy: { plate: "asc" }
        });
        return NextResponse.json(cars);
    } catch (error) {
        return NextResponse.json({ error: "Fahrzeuge konnten nicht geladen werden" }, { status: 500 });
    }
}
