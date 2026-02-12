import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Ensure "PKW" group exists
    let pkwGroup = await prisma.optionGroup.findFirst({
        where: { name: 'PKW' }
    });

    if (!pkwGroup) {
        pkwGroup = await prisma.optionGroup.create({
            data: {
                name: 'PKW',
                description: 'Personenkraftwagen Optionen'
            }
        });
        console.log('Created PKW group');
    } else {
        console.log('PKW group already exists');
    }

    const options = [
        {
            name: 'Mehrkilometer 200 Paket',
            description: 'Zur Ihrer Buchung werden 200km Mehrkilometer hinzugefügt',
            price: 66.00,
            type: 'package',
            isPerDay: false,
            groupId: pkwGroup.id
        },
        {
            name: 'Mehrkilometer 500 Paket',
            description: 'Zur Ihrer Buchung werden 500km Mehrkilometer hinzugefügt',
            price: 150.00,
            type: 'package',
            isPerDay: false,
            groupId: pkwGroup.id
        },
        {
            name: 'Mehrkilometer 900 Paket',
            description: 'Zur Ihrer Buchung werden 900km Mehrkilometer hinzugefügt',
            price: 247.00,
            type: 'package',
            isPerDay: false,
            groupId: pkwGroup.id
        },
        {
            name: 'Mehrkilometer 1500 Paket',
            description: 'Zur Ihrer Buchung werden 1500km Mehrkilometer hinzugefügt',
            price: 400.00,
            type: 'package',
            isPerDay: false,
            groupId: pkwGroup.id
        },
        {
            name: 'Mehrkilometer 2000 Paket',
            description: 'Zur Ihrer Buchung werden 2000km Mehrkilometer hinzugefügt',
            price: 519.00,
            type: 'package',
            isPerDay: false,
            groupId: pkwGroup.id
        },
        {
            name: 'Selbstbehalt Ermäßigung',
            description: 'Diese Ermäßigung reduziert den Selbstbehalt auf 500€. Gilt für den gesamten Mietzeitraum',
            price: 60.48,
            type: 'insurance',
            isPerDay: false,
            groupId: pkwGroup.id
        },
        {
            name: 'Zusatzfahrer',
            description: 'Ein Zusatzfahrer für den gesamten Mietzeitraum',
            price: 33.60,
            type: 'driver',
            isPerDay: false,
            groupId: pkwGroup.id
        }
    ];

    for (const option of options) {
        const existing = await prisma.option.findFirst({
            where: {
                name: option.name,
                groupId: pkwGroup.id
            }
        });

        if (!existing) {
            await prisma.option.create({
                data: option
            });
            console.log(`Created option: ${option.name}`);
        } else {
            // Update if exists to match requirements
            await prisma.option.update({
                where: { id: existing.id },
                data: option
            });
            console.log(`Updated option: ${option.name}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
