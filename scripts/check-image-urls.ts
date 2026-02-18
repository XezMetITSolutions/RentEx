
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUrls() {
    const cars = await prisma.car.findMany({
        select: {
            id: true,
            brand: true,
            model: true,
            imageUrl: true,
            images: true
        },
        take: 5
    });

    console.log('--- Sample Car URLs ---');
    cars.forEach(car => {
        console.log(`Car: ${car.brand} ${car.model} (ID: ${car.id})`);
        console.log(`  Main Image: ${car.imageUrl}`);
        if (car.images) {
            try {
                const imgs = JSON.parse(car.images);
                console.log(`  First Gallery Image: ${imgs[0]}`);
            } catch (e) {
                console.log(`  Gallery: Invalid JSON`);
            }
        }
    });

    await prisma.$disconnect();
}

checkUrls();
