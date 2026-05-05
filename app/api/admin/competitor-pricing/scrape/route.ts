import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { runAllScrapers } from '@/lib/scrapers';

export async function POST(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    try {
        const results = await runAllScrapers();
        return NextResponse.json({
            success: true,
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[POST /api/admin/competitor-pricing/scrape]', error);
        return NextResponse.json(
            { error: 'Fehler beim Scrapen' },
            { status: 500 }
        );
    }
}
