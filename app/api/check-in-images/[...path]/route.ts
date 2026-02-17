import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const resolvedParams = await params;
        const filePath = path.join(process.cwd(), 'Check-in', ...resolvedParams.path);

        // Security check: ensure the path is within the Check-in directory
        const absoluteCheckInDir = path.join(process.cwd(), 'Check-in');
        if (!filePath.startsWith(absoluteCheckInDir)) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const fileBuffer = await fs.readFile(filePath);

        // Determine content type
        const ext = path.extname(filePath).toLowerCase();
        const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        return new NextResponse('Not Found', { status: 404 });
    }
}
