import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/admin/strafzettel/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const updated = await prisma.strafzettelRecord.update({
            where: { id: parseInt(id) },
            data: {
                status: body.status,
                forwardedToCustomerAt: body.forwardedToCustomerAt
                    ? new Date(body.forwardedToCustomerAt) : undefined,
                paidAt: body.paidAt ? new Date(body.paidAt) : undefined,
                paidBy: body.paidBy,
                notes: body.notes,
                amount: body.amount ? parseFloat(body.amount) : undefined,
                referenceNumber: body.referenceNumber,
                authority: body.authority,
            },
        });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
    }
}

// DELETE /api/admin/strafzettel/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await prisma.strafzettelRecord.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
}
