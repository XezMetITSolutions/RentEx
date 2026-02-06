
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const cars = await prisma.car.findMany({
        select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            color: true,
            imageUrl: true,
        },
    });

    console.log(JSON.stringify(cars, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
