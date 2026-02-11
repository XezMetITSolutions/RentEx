
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating car images from local assets...');

    const updates = [
        { model: 'Golf Kombi', imageUrl: '/assets/cars/VW Golf Kombi.png' },
        { model: 'Polo', imageUrl: '/assets/cars/VWPolo.png' },
        { model: 'Ducato L3H2', imageUrl: '/assets/cars/Fiat Ducato L3H2.png' },
        { model: 'Ducato L4H2', imageUrl: '/assets/cars/Fiat Ducato L4H2.png' },
        { model: 'Ducato', imageUrl: '/assets/cars/fiat_ducato.png' }, // Fallback for other Ducatos
        { model: 'Superb Kombi', imageUrl: '/assets/cars/Skoda Superb Kombi.png' },
        { model: 'Transit Custom L1', imageUrl: '/assets/cars/Ford Transit Custom L1.png' },
        { model: 'Transit Custom Langversion', imageUrl: '/assets/cars/Ford Transit Custom Langversion Automatik.png' },
        { model: 'Ioniq Elektro', imageUrl: '/assets/cars/Hyundai Ioniq Elektro.png' },
        { model: 'Mustang Mach-E GT', imageUrl: '/assets/cars/Ford Mustang Mach-E GT.png' },
        { model: 'Leon Kombi', imageUrl: '/assets/cars/Seat Leon Kombi.png' },
        { model: 'Corsa', imageUrl: '/assets/cars/OpelCorsa.png' },
        { model: 'Traveller', imageUrl: '/assets/cars/Peugeot Traveller Automatic.png' },
    ];

    for (const update of updates) {
        const result = await prisma.car.updateMany({
            where: {
                model: { contains: update.model },
            },
            data: {
                imageUrl: update.imageUrl,
            },
        });
        console.log(`Updated ${result.count} cars containing "${update.model}" with image "${update.imageUrl}"`);
    }

    // Special handling for edge cases if any
    console.log('Car images updated successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
