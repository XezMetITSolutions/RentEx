
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // VW Golf Kombi
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Golf Kombi' },
        },
        data: {
            imageUrl: 'https://www.pngmart.com/files/22/Volkswagen-Golf-Variant-PNG-Free-Download.png',
        },
    });

    // Fiat Ducato (All variants)
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Ducato' },
        },
        data: {
            imageUrl: 'https://www.pngmart.com/files/5/Fiat-Ducato-PNG-Image.png',
        },
    });

    // Skoda Superb Kombi
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Superb Kombi' },
        },
        data: {
            imageUrl: 'https://www.pngmart.com/files/22/Skoda-Superb-Combi-PNG-Photos.png',
        },
    });

    // Ford Transit Custom
    await prisma.car.updateMany({
        where: {
            model: { contains: 'Transit Custom' },
        },
        data: {
            imageUrl: 'https://www.pngmart.com/files/22/Ford-Transit-PNG-Clipart.png',
        },
    });

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
