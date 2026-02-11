
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const cars = await prisma.car.findMany();
    const fuelTypes = [...new Set(cars.map(c => c.fuelType))];
    const transmissions = [...new Set(cars.map(c => c.transmission))];
    const categories = [...new Set(cars.map(c => c.category))];

    console.log('Categories:', categories.join(', '));
    console.log('Fuel Types:', fuelTypes.join(', '));
    console.log('Transmissions:', transmissions.join(', '));
}
main().finally(() => prisma.$disconnect());
