import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { requireAdminApiModule } from '@/lib/adminAccess';

export const dynamic = 'force-dynamic';

function escapeCsvCell(value: string | number): string {
    const s = String(value ?? '');
    if (s.includes(';') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export async function GET() {
    const auth = await requireAdminApiModule('Rechnungen');
    if (auth.response) return auth.response;

    const invoices = await prisma.invoice.findMany({
        include: {
            rental: {
                include: {
                    car: { select: { brand: true, model: true, plate: true } },
                    customer: { select: { firstName: true, lastName: true, email: true } },
                },
            },
        },
        orderBy: { issuedAt: 'desc' },
    });

    const headers = [
        'Rechnungs-Nr',
        'Ausstellungsdatum',
        'Vertrags-Nr',
        'Kunde',
        'E-Mail',
        'Fahrzeug',
        'Kennzeichen',
        'Netto (EUR)',
        'MwSt-Satz (%)',
        'MwSt-Betrag (EUR)',
        'Brutto (EUR)',
        'Status',
        'RKSV Status',
        'RKSV Beleg-ID',
    ];

    const rows = invoices.map((inv) => [
        inv.invoiceNumber,
        inv.issuedAt ? format(new Date(inv.issuedAt), 'dd.MM.yyyy', { locale: de }) : '',
        inv.rental?.contractNumber || inv.rentalId,
        inv.rental?.customer ? `${inv.rental.customer.firstName} ${inv.rental.customer.lastName}` : '',
        inv.rental?.customer?.email || '',
        inv.rental?.car ? `${inv.rental.car.brand} ${inv.rental.car.model}` : '',
        inv.rental?.car?.plate || '',
        Number(inv.subtotal).toFixed(2),
        Number(inv.taxRate).toFixed(0),
        Number(inv.taxAmount).toFixed(2),
        Number(inv.total).toFixed(2),
        inv.status,
        inv.registrierkassaExportedAt ? 'Übermittelt' : 'Ausstehend',
        inv.registrierkassaBelegId || '',
    ]);

    const csvContent = [
        headers.map(escapeCsvCell).join(';'),
        ...rows.map((row) => row.map(escapeCsvCell).join(';')),
    ].join('\n');

    const filename = `Rechnungsjournal_${format(new Date(), 'yyyy-MM-dd')}.csv`;

    return new NextResponse('\uFEFF' + csvContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}
