import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { getAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function escapeCsv(s: string | number): string {
    const t = String(s);
    if (t.includes(';') || t.includes('"') || t.includes('\n')) return `"${t.replace(/"/g, '""')}"`;
    return t;
}

export async function GET(request: Request) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const formatType = searchParams.get('format') || 'csv';
    const carIdParam = searchParams.get('carId');
    const zweckParam = searchParams.get('zweck');

    // Build filters for export
    const where: any = {};
    if (carIdParam) {
        where.carId = parseInt(carIdParam, 10);
    }
    if (zweckParam && zweckParam !== 'ALL') {
        where.zweck = zweckParam;
    }

    const entries = await prisma.fahrtenbuchEntry.findMany({
        where,
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
        e.zweck === 'DIENSTFAHRT' ? 'Dienstfahrt' : 'Privatfahrt',
        e.fahrtzweck || '',
    ]);

    if (formatType === 'pdf') {
        const doc = new jsPDF() as any;
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 20;

        doc.setFontSize(18);
        doc.text('Fahrtenbuch (Seyir Defteri)', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 10;
        doc.setFontSize(10);
        doc.text(`Erstellt am: ${format(new Date(), 'dd. MMMM yyyy HH:mm', { locale: de })}`, pageWidth / 2, yPosition, { align: 'center' });
        doc.text(`Anzahl der Fahrten: ${entries.length}`, 20, yPosition + 10);

        yPosition += 15;

        (doc as any).autoTable({
            head: [headers],
            body: rows,
            startY: yPosition,
            margin: 15,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' }, // Brand red color
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        const pdf = doc.output('arraybuffer');
        const filename = `Fahrtenbuch_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

        return new NextResponse(pdf, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    }

    // Default to CSV
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
