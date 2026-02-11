import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const allOptions = await prisma.option.findMany({
        where: { status: 'active' }
    });

    const activeCars = await prisma.car.findMany();

    console.log(`Associating ${allOptions.length} options with ${activeCars.length} cars...`);

    for (const car of activeCars) {
        await prisma.car.update({
            where: { id: car.id },
            data: {
                options: {
                    connect: allOptions.map(opt => ({ id: opt.id }))
                }
            }
        });
        console.log(`Updated car: ${car.brand} ${car.model} (${car.plate})`);
    }

    console.log('Done!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
