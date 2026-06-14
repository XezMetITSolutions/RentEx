import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const options = await prisma.option.findMany();
    console.log(`Total options count: ${options.length}`);
    const nullCarId = options.filter(o => o.carId === null);
    console.log(`Options with carId = null: ${nullCarId.length}`);
    console.log(nullCarId);
}

main().catch(console.error).finally(() => prisma.$disconnect());
