
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const cars = await prisma.car.findMany({
        select: { id: true, brand: true, model: true }
    });
    cars.forEach(car => {
        console.log(`ID: ${car.id} | ${car.brand} ${car.model}`);
    });
}
main().finally(() => prisma.$disconnect());
