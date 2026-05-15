import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }
    try {
        const cars = await prisma.car.findMany();
        let updated = 0;
        let logs = [];

        for (const car of cars) {
            let plate = car.plate.toUpperCase().replace(/\s/g, '');
            if (!plate.includes('-')) {
                const match = plate.match(/^([A-Z]{1,2})([0-9].*)$/);
                if (match) {
                    const newPlate = `${match[1]}-${match[2]}`;
                    logs.push(`Updating: ${car.plate} -> ${newPlate}`);
                    await prisma.car.update({
                        where: { id: car.id },
                        data: { plate: newPlate }
                    });
                    updated++;
                }
            }
        }

        return NextResponse.json({ success: true, updated, logs });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
