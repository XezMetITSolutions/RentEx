
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const cars = await prisma.car.findMany({
        where: { model: { contains: 'Transit' } },
        select: { id: true, brand: true, model: true }
    });
    console.log(JSON.stringify(cars, null, 2));
}
main().finally(() => prisma.$disconnect());
