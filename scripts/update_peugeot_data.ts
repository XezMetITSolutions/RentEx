
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Peugeot Traveller Automatik and Small Car Options...');

    // 1. Update Peugeot Traveller Data
    const travellerResult = await prisma.car.updateMany({
        where: { model: { contains: 'Traveller' } },
        data: {
            dailyRate: 75.00,
            transmission: 'Automatik',
            maxMileagePerDay: 100,
            depositAmount: 1500.00,
            seats: 9,
            description: 'Mieten Sie unseren komfortablen 9-Sitzer Peugeot Traveller Expert für Ihre nächste Reise oder Veranstaltung. Ideal für Gruppen von Freunden, Familien oder Geschäftsreisende.',
            features: '9-Sitzer, Automatik, 100km/Tag inkl., Kaskoschutz SB 1500€',
        }
    });
    console.log(`Updated ${travellerResult.count} Peugeot Traveller records.`);

    // 2. Add/Update Small Car Mileage Packages (Kleinwagen)
    const smallCarOptions = [
        { name: 'Mehrkilometer 200 Paket (Kleinwagen)', price: 50.00, type: 'package', isPerDay: false },
        { name: 'Mehrkilometer 500 Paket (Kleinwagen)', price: 125.00, type: 'package', isPerDay: false },
        { name: 'Mehrkilometer 900 Paket (Kleinwagen)', price: 225.00, type: 'package', isPerDay: false },
        { name: 'Mehrkilometer 1500 Paket (Kleinwagen)', price: 375.00, type: 'package', isPerDay: false },
    ];

    for (const opt of smallCarOptions) {
        // Find existing or create new
        const existing = await prisma.option.findFirst({ where: { name: opt.name } });
        if (existing) {
            await prisma.option.update({
                where: { id: existing.id },
                data: opt
            });
        } else {
            await prisma.option.create({
                data: opt
            });
        }
    }
    console.log(`Added/Updated ${smallCarOptions.length} Kleinwagen mileage packages.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
