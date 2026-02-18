
import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/s3';
import crypto from 'crypto';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error('Upload Error: No file found in FormData');
            return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
        }

        // Validate file type (allow only images)
        if (!file.type.startsWith('image/')) {
            console.error('Upload Error: Invalid file type:', file.type);
            return NextResponse.json({ error: 'Nur Bilder erlaubt' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

<<<<<<< Updated upstream
        // Ensure public/assets/cars directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'assets', 'cars');
        await mkdir(uploadDir, { recursive: true });

        // Generate a unique filename
        const originalName = file.name || 'image.jpg';
        const fileExtension = path.extname(originalName) || '.jpg';
=======
        // Generate a unique filename using crypto.randomUUID()
        const fileExtension = path.extname(file.name) || '.jpg';
>>>>>>> Stashed changes
        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const key = `car-images/${fileName}`; // Folder structure in bucket

        // Upload to R2
        await r2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            // ACL: 'public-read', // Not strictly needed for R2 usually, as permissions are bucket-level or via worker
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
        console.error('Image Upload Error (R2):', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Upload fehlgeschlagen',
            details: errorMessage
        }, { status: 500 });
    }
}
