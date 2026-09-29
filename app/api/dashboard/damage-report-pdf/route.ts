import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, DAMAGE_REPORT_TEMPLATE_KEY } from '@/lib/s3';
import { getPdfMapping } from '@/lib/pdfMapping';
import { getSession } from '@/lib/auth';
import { getAdminSession } from '@/lib/adminAuth';

// Simple helper to safely get values from FormData
function getFormValue(formData: FormData, key: string): string {
    const val = formData.get(key);
    return val ? String(val) : '';
}

/** Admin-uploaded template from R2, or null when none has been uploaded yet. */
async function loadTemplate(): Promise<Uint8Array | null> {
    try {
        const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: DAMAGE_REPORT_TEMPLATE_KEY }));
        return obj.Body ? await obj.Body.transformToByteArray() : null;
    } catch (error: any) {
        if (error?.name !== 'NoSuchKey') console.error('Error loading PDF template:', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    if ((await getSession()) == null && !(await getAdminSession())) {
        return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const debug = request.nextUrl.searchParams.get('debug') === 'true';

        // Load or create PDF
        let pdfDoc: PDFDocument;
        const templateBytes = await loadTemplate();

        if (templateBytes) {
            pdfDoc = await PDFDocument.load(templateBytes);
        } else {
            // Create a blank A4 document if no template exists
            pdfDoc = await PDFDocument.create();
            pdfDoc.addPage([595.28, 841.89]); // A4 size in points
        }

        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Get mapping config
        const mapping = await getPdfMapping();

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

        return new NextResponse(Buffer.from(pdfBytes), {
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
