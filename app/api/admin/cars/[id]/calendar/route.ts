import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminAuth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const { id } = await params;
    const carId = parseInt(id);

    if (isNaN(carId)) {
        return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 });
    }

    try {
        const car = await prisma.car.findUnique({
            where: { id: carId },
            include: {
                rentals: {
                    where: { status: { not: 'Cancelled' } },
                    include: { customer: true }
                },
                maintenanceRecords: true,
                tasks: true
            }
        });

        if (!car) {
            return NextResponse.json({ error: 'Fahrzeug nicht gefunden' }, { status: 404 });
        }

        return NextResponse.json({
            rentals: car.rentals,
            maintenance: car.maintenanceRecords,
            tasks: car.tasks
        });
    } catch (error) {
        return NextResponse.json({ error: 'Datenbankfehler' }, { status: 500 });
    }
}
