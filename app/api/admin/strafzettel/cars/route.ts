import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdminApiModule } from '@/lib/adminAccess';

export async function GET() {
    const auth = await requireAdminApiModule('Strafzettel');
    if (auth.response) return auth.response;
    const session = auth.session;

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
