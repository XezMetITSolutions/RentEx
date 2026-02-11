import { NextRequest, NextResponse } from 'next/server';
import { getPdfMapping, savePdfMapping, PdfFieldMapping } from '@/lib/pdfMapping';

export async function GET() {
    const mapping = getPdfMapping();
    return NextResponse.json(mapping);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Validation could go here
        savePdfMapping(body as PdfFieldMapping[]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving PDF mapping:', error);
        return NextResponse.json({ error: 'Failed to save mapping' }, { status: 500 });
    }
}
