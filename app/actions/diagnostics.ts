'use server';

import prisma from '@/lib/prisma';

/**
 * One-shot manual schema corrections for legacy environments. Should be
 * a no-op on a current database (each step is guarded with IF NOT EXISTS).
 */
export async function fixDatabaseSchema() {
    try {
        // 1. Add carId column to Option if it doesn't exist
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Option' AND column_name='carId') THEN
                    ALTER TABLE "Option" ADD COLUMN "carId" INTEGER;
                END IF;
            END $$;
        `);

        // 2. Ensure foreign key constraint
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='Option_carId_fkey') THEN
                    ALTER TABLE "Option" ADD CONSTRAINT "Option_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);

        // 3. Add invoiceUrl column to MaintenanceRecord if it doesn't exist
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='MaintenanceRecord' AND column_name='invoiceUrl') THEN
                    ALTER TABLE "MaintenanceRecord" ADD COLUMN "invoiceUrl" TEXT;
                END IF;
            END $$;
        `);

        // 4. Drop legacy many-to-many join tables if present
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "_CarOptions";`);
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "_CarToOption";`);

        return { success: true };
    } catch (error: any) {
        console.error('Schema correction failed:', error);
        return { success: false, error: error.message };
    }
}

export async function runDebugQuery(sql: string) {
    try {
        const data = await prisma.$queryRawUnsafe(sql);
        return { success: true, data };
    } catch (error: any) {
        console.error('Debug query failed:', error);
        return { success: false, error: error.message };
    }
}

export async function runDiagnostics() {
    const results: any = {
        database: { status: 'unknown', error: null },
        models: {},
        schema: [],
        updateTest: { status: 'not_run', error: null },
    };

    try {
        await prisma.$connect();
        results.database.status = 'connected';

        const models = ['car', 'option', 'optionGroup', 'customer', 'rental', 'location'];
        for (const model of models) {
            try {
                const count = await (prisma as any)[model].count();
                results.models[model] = { status: 'ok', count };
            } catch (err: any) {
                results.models[model] = { status: 'error', error: err.message };
            }
        }

        const columns: any = await prisma.$queryRaw`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'Option'
            ORDER BY ordinal_position;
        `;
        results.schema = columns;

        return { success: true, results };
    } catch (error: any) {
        return { success: false, error: error.message, results };
    }
}

export async function testUpdateCarAction(id: number) {
    try {
        const car = await prisma.car.findUnique({
            where: { id },
            include: { options: true },
        });

        if (!car) return { success: false, error: `Fahrzeug nicht gefunden (ID ${id})` };

        await prisma.$transaction(async (tx) => {
            await tx.car.update({
                where: { id },
                data: {
                    updatedAt: new Date(),
                    fuelType: car.fuelType || 'Benzin',
                },
            });
            await tx.option.count({ where: { carId: id } });
        });

        return {
            success: true,
            message: 'Vollständiger Schreibtest (inkl. Transaction) erfolgreich.',
        };
    } catch (error: any) {
        console.error('CRITICAL ERROR DURING TEST UPDATE:', error);
        return {
            success: false,
            error: `Technischer Fehler: ${error.message}`,
            stack: error.stack,
            code: error.code,
        };
    }
}
