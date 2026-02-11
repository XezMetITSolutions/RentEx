
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Seat Leon Kombi data...');

    // 1. Update Seat Leon Kombi
    const result = await prisma.car.updateMany({
        where: { model: { contains: 'Leon' } },
        data: {
            dailyRate: 33.90,
            category: 'Kombi',
            maxMileagePerDay: 100,
            depositAmount: 1500.00,
            description: 'Sie möchten einen wendigen Kombi in der Mittelklasse mieten? Der Seat Leon Kombi ist die ideale Lösung – ob für eine Reise mit der Familie oder für geschäftliche Fahrten. Dank moderner Ausstattung und smarten Funktionen wird jede Fahrt komfortabel und angenehm.',
            features: 'Mittelklasse Kombi, 100km/Tag inkl., Mehrkm: 0.36€, Kaskoschutz SB 1500€',
        }
    });

    console.log(`Updated ${result.count} Seat Leon Kombi records.`);
    console.log('Seat Leon Kombi update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
