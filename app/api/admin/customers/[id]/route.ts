import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await req.json();
        
        const customer = await prisma.customer.update({
            where: { id },
            data: {
                isActive: body.isActive,
                firstName: body.firstName,
                lastName: body.lastName,
                email: body.email,
                phone: body.phone,
                // Add other fields as needed
            }
        });

        return NextResponse.json(customer);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        
        // Optional: Check if customer has active rentals before deleting
        const activeRentals = await prisma.rental.count({
            where: {
                customerId: id,
                status: { in: ['Active', 'Pending'] }
            }
        });

        if (activeRentals > 0) {
            return NextResponse.json({ 
                error: "Kunde kann nicht gelöscht werden, da noch aktive oder ausstehende Vermietungen bestehen." 
            }, { status: 400 });
        }

        await prisma.customer.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
