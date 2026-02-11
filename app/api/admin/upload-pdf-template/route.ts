import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('pdf') as File;

        if (!file) {
            return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Nur PDF-Dateien erlaubt' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure public directory exists
        const publicDir = path.join(process.cwd(), 'public');
        await mkdir(publicDir, { recursive: true });

        const filePath = path.join(publicDir, 'damage-report-template.pdf');
        await writeFile(filePath, buffer);

        console.log('PDF successfully uploaded to:', filePath);

        return NextResponse.json({ success: true, message: 'PDF erfolgreich hochgeladen' });
    } catch (error) {
        console.error('PDF Upload Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Upload fehlgeschlagen',
            details: errorMessage
        }, { status: 500 });
    }
}
