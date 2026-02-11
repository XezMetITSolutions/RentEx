
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Hyundai Ioniq Elektro data...');

    // 1. Update Car Data
    const result = await prisma.car.updateMany({
        where: { model: { contains: 'Ioniq' } },
        data: {
            dailyRate: 30.00,
            fuelType: 'Elektro',
            transmission: 'Automatik',
            category: 'Mittelklasse', // Kompaktklasse as per description
            maxMileagePerDay: 100,
            depositAmount: 1500.00,
            description: 'Der Hyundai Ioniq Elektro ist ein sparsames und umweltfreundliches Fahrzeug mit moderner Technologie. Mit seiner Gesamtlänge von ca. 4,5 m bietet er trotz Kompaktklasse ausreichend Platz – auch für Familien mit Kindern. Dank mobiler Wallbox und Ladekabel kann das Fahrzeug flexibel geladen werden.',
            features: 'Elektro (38.3 kWh), Automatik, 100km/Tag inkl., Mobile Wallbox & Ladekabel inkl., Kaskoschutz SB 1500€',
        }
    });

    console.log(`Updated ${result.count} Hyundai Ioniq records.`);
    console.log('Hyundai Ioniq update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
