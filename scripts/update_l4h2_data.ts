
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Fiat Ducato L4H2 data...');

    // 1. Update Car Data
    const result = await prisma.car.updateMany({
        where: { model: 'Ducato L4H2' },
        data: {
            dailyRate: 59.00,
            maxMileagePerDay: 100,
            depositAmount: 1500.00,
            description: 'Der Fiat Ducato L4H2 ist ideal für den Transport von Fahrzeugen oder großen Möbeln wie Küchen-, Wohn- oder Schlafzimmermöbeln. Mit diesem Transporter können Sie Waren ausliefern oder alte Möbel zur Müllhalde bringen.',
            features: 'Ladevolumen 15 m³, 4.0m Laderaum, 100km/Tag inkl., Mehrkm: 0.24€, Kaskoschutz SB 1500€',
        }
    });

    console.log(`Updated ${result.count} Fiat Ducato L4H2 records.`);
    console.log('Fiat Ducato L4H2 update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
