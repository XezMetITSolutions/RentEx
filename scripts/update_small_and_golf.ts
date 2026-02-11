
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Small Cars and Golf Kombi data...');

    // 1. Update VW Polo & Opel Corsa
    const smallCars = await prisma.car.updateMany({
        where: {
            OR: [
                { model: { contains: 'Polo' } },
                { model: { contains: 'Corsa' } }
            ]
        },
        data: {
            dailyRate: 30.00,
            category: 'Kleinwagen',
            maxMileagePerDay: 100,
            depositAmount: 1500.00,
            description: 'Ein Kleinwagen für den stilvollen Auftritt. Der Stadtflitzer bietet Platz und Komfort, ist aber dennoch wendig und agil. Mit einem Kleinwagen kommen Sie nahezu in jede Parklücke hinein.',
            features: 'Kleinwagen, 100km/Tag inkl., Mehrkm: 0.33€, Kaskoschutz SB 1500€',
        }
    });
    console.log(`Updated ${smallCars.count} Small Car records (Polo/Corsa).`);

    // 2. Update VW Golf Kombi
    const golfKombi = await prisma.car.updateMany({
        where: { model: { contains: 'Golf Kombi' } },
        data: {
            dailyRate: 32.50,
            category: 'Kombi',
            maxMileagePerDay: 100,
            depositAmount: 1500.00,
            description: 'Sie möchten einen wendigen Kombi in der Mittelklasse mieten? Kein Problem! Ein Fahrzeug dieser Kategorie ist die ideale Lösung – ob für eine Reise mit der Familie oder für geschäftliche Fahrten. Dank moderner Ausstattung und smarten Funktionen wird jede Fahrt noch komfortabler.',
            features: 'Mittelklasse Kombi, 100km/Tag inkl., Mehrkm: 0.36€, Kaskoschutz SB 1500€',
        }
    });
    console.log(`Updated ${golfKombi.count} VW Golf Kombi records.`);

    console.log('Small Cars and Golf Kombi update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
