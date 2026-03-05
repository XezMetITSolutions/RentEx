import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/strafzettel
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const carId = searchParams.get("carId");

    const records = await prisma.strafzettelRecord.findMany({
        where: {
            ...(status ? { status } : {}),
            ...(carId ? { carId: parseInt(carId) } : {}),
        },
        include: {
            car: { select: { id: true, brand: true, model: true, plate: true } },
            rental: {
                select: {
                    id: true,
                    contractNumber: true,
                    customer: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            },
        },
        orderBy: { issuedDate: "desc" },
    });
    return NextResponse.json(records);
}

// POST /api/admin/strafzettel — Create new fine record
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { carId, rentalId, plate, issuedDate, issuedTime, incidentLocation,
            amount, authority, referenceNumber, notes, documentUrl } = body;

        if (!carId || !plate || !issuedDate) {
            return NextResponse.json({ error: "carId, plate und issuedDate erforderlich" }, { status: 400 });
        }

        const record = await prisma.strafzettelRecord.create({
            data: {
                carId: parseInt(carId),
                rentalId: rentalId ? parseInt(rentalId) : null,
                plate,
                issuedDate: new Date(issuedDate),
                issuedTime: issuedTime || null,
                incidentLocation: incidentLocation || null,
                amount: amount ? parseFloat(amount) : null,
                authority: authority || null,
                referenceNumber: referenceNumber || null,
                notes: notes || null,
                documentUrl: documentUrl || null,
            },
        });
        return NextResponse.json(record, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: "Fehler beim Erstellen" }, { status: 500 });
    }
}
