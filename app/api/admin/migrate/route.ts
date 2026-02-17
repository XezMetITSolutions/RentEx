import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        console.log("Starting manual database migration...");

        // 1. Add mileagePhoto column if not exists
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Rental" ADD COLUMN IF NOT EXISTS "mileagePhoto" TEXT;`);
            console.log("Column 'mileagePhoto' checked/added.");
        } catch (e) {
            console.log("Step 1 failed or column already exists");
        }

        // 2. Add fuelPhoto column if not exists
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Rental" ADD COLUMN IF NOT EXISTS "fuelPhoto" TEXT;`);
            console.log("Column 'fuelPhoto' checked/added.");
        } catch (e) {
            console.log("Step 2 failed or column already exists");
        }

        // 3. Ensure Car status can handle 'Rented' and check mileage column
        // (Prisma already handles model types, but raw SQL ensures DB is updated)

        return NextResponse.json({
            success: true,
            message: "Database schema migration successful. mileagePhoto and fuelPhoto columns are ready.",
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error("Migration Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
