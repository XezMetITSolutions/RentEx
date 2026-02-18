
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching current car makes and models from the database...');

    const cars = await prisma.car.findMany({
        select: {
            brand: true,
            model: true,
            id: true
        },
        orderBy: [
            { brand: 'asc' },
            { model: 'asc' }
        ]
    });

    // Group by Brand
    const brandMap: Record<string, string[]> = {};
    const uniquePairs = new Set<string>();

    cars.forEach(car => {
        const key = `${car.brand}-${car.model}`;
        if (!uniquePairs.has(key)) {
            uniquePairs.add(key);
            if (!brandMap[car.brand]) {
                brandMap[car.brand] = [];
            }
            brandMap[car.brand].push(car.model);
        }
    });

    const output = JSON.stringify(brandMap, null, 2);
    fs.writeFileSync('current_cars_list.json', output);
    console.log('List written to current_cars_list.json');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
