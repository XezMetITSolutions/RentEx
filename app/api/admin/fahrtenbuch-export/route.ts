import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

function escapeCsv(s: string | number): string {
    const t = String(s);
    if (t.includes(';') || t.includes('"') || t.includes('\n')) return `"${t.replace(/"/g, '""')}"`;
    return t;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const formatType = searchParams.get('format') || 'csv';

    const entries = await prisma.fahrtenbuchEntry.findMany({
        orderBy: [{ carId: 'asc' }, { datum: 'asc' }],
        include: {
            car: { select: { brand: true, model: true, plate: true } },
        },
    });

    const headers = ['Fahrzeug', 'Kennzeichen', 'Datum', 'Start km', 'Ende km', 'Strecke (km)', 'Zweck', 'Fahrtzweck'];
    const rows = entries.map((e) => [
        `${e.car.brand} ${e.car.model}`,
        e.car.plate,
        format(new Date(e.datum), 'dd.MM.yyyy', { locale: de }),
        e.startKm,
        e.endKm,
        e.endKm - e.startKm,
        e.zweck,
        e.fahrtzweck || '',
    ]);

    const csv = [
        headers.map(escapeCsv).join(';'),
        ...rows.map((r) => r.map(escapeCsv).join(';')),
    ].join('\n');

    const filename = `Fahrtenbuch_${format(new Date(), 'yyyy-MM-dd')}.csv`;

    return new NextResponse('\uFEFF' + csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}
