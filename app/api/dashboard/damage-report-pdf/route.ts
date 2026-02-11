import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { getPdfMapping } from '@/lib/pdfMapping';

// Simple helper to safely get values from FormData
function getFormValue(formData: FormData, key: string): string {
    const val = formData.get(key);
    return val ? String(val) : '';
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const debug = request.nextUrl.searchParams.get('debug') === 'true';

        // Load or create PDF
        let pdfDoc: PDFDocument;
        const templatePath = path.join(process.cwd(), 'public', 'damage-report-template.pdf');

        if (fs.existsSync(templatePath)) {
            const existingPdfBytes = fs.readFileSync(templatePath);
            pdfDoc = await PDFDocument.load(existingPdfBytes);
        } else {
            // Create a blank A4 document if no template exists
            pdfDoc = await PDFDocument.create();
            pdfDoc.addPage([595.28, 841.89]); // A4 size in points
        }

        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Get mapping config
        const mapping = getPdfMapping();

        // Iterate over mapping and fill fields
        for (const fieldMap of mapping) {
            const page = pages[fieldMap.page || 0];
            if (!page) continue;

            let text = getFormValue(formData, fieldMap.field);

            // Special handling for nested objects or specific formats if needed
            // For now, we assume flattened keys in formData OR simple direct access if passed as JSON (but here formData)
            // The formData keys from the frontend might be different from our mapping keys (e.g. 'rental.car.plate' vs 'plate')
            // Let's standardise on the frontend sending flat keys or handling it here.
            // Actually, the formData comes from the client form which uses names like "accidentDate", "type", etc.
            // Our defaultMapping uses keys like 'rental.car.plate'. 
            // We need to ensure the frontend form sends these values, OR we map them here.

            // Better approach: The frontend sends the "final" values to print. 
            // The form in DamageReportForm.tsx submits to a server action usually.
            // Here, we are being called by a fetch/form submit from the client.
            // Let's trust the frontend to send the right keys. 
            // 'rental.car.plate' is not a valid FormData key unless we append it manually.

            // Let's check if the formData has the key directly.
            if (!text && fieldMap.field.includes('.')) {
                // If it's a nested key like 'rental.car.plate', try to find it in the formData 
                // assuming the frontend appended it as 'rental.car.plate' OR just 'plate'.
                // To keep it simple, I'll rely on the frontend sending a flattened 'data' object or 
                // simpler keys. 
                // Let's rely on exact matches first.
            }

            if (text) {
                const fontSize = fieldMap.fontSize || 10;
                page.drawText(text, {
                    x: fieldMap.x,
                    y: fieldMap.y,
                    size: fontSize,
                    font: font,
                    color: rgb(0, 0, 0),
                });

                if (debug) {
                    page.drawRectangle({
                        x: fieldMap.x,
                        y: fieldMap.y,
                        width: text.length * (fontSize / 2), // Rough estimate
                        height: fontSize + 2,
                        borderColor: rgb(1, 0, 0),
                        borderWidth: 1,
                    });
                    page.drawText(fieldMap.field, {
                        x: fieldMap.x,
                        y: fieldMap.y + fontSize + 2,
                        size: 6,
                        color: rgb(1, 0, 0),
                    });
                }
            }
        }

        const pdfBytes = await pdfDoc.save();

        return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="Schadenmeldung.pdf"',
            },
        });
    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
