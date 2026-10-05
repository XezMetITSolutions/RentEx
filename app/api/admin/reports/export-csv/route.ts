import { NextResponse } from 'next/server';
import { requireAdminApiModule } from '@/lib/adminAccess';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

function escapeCsvCell(value: string | number): string {
    const s = String(value ?? '');
    if (s.includes(';') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export async function GET() {
    const auth = await requireAdminApiModule('Berichte');
    if (auth.response) return auth.response;

    const [cars, rentals] = await Promise.all([
        prisma.car.findMany({
            include: {
                rentals: {
                    where: { status: { not: 'Cancelled' } },
                    select: { id: true, totalDays: true, totalAmount: true },
                },
                maintenanceRecords: {
                    select: { cost: true },
                },
            },
            orderBy: [{ brand: 'asc' }, { model: 'asc' }],
        }),
        prisma.rental.findMany({
            where: { status: 'Active' },
            select: { carId: true },
        }),
    ]);

    const headers = [
        'Fahrzeug-ID',
        'Marke',
        'Modell',
        'Kennzeichen',
        'Status',
        'Tachostand (km)',
        'Anzahl Buchungen',
        'Vermietete Tage (Gesamt)',
        'Erzielter Umsatz (EUR)',
        'Wartungskosten (EUR)',
        'Deckungsbeitrag (EUR)',
    ];

    const rows = cars.map((c) => {
        const bookingsCount = c.rentals.length;
        const totalDays = c.rentals.reduce((sum, r) => sum + r.totalDays, 0);
        const totalRevenue = c.rentals.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);
        const totalMaintenance = c.maintenanceRecords.reduce((sum, m) => sum + Number(m.cost || 0), 0);
        const netProfit = totalRevenue - totalMaintenance;

        return [
            c.id,
            c.brand,
            c.model,
            c.plate,
            c.status,
            c.currentMileage ?? 0,
            bookingsCount,
            totalDays,
            totalRevenue.toFixed(2),
            totalMaintenance.toFixed(2),
            netProfit.toFixed(2),
        ];
    });

    const csvContent = [
        headers.map(escapeCsvCell).join(';'),
        ...rows.map((row) => row.map(escapeCsvCell).join(';')),
    ].join('\n');

    const filename = `Flottenauslastung_${format(new Date(), 'yyyy-MM-dd')}.csv`;

    return new NextResponse('\uFEFF' + csvContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}
