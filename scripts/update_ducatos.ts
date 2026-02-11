
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Fiat Ducato images...');

    // Update L3H2
    const l3h2 = await prisma.car.updateMany({
        where: { model: 'Ducato L3H2' },
        data: { imageUrl: '/assets/cars/Fiat Ducato L3H2.png' }
    });
    console.log(`Updated ${l3h2.count} L3H2 cars.`);

    // Update L4H2
    const l4h2 = await prisma.car.updateMany({
        where: { model: 'Ducato L4H2' },
        data: { imageUrl: '/assets/cars/Fiat Ducato L4H2.png' }
    });
    console.log(`Updated ${l4h2.count} L4H2 cars.`);

    // Generic Ducato (for others like L2H2 if they exist)
    const generic = await prisma.car.updateMany({
        where: {
            model: {
                contains: 'Ducato',
                notIn: ['Ducato L3H2', 'Ducato L4H2']
            }
        },
        data: { imageUrl: '/assets/cars/fiat_ducato.png' }
    });
    console.log(`Updated ${generic.count} other Ducato cars.`);

    console.log('Fiat Ducato images updated successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
