import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Austrian license plate prefixes for Vorarlberg (Feldkirch region)
const AUSTRIAN_PREFIXES = ['FK', 'BZ', 'DO', 'BL', 'FE'];

function generateAustrianPlate(index: number): string {
    const prefix = AUSTRIAN_PREFIXES[index % AUSTRIAN_PREFIXES.length];
    const number = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${prefix} ${number} ${letters}`;
}

export async function POST(request: NextRequest) {
    try {
        // Find Feldkirch location
        const feldkirch = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: 'Rent-Ex Feldkirch' },
                    { code: 'FK-01' }
                ]
            }
        });

        if (!feldkirch) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Feldkirch-Standort nicht gefunden. Bitte initialisieren Sie zuerst den Standort.'
                },
                { status: 404 }
            );
        }

        // Get all active cars
        const cars = await prisma.car.findMany({
            where: {
                isActive: true
            }
        });

        if (cars.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Keine Fahrzeuge in der Datenbank gefunden.',
                totalCars: 0,
                platesUpdated: 0,
                locationName: feldkirch.name,
                updates: []
            });
        }

        let updated = 0;
        let platesUpdated = 0;
        const updates: Array<{ brand: string; model: string; oldPlate: string; newPlate: string }> = [];

        for (let i = 0; i < cars.length; i++) {
            const car = cars[i];
            const updateData: any = {
                locationId: feldkirch.id,
                homeLocationId: feldkirch.id,
            };

            // Check if plate needs Austrian format
            const needsNewPlate = !car.plate ||
                !car.plate.match(/^(FK|BZ|DO|BL|FE)\s\d{4}\s[A-Z]{2}$/);

            if (needsNewPlate) {
                let newPlate = generateAustrianPlate(i);

                // Ensure unique plate
                let isUnique = false;
                let attempts = 0;
                while (!isUnique && attempts < 10) {
                    const existing = await prisma.car.findUnique({
                        where: { plate: newPlate }
                    });
                    if (!existing || existing.id === car.id) {
                        isUnique = true;
                    } else {
                        newPlate = generateAustrianPlate(i + attempts);
                        attempts++;
                    }
                }

                updateData.plate = newPlate;
                platesUpdated++;

                updates.push({
                    brand: car.brand || '',
                    model: car.model || '',
                    oldPlate: car.plate || 'N/A',
                    newPlate: newPlate
                });
            }

            await prisma.car.update({
                where: { id: car.id },
                data: updateData
            });

            updated++;
        }

        return NextResponse.json({
            success: true,
            message: `${updated} Fahrzeug(e) wurden erfolgreich dem Standort Feldkirch zugewiesen.`,
            totalCars: updated,
            platesUpdated: platesUpdated,
            locationName: feldkirch.name,
            updates: updates.slice(0, 20) // Limit to 20 for display
        });

    } catch (error) {
        console.error('Error assigning cars to Feldkirch:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Fehler beim Zuweisen der Fahrzeuge zur Datenbank.'
            },
            { status: 500 }
        );
    }
}
