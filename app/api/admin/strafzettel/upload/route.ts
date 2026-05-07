import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/s3';
import crypto from 'crypto';
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
        const file = formData.get('file') as File;

        const v = await validateUpload({
            file,
            allowed: UPLOAD_PRESETS.IMAGES_AND_PDF,
            maxBytes: 15 * 1024 * 1024,
        });
        if (!v.ok) {
            return NextResponse.json({ error: v.error }, { status: v.status });
        }
        const { buffer, mime } = v;

        const originalName = file.name || 'document.pdf';
        const fileExtension = path.extname(originalName) || '.pdf';
        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const key = `strafzettel/${fileName}`;

        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer!,
            ContentType: mime,
        }));

        const publicUrl = R2_PUBLIC_URL
            ? `${R2_PUBLIC_URL}/${key}`
            : `https://${R2_BUCKET_NAME}.r2.dev/${key}`;

        return NextResponse.json({
            success: true,
            url: publicUrl
        });
    } catch (error) {
        console.error('Upload Fehler:', error);
        return NextResponse.json({ error: 'Upload fehlgeschlagen' }, { status: 500 });
    }
}
