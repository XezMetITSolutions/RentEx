import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        // Check if Feldkirch location already exists
        const existingLocation = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: 'Rent-Ex Feldkirch' },
                    { code: 'FK-01' }
                ]
            }
        });

        if (existingLocation) {
            return NextResponse.json(
                {
                    error: 'Standort existiert bereits',
                    message: 'Der Feldkirch Standort ist bereits in der Datenbank vorhanden.',
                    location: existingLocation
                },
                { status: 400 }
            );
        }

        // Create Feldkirch location
        const feldkirch = await prisma.location.create({
            data: {
                name: 'Rent-Ex Feldkirch',
                code: 'FK-01',
                address: 'Illstraße 75a',
                city: '6800 Feldkirch',
                country: 'Österreich',
                phone: '+43 5522 12345',
                email: 'feldkirch@rent-ex.at',
                latitude: 47.2394,
                longitude: 9.5941,
                openingTime: '08:00',
                closingTime: '18:00',
                isOpenSundays: false,
                status: 'active'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Feldkirch Standort erfolgreich hinzugefügt',
            location: feldkirch
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating Feldkirch location:', error);
        return NextResponse.json(
            { error: 'Datenbankfehler beim Erstellen des Standorts' },
            { status: 500 }
        );
    }
}
