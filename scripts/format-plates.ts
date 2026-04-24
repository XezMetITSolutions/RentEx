import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function formatPlates() {
    console.log("Starting license plate formatting...");
    const cars = await prisma.car.findMany();
    let updated = 0;

    for (const car of cars) {
        let plate = car.plate.toUpperCase().replace(/\s/g, ''); // Boşlukları temizle
        if (!plate.includes('-')) {
            // 1 veya 2 harften sonra rakam geliyorsa, araya tire koy (Örn: FK850II -> FK-850II)
            const match = plate.match(/^([A-Z]{1,2})([0-9].*)$/);
            if (match) {
                const newPlate = `${match[1]}-${match[2]}`;
                console.log(`Updating: ${car.plate} -> ${newPlate}`);
                await prisma.car.update({
                    where: { id: car.id },
                    data: { plate: newPlate }
                });
                updated++;
            }
        }
    }
    console.log(`Finished. Updated ${updated} plates in the database.`);
}

formatPlates().catch(console.error).finally(() => prisma.$disconnect());
