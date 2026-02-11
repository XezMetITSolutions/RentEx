
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating passenger seat counts...');

    // 1. Fiat Ducato -> 3 Seats
    const ducatos = await prisma.car.updateMany({
        where: { model: { contains: 'Ducato' } },
        data: { seats: 3 }
    });
    console.log(`Updated ${ducatos.count} Fiat Ducato records to 3 seats.`);

    // 2. Ford Transit (Transporter types) -> 3 Seats
    // Note: The user previously specified 9 seats for Transit Custom L1 and L2 (Langversion).
    // But now says "ford transit ve fiat ducatolar 3 kisilik".
    // I will prioritize this latest instruction.
    const transits = await prisma.car.updateMany({
        where: {
            brand: 'Ford',
            model: { contains: 'Transit' }
        },
        data: { seats: 3 }
    });
    console.log(`Updated ${transits.count} Ford Transit records to 3 seats.`);

    // 3. Peugeot Traveller -> 9 Seats
    const peugeots = await prisma.car.updateMany({
        where: { brand: 'Peugeot' },
        data: { seats: 9 }
    });
    console.log(`Updated ${peugeots.count} Peugeot records to 9 seats.`);

    // 4. All Others -> 5 Seats
    // (VW Golf, Skoda Superb, Seat Leon, Hyundai Ioniq, VW Polo, Opel Corsa, Mustang Mach-E)
    const others = await prisma.car.updateMany({
        where: {
            brand: {
                notIn: ['Fiat', 'Ford', 'Peugeot']
            }
        },
        data: { seats: 5 }
    });
    console.log(`Updated ${others.count} other car records to 5 seats.`);

    console.log('Passenger seat count update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
