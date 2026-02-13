import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const cars = await prisma.car.findMany({
        where: { category: 'Transporter' },
        select: { brand: true, model: true, plate: true }
    });
    fs.writeFileSync('transporters.json', JSON.stringify(cars, null, 2));
}

main().finally(() => prisma.$disconnect());
