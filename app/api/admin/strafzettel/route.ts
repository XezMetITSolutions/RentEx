import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { FEES_CONFIG } from "@/lib/config";
import { ApiErrorHandler } from "@/lib/errors";

// GET /api/admin/strafzettel
export async function GET(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return ApiErrorHandler.unauthorized("Nicht autorisiert");
    }

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
    const session = await getAdminSession();
    if (!session) {
        return ApiErrorHandler.unauthorized("Nicht autorisiert");
    }

    try {
        const body = await req.json();
        const { carId, rentalId, plate, issuedDate, issuedTime, incidentLocation,
            amount, authority, referenceNumber, notes, documentUrl, addServiceFee } = body;

        if (!carId || !plate || !issuedDate) {
            return ApiErrorHandler.badRequest("carId, plate und issuedDate erforderlich");
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

        // Add service fee if requested and rental exists
        if (addServiceFee && rentalId) {
            const rid = parseInt(rentalId);
            
            let option = await prisma.option.findFirst({
                where: { name: "Strafzettel Bearbeitungsgebühr" }
            });

            if (!option) {
                option = await prisma.option.create({
                    data: {
                        name: "Strafzettel Bearbeitungsgebühr",
                        description: "Administrative Bearbeitung von Verkehrsübertretungen",
                        price: FEES_CONFIG.STRAFZETTEL_PROCESSING_FEE,
                        type: "Extra"
                    }
                });
            }

            await prisma.rentalOption.create({
                data: {
                    rentalId: rid,
                    optionId: option.id
                }
            });

            const rental = await prisma.rental.findUnique({ where: { id: rid } });
            if (rental) {
                await prisma.rental.update({
                    where: { id: rid },
                    data: { totalAmount: Number(rental.totalAmount) + FEES_CONFIG.STRAFZETTEL_PROCESSING_FEE }
                });
            }
        }

        return ApiErrorHandler.json(record, 201);
    } catch (e) {
        console.error('[POST /api/admin/strafzettel]', e);
        return ApiErrorHandler.serverError("Fehler beim Erstellen");
    }
}
