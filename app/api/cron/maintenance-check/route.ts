import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { emailTemplates, sendEmail, COMPANY_EMAIL } from '@/lib/notificationTemplates';

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

        const day = (d: Date) => d.toLocaleDateString('de-AT', { timeZone: 'Europe/Vienna' });
        const flagged: { label: string; reasons: string[] }[] = [];
        for (const car of carsAtRisk) {
            const reason: string[] = [];

            if (car.nextInspection && car.nextInspection <= thirtyDaysFromNow) {
                reason.push(`§57a-Überprüfung fällig am ${day(car.nextInspection)}`);
            }
            if (car.nextServiceDate && car.nextServiceDate <= fourteenDaysFromNow) {
                reason.push(`Service fällig am ${day(car.nextServiceDate)}`);
            }
            if (car.nextServiceKm && car.currentMileage && (car.nextServiceKm - car.currentMileage <= 1000)) {
                reason.push(`Service fällig bei ${car.nextServiceKm.toLocaleString('de-AT')} km (aktuell ${car.currentMileage.toLocaleString('de-AT')} km)`);
            }
            if (reason.length === 0) continue;

            // One open task per car; the daily run must not pile up duplicates.
            const open = await prisma.task.findFirst({
                where: { relatedCarId: car.id, status: { not: 'done' }, title: { startsWith: 'Wartung fällig' } },
                select: { id: true },
            });
            if (open) continue;

            await prisma.task.create({
                data: {
                    title: `Wartung fällig: ${car.brand} ${car.model} (${car.plate})`,
                    description: reason.join('\n'),
                    priority: 'high',
                    status: 'todo',
                    relatedCarId: car.id
                }
            });
            flagged.push({ label: `${car.brand} ${car.model} · ${car.plate}`, reasons: reason });
        }

        if (flagged.length > 0) {
            await sendEmail(COMPANY_EMAIL, emailTemplates.staffMaintenance(flagged));
        }

        return NextResponse.json({ 
            success: true, 
            message: `${flagged.length} Fahrzeuge für Wartung markiert.`,
            flagged: flagged.map((f) => f.label),
        });

    } catch (e: any) {
        console.error('[Maintenance Check Error]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
