import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, DAMAGE_REPORT_TEMPLATE_KEY } from '@/lib/s3';
import { requireAdminApiModule } from '@/lib/adminAccess';
import { validateUpload, UPLOAD_PRESETS } from '@/lib/fileValidation';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const auth = await requireAdminApiModule('Einstellungen');
    if (auth.response) return auth.response;
    const session = auth.session;

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
