import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const carId = searchParams.get("carId");
        const date = searchParams.get("date"); // YYYY-MM-DD
        const time = searchParams.get("time"); // HH:mm

        if (!carId || !date) {
            return NextResponse.json({ error: "carId and date are required" }, { status: 400 });
        }

        // We use the date and time to create a timestamp. 
        // Note: We should be careful about the timezone. 
        // Assuming the DB stores UTC and we are in a specific region.
        // For simplicity, we'll construct the date string.
        const dateTimeStr = time ? `${date}T${time}` : `${date}T12:00:00`;
        const targetDate = new Date(dateTimeStr);

        // Find the rental that was active at that time
        const rental = await prisma.rental.findFirst({
            where: {
                carId: parseInt(carId),
                startDate: { lte: targetDate },
                endDate: { gte: targetDate },
                status: { not: "Cancelled" }
            },
            include: {
                customer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc' // In case of overlapping (shouldn't happen but just in case)
            }
        });

        if (!rental) {
            return NextResponse.json({ message: "No active rental found for this time." }, { status: 404 });
        }

        return NextResponse.json(rental);
    } catch (error) {
        console.error("Lookup error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
