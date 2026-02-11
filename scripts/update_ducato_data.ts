
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Fiat Ducato L3H2 data and seeding options...');

    // 1. Update Car Data
    const updatedCar = await prisma.car.updateMany({
        where: { model: 'Ducato L3H2' },
        data: {
            dailyRate: 59.00,
            maxMileagePerDay: 100,
            depositAmount: 1500.00,
            description: 'Ladevolumen: 11–13 m³, Maximale Laderaumlänge: 3,2 – 3,7 Meter. Inklusive 100 km pro Tag. Kaskoschutz: SB 1500 €.',
            features: 'Ladevolumen 11-13m³, 3.2-3.7m Laderaum, 100km/Tag inkl., Kaskoschutz SB 1500€',
        }
    });
    console.log(`Updated ${updatedCar.count} Fiat Ducato L3H2 records.`);

    // 2. Clear and Seed Options (Mileage Packages & Extras)
    // We clear them first to avoid duplicates since name is not unique
    await prisma.option.deleteMany({});
    console.log('Cleared existing options.');

    const allOptions = [
        // Mileage Packages
        { name: '200 km Paket', price: 66.00, type: 'package', isPerDay: false },
        { name: '500 km Paket', price: 150.00, type: 'package', isPerDay: false },
        { name: '900 km Paket', price: 247.00, type: 'package', isPerDay: false },
        { name: '1500 km Paket', price: 400.00, type: 'package', isPerDay: false },
        { name: '2000 km Paket', price: 519.00, type: 'package', isPerDay: false },
        // Insurance & Extras
        { name: 'Selbstbehalt-Ermäßigung', price: 8.64, type: 'insurance', isPerDay: true },
        { name: 'Zusatzfahrer', price: 4.80, type: 'extra', isPerDay: true },
        { name: 'Kindersitz (9–18 kg)', price: 4.80, type: 'extra', isPerDay: true },
        { name: 'Kindersitzerhöhung (15–36 kg)', price: 2.40, type: 'extra', isPerDay: true },
    ];

    for (const opt of allOptions) {
        await prisma.option.create({
            data: opt,
        });
    }
    console.log(`Seeded ${allOptions.length} options.`);

    console.log('Data update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
