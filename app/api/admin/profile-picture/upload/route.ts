import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/s3';
import prisma from '@/lib/prisma';
import { validateUpload, UPLOAD_PRESETS } from '@/lib/fileValidation';

export async function POST(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        const v = await validateUpload({
            file,
            allowed: UPLOAD_PRESETS.IMAGES_ONLY,
            maxBytes: 5 * 1024 * 1024,
        });
        if (!v.ok) {
            return NextResponse.json({ error: v.error }, { status: v.status });
        }
        const { buffer, mime } = v;

        const ext = mime.split('/')[1];
        const key = `admin-profiles/${session.id}-${Date.now()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer!,
            ContentType: mime,
        });

        await r2.send(command);

        const imageUrl = `${R2_PUBLIC_URL}/${key}`;

        await prisma.systemSettings.upsert({
            where: { key: 'admin_profile_picture' },
            update: { value: imageUrl },
            create: { key: 'admin_profile_picture', value: imageUrl, category: 'Admin' },
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
