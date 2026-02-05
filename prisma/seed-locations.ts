import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLocations() {
    console.log('🌱 Seeding locations...');

    // Check if Feldkirch location already exists
    const existingLocation = await prisma.location.findFirst({
        where: {
            name: 'Rent-Ex Feldkirch'
        }
    });

    if (existingLocation) {
        console.log('✅ Feldkirch location already exists');
        return;
    }

    // Create Feldkirch location
    const feldkirch = await prisma.location.create({
        data: {
            name: 'Rent-Ex Feldkirch',
            code: 'FK-01',
            address: 'Illstraße 75a',
            city: '6800 Feldkirch',
            country: 'Österreich',
            phone: '+43 5522 12345',
            email: 'feldkirch@rent-ex.at',
            latitude: 47.2394,
            longitude: 9.5941,
            openingTime: '08:00',
            closingTime: '18:00',
            isOpenSundays: false,
            status: 'active'
        }
    });

    console.log('✅ Created location:', feldkirch.name);
}

async function main() {
    try {
        await seedLocations();
        console.log('✅ Seed completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
