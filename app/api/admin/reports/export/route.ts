import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiModule } from '@/lib/adminAccess';
import prisma from '@/lib/prisma';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const auth = await requireAdminApiModule('Berichte');
    if (auth.response) return auth.response;

    try {
        const [cars, rentals] = await Promise.all([
            prisma.car.findMany({ where: { isActive: true } }),
            prisma.rental.findMany({ where: { status: 'Active' } }),
        ]);

        const total = cars.length;
        const active = cars.filter((c) => !rentals.some((r) => r.carId === c.id) && c.status === 'Active').length;
        const rented = rentals.length;
        const maintenance = cars.filter((c) => c.status === 'Maintenance' || (c.nextServiceDate && new Date(c.nextServiceDate) < new Date())).length;

        const doc = new jsPDF() as any;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header Background
        doc.setFillColor(220, 38, 38); // Rent-Ex Red
        doc.rect(0, 0, pageWidth, 24, 'F');

        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('RENT-EX · FLOTTENREPORT & AUSLASTUNGSANALYSE', 14, 16);

        // Subheader
        let yPosition = 35;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.text('RENT-EX GmbH · Illstraße 75a, 6800 Feldkirch, Österreich', 14, yPosition);
        doc.text(`Erstellt am: ${format(new Date(), 'dd. MMMM yyyy HH:mm', { locale: de })} Uhr`, pageWidth - 14, yPosition, { align: 'right' });

        yPosition += 15;
        doc.setFontSize(13);
        doc.setTextColor(24, 24, 27);
        doc.setFont('helvetica', 'bold');
        doc.text('1. Flottenübersicht & Statusverteilung', 14, yPosition);

        yPosition += 8;
        const statsData = [
            ['Gesamtfahrzeuge (Aktiv)', total.toString(), '100%'],
            ['Sofort verfügbar (Frei)', active.toString(), `${total > 0 ? ((active / total) * 100).toFixed(1) : 0}%`],
            ['Im Einsatz / Vermietet', rented.toString(), `${total > 0 ? ((rented / total) * 100).toFixed(1) : 0}%`],
            ['In Werkstatt / Service fällig', maintenance.toString(), `${total > 0 ? ((maintenance / total) * 100).toFixed(1) : 0}%`],
        ];

        (doc as any).autoTable({
            head: [['KATEGORIE', 'ANZAHL FAHRZEUGE', 'PROZENTSATZ']],
            body: statsData,
            startY: yPosition,
            margin: { left: 14, right: 14 },
            headStyles: { fillColor: [24, 24, 27], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
            alternateRowStyles: { fillColor: [248, 248, 248] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 16;

        if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 25;
        }

        doc.setFontSize(13);
        doc.setTextColor(24, 24, 27);
        doc.setFont('helvetica', 'bold');
        doc.text('2. Meistgebuchte Fahrzeugmodelle (Top 10)', 14, yPosition);
        yPosition += 8;

        const allRentals = await prisma.rental.findMany({
            where: { status: { not: 'Cancelled' } },
            select: { carId: true },
        });

        const carModels = allRentals.reduce((acc: Record<string, number>, rental) => {
            const carModel = `${rental.carId}`;
            acc[carModel] = (acc[carModel] || 0) + 1;
            return acc;
        }, {});

        const topCars = Object.entries(carModels)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        const carTableData = await Promise.all(
            topCars.map(async ([carId, count], idx) => {
                const car = await prisma.car.findUnique({ where: { id: parseInt(carId) } });
                return [
                    `#${idx + 1}`,
                    car ? `${car.brand} ${car.model}` : 'Unbekannt',
                    car?.plate || '-',
                    count.toString(),
                ];
            })
        );

        (doc as any).autoTable({
            head: [['RANG', 'MODELL', 'KENNZEICHEN', 'ABGESCHLOSSENE BUCHUNGEN']],
            body: carTableData.length > 0 ? carTableData : [['-', 'Keine Buchungsdaten vorhanden', '-', '0']],
            startY: yPosition,
            margin: { left: 14, right: 14 },
            headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
            alternateRowStyles: { fillColor: [248, 248, 248] },
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(140, 140, 140);
        doc.setFont('helvetica', 'normal');
        doc.text(
            'RENT-EX Flottenmanagementsystem · Vertraulicher interner Auswertungsbericht',
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );

        const pdf = doc.output('arraybuffer');
        const filename = `Flottenreport_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

        return new NextResponse(pdf, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error('[POST /api/admin/reports/export]', error);
        return NextResponse.json({ error: 'Fehler beim Generieren des Reports' }, { status: 500 });
    }
}
