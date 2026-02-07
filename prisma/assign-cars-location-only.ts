/**
 * Weist alle Fahrzeuge dem Standort "Rent-Ex Feldkirch" zu.
 * Ändert nur locationId und homeLocationId – Kennzeichen bleiben unverändert.
 * Verwendung: npx tsx prisma/assign-cars-location-only.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const feldkirch = await prisma.location.findFirst({
        where: {
            OR: [
                { name: 'Rent-Ex Feldkirch' },
                { code: 'FK-01' }
            ]
        }
    });

    if (!feldkirch) {
        console.error('❌ Standort "Rent-Ex Feldkirch" nicht gefunden. Bitte zuerst ausführen: npx tsx prisma/seed-locations.ts');
        process.exit(1);
    }

    const result = await prisma.car.updateMany({
        data: {
            locationId: feldkirch.id,
            homeLocationId: feldkirch.id
        }
    });

    console.log(`✅ ${result.count} Fahrzeuge dem Standort Rent-Ex Feldkirch zugewiesen.`);
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
