import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

function escapeCsvCell(value: string | number): string {
    const s = String(value);
    if (s.includes(';') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export async function GET() {
    const rentals = await prisma.rental.findMany({
        where: { status: { not: 'Cancelled' } },
        include: {
            car: { select: { brand: true, model: true, plate: true } },
            customer: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { startDate: 'desc' },
    });

    const headers = [
        'Vertrags-Nr',
        'Fahrzeug',
        'Kennzeichen',
        'Kunde',
        'E-Mail',
        'Start',
        'Ende',
        'Tage',
        'Gesamtbetrag',
        'Rabatt',
        'Status',
        'Zahlung',
    ];

    const rows = rentals.map((r) => [
        r.contractNumber || r.id,
        `${r.car.brand} ${r.car.model}`,
        r.car.plate,
        `${r.customer.firstName} ${r.customer.lastName}`,
        r.customer.email,
        format(new Date(r.startDate), 'dd.MM.yyyy', { locale: de }),
        format(new Date(r.endDate), 'dd.MM.yyyy', { locale: de }),
        r.totalDays,
        Number(r.totalAmount).toFixed(2),
        Number(r.discountAmount ?? 0).toFixed(2),
        r.status,
        r.paymentStatus,
    ]);

    const csvContent = [
        headers.map(escapeCsvCell).join(';'),
        ...rows.map((row) => row.map(escapeCsvCell).join(';')),
    ].join('\n');

    const filename = `Finanzbericht_${format(new Date(), 'yyyy-MM-dd')}.csv`;

    return new NextResponse('\uFEFF' + csvContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}
