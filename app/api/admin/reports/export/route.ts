import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export async function POST(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    try {
        const [cars, rentals] = await Promise.all([
            prisma.car.findMany({ where: { isActive: true } }),
            prisma.rental.findMany({ where: { status: 'Active' } }),
        ]);

        const total = cars.length;
        const active = cars.filter((c) => !rentals.some((r) => r.carId === c.id)).length;
        const rented = rentals.length;
        const maintenance = cars.filter((c) => c.nextServiceDate && new Date(c.nextServiceDate) < new Date()).length;

        const doc = new jsPDF() as any;
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 20;

        doc.setFontSize(20);
        doc.text('Flottenreport', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;
        doc.setFontSize(10);
        doc.text(`Erstellt am: ${format(new Date(), 'dd. MMMM yyyy HH:mm', { locale: de })}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 20;
        doc.setFontSize(14);
        doc.text('Flottenstatistik', 20, yPosition);

        yPosition += 15;
        const statsData = [
            ['Gesamtfahrzeuge', total.toString(), '100%'],
            ['Verfügbar', active.toString(), `${((active / total) * 100).toFixed(1)}%`],
            ['Vermietet', rented.toString(), `${((rented / total) * 100).toFixed(1)}%`],
            ['Wartung ausstehend', maintenance.toString(), `${((maintenance / total) * 100).toFixed(1)}%`],
        ];

        (doc as any).autoTable({
            head: [['Kategorie', 'Anzahl', 'Prozentsatz']],
            body: statsData,
            startY: yPosition,
            margin: 20,
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [243, 244, 246] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 20;

        if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Top Fahrzeugmodelle', 20, yPosition);
        yPosition += 10;

        const carModels = rentals.reduce((acc: Record<string, number>, rental) => {
            const carModel = `${rental.carId}`;
            acc[carModel] = (acc[carModel] || 0) + 1;
            return acc;
        }, {});

        const topCars = Object.entries(carModels)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        const carTableData = await Promise.all(
            topCars.map(async ([carId, count]) => {
                const car = await prisma.car.findUnique({ where: { id: parseInt(carId) } });
                return [car ? `${car.brand} ${car.model}` : 'Unbekannt', count.toString()];
            })
        );

        (doc as any).autoTable({
            head: [['Modell', 'Buchungen']],
            body: carTableData,
            startY: yPosition,
            margin: 20,
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [243, 244, 246] },
        });

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
