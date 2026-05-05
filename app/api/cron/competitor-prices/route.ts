import { NextRequest, NextResponse } from 'next/server';
import { runAllScrapers } from '@/lib/scrapers';

export async function GET(req: NextRequest) {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
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
        console.error('[GET /api/cron/competitor-prices]', error);
        return NextResponse.json(
            { error: 'Fehler beim Scrapen' },
            { status: 500 }
        );
    }
}
