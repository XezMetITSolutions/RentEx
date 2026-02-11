
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Ford Transit Custom L2 (Langversion) Automatik data...');

    // 1. Update Car Data
    const result = await prisma.car.updateMany({
        where: { model: { contains: 'Langversion' } },
        data: {
            category: 'Bus',
            dailyRate: 84.00,
            transmission: 'Automatik',
            maxMileagePerDay: 150,
            depositAmount: 1500.00,
            seats: 9,
            description: 'Der Ford Transit Custom 9-Sitzer Langversion mit Automatik kombiniert Stil, Qualität und Attraktivität mit außergewöhnlichem Komfort und moderner Technologie. Ideal für größere Gruppen, Familienausflüge oder geschäftliche Fahrten mit maximalem Komfort.',
            features: '9-Sitzer, Langversion, Automatik, 150km/Tag inkl., Mehrkm: 0.42€, Kaskoschutz SB 1500€',
        }
    });

    console.log(`Updated ${result.count} Ford Transit Custom L2 records.`);
    console.log('Ford Transit Custom L2 update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
