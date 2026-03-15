import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
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
        return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 });
    }
}
