import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Kaution for all cars...');
    
    const result = await prisma.car.updateMany({
        data: {
            depositAmount: 750
        }
    });

    console.log(`Successfully updated ${result.count} cars.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
