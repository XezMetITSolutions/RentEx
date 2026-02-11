import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { carId, datum, startKm, endKm, zweck, fahrtzweck } = body;

        if (!carId || !datum || isNaN(startKm) || isNaN(endKm) || endKm < startKm) {
            return NextResponse.json({ error: 'Ungültige Daten (Fahrzeug, Start-/End-Kilometer).' }, { status: 400 });
        }

        const entry = await prisma.fahrtenbuchEntry.create({
            data: {
                carId: Number(carId),
                datum: new Date(datum),
                startKm: Number(startKm),
                endKm: Number(endKm),
                zweck: zweck === 'PRIVATFAHRT' ? 'PRIVATFAHRT' : 'DIENSTFAHRT',
                fahrtzweck: fahrtzweck?.trim() || null,
            },
        });

        revalidatePath('/admin/fahrtenbuch');
        revalidatePath('/admin/fleet');

        return NextResponse.json({ success: true, entry });
    } catch (error) {
        console.error('Fahrtenbuch API error:', error);
        return NextResponse.json({ error: 'Fehler beim Speichern des Eintrags.' }, { status: 500 });
    }
}
