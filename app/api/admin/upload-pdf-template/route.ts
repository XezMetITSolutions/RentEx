import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAdminSession } from '@/lib/adminAuth';
import { validateUpload, UPLOAD_PRESETS } from '@/lib/fileValidation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('pdf') as File;

        const v = await validateUpload({
            file,
            allowed: UPLOAD_PRESETS.PDF_ONLY,
            maxBytes: 15 * 1024 * 1024,
        });
        if (!v.ok) {
            return NextResponse.json({ error: v.error }, { status: v.status });
        }
        const { buffer } = v;

        // Ensure public directory exists
        const publicDir = path.join(process.cwd(), 'public');
        await mkdir(publicDir, { recursive: true });

        const filePath = path.join(publicDir, 'damage-report-template.pdf');
        await writeFile(filePath, buffer!);

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
