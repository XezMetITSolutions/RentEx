
import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/s3';
import crypto from 'crypto';
import path from 'path';
import { getAuthCustomerId } from '@/lib/mobileAuth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const customerId = getAuthCustomerId(request);
    if (!customerId) {
        return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Nur Bilder erlaubt' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const originalName = file.name || 'document.jpg';
        const fileExtension = path.extname(originalName) || '.jpg';
        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const key = `customer-docs/${customerId}/${fileName}`;

        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));

        const publicUrl = R2_PUBLIC_URL
            ? `${R2_PUBLIC_URL}/${key}`
            : `https://${R2_BUCKET_NAME}.r2.dev/${key}`;

        return NextResponse.json({
            success: true,
            url: publicUrl
        });
    } catch (error) {
        console.error('[mobile-upload]', error);
        return NextResponse.json({
            error: 'Upload fehlgeschlagen'
        }, { status: 500 });
    }
}
