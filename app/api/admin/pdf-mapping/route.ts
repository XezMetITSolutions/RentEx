import { NextRequest, NextResponse } from 'next/server';
import { getPdfMapping, savePdfMapping, PdfFieldMapping } from '@/lib/pdfMapping';
import { requireAdminApiModule } from '@/lib/adminAccess';

export async function GET() {
    const auth = await requireAdminApiModule('Einstellungen');
    if (auth.response) return auth.response;
    const session = auth.session;
    const mapping = await getPdfMapping();
    return NextResponse.json(mapping);
}

export async function POST(request: NextRequest) {
    const auth = await requireAdminApiModule('Einstellungen');
    if (auth.response) return auth.response;
    const session = auth.session;
    try {
        const body = await request.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Ungültiges Format' }, { status: 400 });
        }
        await savePdfMapping(body as PdfFieldMapping[], session.name);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving PDF mapping:', error);
        return NextResponse.json({ error: 'Failed to save mapping' }, { status: 500 });
    }
}
