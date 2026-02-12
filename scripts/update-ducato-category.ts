import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating all Fiat Ducato models to Kastenwagen category...');

    const result = await prisma.car.updateMany({
        where: {
            brand: {
                contains: 'Fiat',
                mode: 'insensitive',
            },
            model: {
                contains: 'Ducato',
                mode: 'insensitive',
            },
        },
        data: {
            category: 'Kastenwagen',
        },
    });

    console.log(`Updated ${result.count} vehicles.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
