import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
    const authHeader = req.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    if (!secret || !authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secret))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

        // 1. Check for Cars needing Service/Inspection
        const carsAtRisk = await prisma.car.findMany({
            where: {
                isActive: true,
                OR: [
                    { nextInspection: { lte: thirtyDaysFromNow } },
                    { nextServiceDate: { lte: fourteenDaysFromNow } },
                    {
                        AND: [
                            { nextServiceKm: { not: null } },
                            { currentMileage: { not: null } }
                        ]
                    }
                ]
            }
        });

        const flagged = [];
        for (const car of carsAtRisk) {
            let reason = [];
            
            if (car.nextInspection && car.nextInspection <= thirtyDaysFromNow) {
                reason.push(`TÜV fällig am ${car.nextInspection.toLocaleDateString()}`);
            }
            if (car.nextServiceDate && car.nextServiceDate <= fourteenDaysFromNow) {
                reason.push(`Service fällig am ${car.nextServiceDate.toLocaleDateString()}`);
            }
            if (car.nextServiceKm && car.currentMileage && (car.nextServiceKm - car.currentMileage <= 1000)) {
                reason.push(`Service fällig bei ${car.nextServiceKm}km (Aktuell: ${car.currentMileage}km)`);
            }

            if (reason.length > 0) {
                // In a real app, we'd create a Task or send a Notification
                await prisma.task.create({
                    data: {
                        title: `Wartung fällig: ${car.brand} ${car.model} (${car.plate})`,
                        description: reason.join('\n'),
                        priority: 'high',
                        status: 'todo',
                        relatedCarId: car.id
                    }
                });
                flagged.push(car.plate);
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `${flagged.length} Fahrzeuge für Wartung markiert.`,
            flagged 
        });

    } catch (e: any) {
        console.error('[Maintenance Check Error]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
