/**
 * 1. Set all Fiat Ducato cars to category "Kastenwagen"
 * 2. Ensure template options for Kastenwagen (name or group contains "Kastenwagen"/"Mehrkilometer")
 *    have carCategory = 'Kastenwagen'
 * 3. For each Ducato, create clones of those template options so they appear on the car.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('1. Updating all Fiat Ducato to category Kastenwagen...');
    const catResult = await prisma.car.updateMany({
        where: {
            brand: { equals: 'Fiat', mode: 'insensitive' },
            model: { contains: 'Ducato', mode: 'insensitive' },
        },
        data: { category: 'Kastenwagen' },
    });
    console.log(`   Updated ${catResult.count} car(s).`);

    // 2. Mark template options as Kastenwagen if name or group suggests it
    const templatesToTag = await prisma.option.findMany({
        where: {
            status: 'active',
            carId: null,
            OR: [
                { name: { contains: 'Kastenwagen', mode: 'insensitive' } },
                { name: { contains: 'Mehrkilometer', mode: 'insensitive' } },
                { group: { name: { contains: 'Kastenwagen', mode: 'insensitive' } } },
                { group: { name: { contains: 'Mehrkilometer', mode: 'insensitive' } } },
            ],
        },
        include: { group: true },
    });
    if (templatesToTag.length > 0) {
        await prisma.option.updateMany({
            where: { id: { in: templatesToTag.map((o) => o.id) } },
            data: { carCategory: 'Kastenwagen' },
        });
        console.log(`2. Set carCategory=Kastenwagen on ${templatesToTag.length} template option(s).`);
    }

    const ducatos = await prisma.car.findMany({
        where: {
            brand: { equals: 'Fiat', mode: 'insensitive' },
            model: { contains: 'Ducato', mode: 'insensitive' },
        },
        include: { options: true },
    });

    const kastenwagenTemplates = await prisma.option.findMany({
        where: {
            status: 'active',
            carId: null,
            carCategory: 'Kastenwagen',
        },
    });

    if (kastenwagenTemplates.length === 0) {
        console.log('3. No Kastenwagen template options (carCategory=Kastenwagen, carId=null) found. Skipping option assignment.');
        return;
    }

    console.log(`3. Found ${kastenwagenTemplates.length} Kastenwagen template option(s). Assigning to ${ducatos.length} Ducato(s)...`);

    for (const car of ducatos) {
        const existingNames = new Set(car.options.map((o) => o.name));
        const toCreate = kastenwagenTemplates.filter((t) => !existingNames.has(t.name));
        if (toCreate.length === 0) {
            console.log(`   Car ${car.plate} (${car.brand} ${car.model}) already has all Kastenwagen options.`);
            continue;
        }
        await prisma.option.createMany({
            data: toCreate.map((t) => ({
                name: t.name,
                description: t.description,
                price: t.price,
                type: t.type,
                carCategory: t.carCategory,
                isPerDay: t.isPerDay,
                maxPrice: t.maxPrice,
                maxDays: t.maxDays,
                isMandatory: t.isMandatory,
                maxQuantity: t.maxQuantity,
                status: t.status,
                imageUrl: t.imageUrl,
                groupId: t.groupId,
                carId: car.id,
            })),
        });
        console.log(`   Car ${car.plate} (${car.brand} ${car.model}): added ${toCreate.length} option(s).`);
    }

    console.log('Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
