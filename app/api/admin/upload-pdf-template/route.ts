import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, DAMAGE_REPORT_TEMPLATE_KEY } from '@/lib/s3';
import { validateUpload, UPLOAD_PRESETS } from '@/lib/fileValidation';
import { getAdminForArea } from '@/lib/adminAccess';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const session = await getAdminForArea('settings');
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

        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: DAMAGE_REPORT_TEMPLATE_KEY,
            Body: buffer!,
            ContentType: 'application/pdf',
        }));

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
