
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Ford Transit Custom L1 data...');

    // 1. Update Car Data
    const result = await prisma.car.updateMany({
        where: { model: { contains: 'Transit Custom L1' } },
        data: {
            dailyRate: 74.00,
            maxMileagePerDay: 150,
            depositAmount: 1500.00,
            seats: 9,
            description: 'Der Ford Transit Custom 9-Sitzer kombiniert individuellen Stil, Qualität und Attraktivität mit außergewöhnlichem Komfort, schlankem Design und fortschrittlicher Technologie. Ideal für Familienausflüge, Gruppenreisen oder geschäftliche Fahrten.',
            features: '9-Sitzer, 150km/Tag inkl., Mehrkm: 0.42€, Kaskoschutz SB 1500€',
        }
    });

    console.log(`Updated ${result.count} Ford Transit Custom L1 records.`);
    console.log('Ford Transit Custom L1 update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
