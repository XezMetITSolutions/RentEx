import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Single location
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const location = await prisma.location.findUnique({
            where: { id: parseInt(params.id) },
            include: {
                _count: {
                    select: {
                        cars: true,
                        homeCars: true,
                    }
                }
            }
        });

        if (!location) {
            return NextResponse.json(
                { error: 'Location not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(location);
    } catch (error) {
        console.error('Error fetching location:', error);
        return NextResponse.json(
            { error: 'Failed to fetch location' },
            { status: 500 }
        );
    }
}

// PUT - Update location
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();

        const location = await prisma.location.update({
            where: { id: parseInt(params.id) },
            data: {
                name: body.name,
                code: body.code || null,
                address: body.address || null,
                city: body.city || null,
                country: body.country || 'Österreich',
                phone: body.phone || null,
                email: body.email || null,
                latitude: body.latitude,
                longitude: body.longitude,
                openingTime: body.openingTime || null,
                closingTime: body.closingTime || null,
                isOpenSundays: body.isOpenSundays || false,
                status: body.status || 'active',
            }
        });

        return NextResponse.json(location);
    } catch (error) {
        console.error('Error updating location:', error);
        return NextResponse.json(
            { error: 'Failed to update location' },
            { status: 500 }
        );
    }
}

// DELETE - Delete location
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check if there are any cars assigned to this location
        const carsAtLocation = await prisma.car.count({
            where: {
                OR: [
                    { locationId: parseInt(params.id) },
                    { homeLocationId: parseInt(params.id) }
                ]
            }
        });

        if (carsAtLocation > 0) {
            return NextResponse.json(
                { error: `Dieser Standort kann nicht gelöscht werden, da ${carsAtLocation} Fahrzeug(e) zugewiesen sind. Bitte weisen Sie die Fahrzeuge zuerst einem anderen Standort zu.` },
                { status: 400 }
            );
        }

        await prisma.location.delete({
            where: { id: parseInt(params.id) }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting location:', error);
        return NextResponse.json(
            { error: 'Failed to delete location' },
            { status: 500 }
        );
    }
}
