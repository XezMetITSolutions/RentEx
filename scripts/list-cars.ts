
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listCars() {
    try {
        const cars = await prisma.car.findMany({
            select: {
                id: true,
                brand: true,
                model: true,
                plate: true
            },
            orderBy: {
                brand: 'asc'
            }
        });

        console.log('--- CAR LIST ---');
        cars.forEach(car => {
            console.log(`[${car.id}] ${car.brand} ${car.model} (${car.plate})`);
        });
        console.log('--- END LIST ---');
    } catch (error) {
        console.error('Error fetching cars:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listCars();
