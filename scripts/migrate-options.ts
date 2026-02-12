import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration: Many-to-Many Options -> Many-to-One Options');

    // 1. Get all current assignments from the join table
    // Since we changed the schema, the @prisma/client might not have the old many-to-many anymore.
    // We have to use raw SQL to read from the join table before it's gone.

    try {
        const assignments = await prisma.$queryRawUnsafe<any[]>(
            'SELECT * FROM "_CarOptions"'
        );

        console.log(`Found ${assignments.length} existing assignments.`);

        for (const assignment of assignments) {
            const carId = assignment.A; // Usually A is Car in _CarOptions
            const optionId = assignment.B;

            console.log(`Migrating Option ${optionId} to Car ${carId}`);

            // Update the option to belong to this car
            // Note: If an option was shared by multiple cars, it will only belong to the LAST one in this loop.
            // This is the limitation of 1:N vs M:N.
            await prisma.option.update({
                where: { id: optionId },
                data: { carId: carId }
            });
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed or no many-to-many table found:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
