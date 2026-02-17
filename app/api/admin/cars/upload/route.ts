import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
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

        // Ensure public/assets/cars directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'assets', 'cars');
        await mkdir(uploadDir, { recursive: true });

        // Generate a unique filename
        const originalName = file.name || 'image.jpg';
        const fileExtension = path.extname(originalName) || '.jpg';
        const fileName = `${crypto.randomUUID()}${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        // Return the relative path for use in the frontend
        const relativePath = `/assets/cars/${fileName}`;

        return NextResponse.json({
            success: true,
            message: 'Bild erfolgreich hochgeladen',
            url: relativePath
        });
    } catch (error) {
        console.error('Image Upload Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Upload fehlgeschlagen',
            details: errorMessage
        }, { status: 500 });
    }
}
