import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { carId, maintenanceType, description, performedDate, cost, mileage, performedBy, notes } = body;

        if (!carId || !maintenanceType || !description) {
            return NextResponse.json({ error: 'Pflichtfelder fehlen (Fahrzeug, Wartungsart, Beschreibung).' }, { status: 400 });
        }

        const record = await prisma.maintenanceRecord.create({
            data: {
                carId: Number(carId),
                maintenanceType,
                description,
                performedDate: performedDate ? new Date(performedDate) : new Date(),
                cost: cost ? Number(cost) : null,
                mileage: mileage ? Number(mileage) : null,
                performedBy: performedBy || null,
                notes: notes || null,
            },
        });

        // Update car status if maintenance is today
        const perfDate = performedDate ? new Date(performedDate) : new Date();
        const isToday = new Date().toDateString() === perfDate.toDateString();
        if (isToday) {
            await prisma.car.update({
                where: { id: Number(carId) },
                data: { status: 'Maintenance' }
            });
        }

        revalidatePath('/admin/maintenance');
        revalidatePath('/admin/fleet');

        return NextResponse.json({ success: true, record });
    } catch (error) {
        console.error('Maintenance API error:', error);
        return NextResponse.json({ error: 'Fehler beim Speichern des Wartungseintrags.' }, { status: 500 });
    }
}
