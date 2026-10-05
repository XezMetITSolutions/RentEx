import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiModule } from '@/lib/adminAccess';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const auth = await requireAdminApiModule('Mitbewerber');
    if (auth.response) return auth.response;
    const session = auth.session;

    try {
        const prices = await prisma.competitorPrice.findMany({
            orderBy: { recordedAt: 'desc' },
            take: 500,
        });
        return NextResponse.json(prices);
    } catch (error) {
        console.error('[GET /api/admin/competitor-pricing/prices]', error);
        return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdminApiModule('Mitbewerber');
    if (auth.response) return auth.response;
    const session = auth.session;

    try {
        const body = await req.json();
        const { competitorId, brand, model, dailyRate, weeklyRate, monthlyRate, notes } = body;

        if (!competitorId || !brand || !model || dailyRate === undefined) {
            return NextResponse.json({ error: 'Erforderliche Felder fehlen' }, { status: 400 });
        }

        const price = await prisma.competitorPrice.create({
            data: {
                competitorId,
                brand,
                model,
                dailyRate,
                weeklyRate,
                monthlyRate,
                notes,
            },
        });

        return NextResponse.json(price, { status: 201 });
    } catch (error) {
        console.error('[POST /api/admin/competitor-pricing/prices]', error);
        return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 });
    }
}
