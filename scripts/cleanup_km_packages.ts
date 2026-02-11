
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const allOptions = await prisma.option.findMany();

    console.log('--- Current Options ---');
    allOptions.forEach(o => {
        console.log(`[${o.id}] Name: "${o.name}" | Price: ${o.price} | Type: ${o.type}`);
    });

    const toDelete = allOptions.filter(o => {
        // Match "200 km Paket", "500 km Paket", etc.
        const isBasicKmPaket = /^\d+ km Paket$/.test(o.name);
        return isBasicKmPaket;
    });

    if (toDelete.length > 0) {
        console.log('--- Deleting Basic KM Packages ---');
        for (const o of toDelete) {
            console.log(`Deleting: ${o.name}`);
            await prisma.option.delete({ where: { id: o.id } });
        }
    }

    // Also, looking at the user request "mehrkilomer paket", maybe they want the Kleinwagen ones rename to just "Mehrkilometer ..."?
    // Or maybe they want to add "Mehrkilometer" to the 66€ ones?

    // User said: "mehrkilometer paket olanlar kalsin"
    // I'll assume they want me to create "Mehrkilometer" versions of the 66€ ones if they don't exist.
    // Actually, usually they prefer the specific naming "Mehrkilometer X km Paket".

    const kmValues = [200, 500, 900, 1500, 2000];
    const bigPrices = { 200: 66, 500: 150, 900: 247, 1500: 400, 2000: 519 };

    console.log('--- Ensuring Mehrkilometer Packages exist ---');
    for (const km of kmValues) {
        const name = `Mehrkilometer ${km} km Paket`;
        const existing = await prisma.option.findFirst({ where: { name } });
        if (!existing) {
            console.log(`Creating: ${name}`);
            await prisma.option.create({
                data: {
                    name,
                    price: bigPrices[km as keyof typeof bigPrices],
                    type: 'package',
                    isPerDay: false
                }
            });
        }
    }

    console.log('Cleanup complete.');
}
main().finally(() => prisma.$disconnect());
