import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Austrian license plate prefixes for Vorarlberg (Feldkirch region)
const AUSTRIAN_PREFIXES = ['FK', 'BZ', 'DO', 'BL', 'FE'];

function generateAustrianPlate(index: number): string {
    const prefix = AUSTRIAN_PREFIXES[index % AUSTRIAN_PREFIXES.length];
    const number = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${prefix} ${number} ${letters}`;
}

async function assignCarsToFeldkirch() {
    console.log('🚗 Assigning all cars to Feldkirch location...\n');

    try {
        // Find Feldkirch location
        const feldkirch = await prisma.location.findFirst({
            where: {
                OR: [
                    { name: 'Rent-Ex Feldkirch' },
                    { code: 'FK-01' }
                ]
            }
        });

        if (!feldkirch) {
            console.error('❌ Feldkirch location not found!');
            console.log('💡 Please run the initialization first:');
            console.log('   npx tsx prisma/seed-locations.ts');
            process.exit(1);
        }

        console.log(`✅ Found Feldkirch location (ID: ${feldkirch.id})\n`);

        // Get all active cars
        const cars = await prisma.car.findMany({
            where: {
                isActive: true
            }
        });

        if (cars.length === 0) {
            console.log('ℹ️  No cars found in the database.');
            return;
        }

        console.log(`📊 Found ${cars.length} active cars\n`);
        console.log('🔧 Updating cars...\n');

        let updated = 0;
        let platesUpdated = 0;

        for (let i = 0; i < cars.length; i++) {
            const car = cars[i];
            const updateData: any = {
                locationId: feldkirch.id,
                homeLocationId: feldkirch.id,
            };

            // Check if plate needs Austrian format
            const needsNewPlate = !car.plate ||
                !car.plate.match(/^(FK|BZ|DO|BL|FE)\s\d{4}\s[A-Z]{2}$/);

            if (needsNewPlate) {
                let newPlate = generateAustrianPlate(i);

                // Ensure unique plate
                let isUnique = false;
                let attempts = 0;
                while (!isUnique && attempts < 10) {
                    const existing = await prisma.car.findUnique({
                        where: { plate: newPlate }
                    });
                    if (!existing) {
                        isUnique = true;
                    } else {
                        newPlate = generateAustrianPlate(i + attempts);
                        attempts++;
                    }
                }

                updateData.plate = newPlate;
                platesUpdated++;

                console.log(`   ${i + 1}. ${car.brand} ${car.model}`);
                console.log(`      📍 Location: → Feldkirch`);
                console.log(`      🚗 Plate: ${car.plate} → ${newPlate}`);
            } else {
                console.log(`   ${i + 1}. ${car.brand} ${car.model}`);
                console.log(`      📍 Location: → Feldkirch`);
                console.log(`      🚗 Plate: ${car.plate} (kept)`);
            }

            await prisma.car.update({
                where: { id: car.id },
                data: updateData
            });

            updated++;
        }

        console.log('\n✅ Update completed!\n');
        console.log('📊 Summary:');
        console.log(`   • Total cars updated: ${updated}`);
        console.log(`   • Plates updated to Austrian format: ${platesUpdated}`);
        console.log(`   • All cars now assigned to: ${feldkirch.name}`);
        console.log(`   • Location: ${feldkirch.address}, ${feldkirch.city}`);

    } catch (error) {
        console.error('❌ Error assigning cars:', error);
        throw error;
    }
}

async function main() {
    try {
        await assignCarsToFeldkirch();
        console.log('\n🎉 Process completed successfully!');
    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
