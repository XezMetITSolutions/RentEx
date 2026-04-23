
import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/s3';
import crypto from 'crypto';
import path from 'path';
import { getAdminSession } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error('Upload Fehler: Keine Datei in FormData gefunden');
            return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
        }

        // Validate file type (allow only images)
        if (!file.type.startsWith('image/')) {
            console.error('Upload Fehler: Ungültiger Dateityp:', file.type);
            return NextResponse.json({ error: 'Nur Bilder erlaubt' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate a unique filename using crypto.randomUUID()
        const originalName = file.name || 'image.jpg';
        const fileExtension = path.extname(originalName) || '.jpg';
        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const key = `car-images/${fileName}`; // Folder structure in bucket

        // Upload to R2
        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));

        // Construct the public URL
        const publicUrl = R2_PUBLIC_URL
            ? `${R2_PUBLIC_URL}/${key}`
            : `https://${R2_BUCKET_NAME}.r2.dev/${key}`; // Fallback if no custom domain, assumes public access enabled

        return NextResponse.json({
            success: true,
            message: 'Bild erfolgreich auf R2 hochgeladen',
            url: publicUrl
        });
    } catch (error) {
        console.error('Bild-Upload Fehler (R2):', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Upload fehlgeschlagen',
            details: errorMessage
        }, { status: 500 });
    }
}
