
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Skoda Superb Kombi data...');

    // 1. Update Skoda Superb Kombi
    const result = await prisma.car.updateMany({
        where: { model: { contains: 'Superb' } },
        data: {
            dailyRate: 48.00,
            category: 'Kombi', // Using 'Kombi' as established in the fleet page logic
            transmission: 'Automatik',
            maxMileagePerDay: 100,
            depositAmount: 1500.00,
            description: 'Der Skoda Superb ist ein Fahrzeug der oberen Mittelklasse und überzeugt durch seine großzügige Raumgestaltung sowie hohen Komfort. Er bietet viel Platz, modernes Design und eignet sich sowohl für Geschäftsreisen als auch für längere Fahrten mit der Familie.',
            features: 'Obere Mittelklasse Kombi, Automatik, 100km/Tag inkl., Mehrkm: 0.45€, Kaskoschutz SB 1500€',
        }
    });

    console.log(`Updated ${result.count} Skoda Superb Kombi records.`);
    console.log('Skoda Superb Kombi update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
