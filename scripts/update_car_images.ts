
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating car images from local assets...');

    const updates = [
        { model: { equals: 'Ducato L3H2' }, imageUrl: '/assets/cars/Fiat Ducato L3H2.png' },
        { model: { equals: 'Ducato L4H2' }, imageUrl: '/assets/cars/Fiat Ducato L4H2.png' },
        { model: { contains: 'Golf Kombi' }, imageUrl: '/assets/cars/VW Golf Kombi.png' },
        { model: { contains: 'Polo' }, imageUrl: '/assets/cars/VWPolo.png' },
        { model: { contains: 'Superb Kombi' }, imageUrl: '/assets/cars/Skoda Superb Kombi.png' },
        { model: { contains: 'Transit Custom L1' }, imageUrl: '/assets/cars/Ford Transit Custom L1.png' },
        { model: { contains: 'Transit Custom Langversion' }, imageUrl: '/assets/cars/Ford Transit Custom Langversion Automatik.png' },
        { model: { contains: 'Ioniq Elektro' }, imageUrl: '/assets/cars/Hyundai Ioniq Elektro.png' },
        { model: { contains: 'Mustang Mach-E GT' }, imageUrl: '/assets/cars/Ford Mustang Mach-E GT.png' },
        { model: { contains: 'Leon Kombi' }, imageUrl: '/assets/cars/Seat Leon Kombi.png' },
        { model: { contains: 'Corsa' }, imageUrl: '/assets/cars/OpelCorsa.png' },
        { model: { contains: 'Traveller' }, imageUrl: '/assets/cars/Peugeot Traveller Automatic.png' },
        { model: { contains: 'Ducato', notIn: ['Ducato L3H2', 'Ducato L4H2'] }, imageUrl: '/assets/cars/fiat_ducato.png' },
    ];

    for (const update of updates) {
        const result = await prisma.car.updateMany({
            where: {
                model: update.model as any,
            },
            data: {
                imageUrl: update.imageUrl,
            },
        });
        console.log(`Updated ${result.count} cars with pattern "${JSON.stringify(update.model)}" to "${update.imageUrl}"`);
    }

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
