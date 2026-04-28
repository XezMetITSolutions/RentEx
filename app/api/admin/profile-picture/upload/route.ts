import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/s3';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Nur Bilddateien erlaubt' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Datei zu groß (max 5MB)' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const key = `admin-profiles/${session.id}-${Date.now()}.${file.type.split('/')[1]}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: Buffer.from(buffer),
            ContentType: file.type,
        });

        await r2.send(command);

        const imageUrl = `${R2_PUBLIC_URL}/${key}`;

        await prisma.systemSetting.upsert({
            where: { key: 'admin_profile_picture' },
            update: { value: imageUrl },
            create: { key: 'admin_profile_picture', value: imageUrl },
        });

        return NextResponse.json(
            { success: true, imageUrl },
            { status: 200 }
        );
    } catch (error) {
        console.error('[POST /api/admin/profile-picture/upload]', error);
        return NextResponse.json({ error: 'Fehler beim Upload' }, { status: 500 });
    }
}
