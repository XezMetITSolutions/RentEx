import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'app', 'ÖAMTC Europäischer Unfallbericht.pdf');
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
        }
        const buffer = fs.readFileSync(filePath);
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="Europaeischer-Unfallbericht-OEAMTC.pdf"',
            },
        });
    } catch {
        return NextResponse.json({ error: 'Error serving PDF' }, { status: 500 });
    }
}
