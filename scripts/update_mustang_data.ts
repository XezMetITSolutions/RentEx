
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Ford Mustang Mach-E GT data...');

    // 1. Update Car Data
    const result = await prisma.car.updateMany({
        where: { model: { contains: 'Mustang' } },
        data: {
            dailyRate: 54.00,
            fuelType: 'Elektro',
            transmission: 'Automatik',
            category: 'SUV',
            maxMileagePerDay: 100,
            depositAmount: 1500.00,
            description: 'Der Ford Mustang Mach-E GT ist ein kraftvolles Elektro-SUV, das die Mustang-Tradition in die Elektromobilität überführt. Er bietet elegantes Design, moderne Technologie und hohen Komfort. Ausgestattet mit großem Touchscreen, App-Unterstützung zur Fernsteuerung und Routenplanung sowie umfassenden Sicherheitssystemen.',
            features: 'Elektro-SUV, Automatik, 100km/Tag inkl., Ladekarte inkl., Mehrkm: 0.45€, Kaskoschutz SB 1500€',
        }
    });

    console.log(`Updated ${result.count} Ford Mustang Mach-E GT records.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
