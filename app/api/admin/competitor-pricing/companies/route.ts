import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiModule } from '@/lib/adminAccess';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const auth = await requireAdminApiModule('Mitbewerber');
    if (auth.response) return auth.response;
    const session = auth.session;

    try {
        const companies = await prisma.competitorCompany.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(companies);
    } catch (error) {
        console.error('[GET /api/admin/competitor-pricing/companies]', error);
        return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const auth = await requireAdminApiModule('Mitbewerber');
    if (auth.response) return auth.response;
    const session = auth.session;

    try {
        const body = await req.json();
        const { name, website, notes } = body;

        if (!name) {
            return NextResponse.json({ error: 'Firmenname erforderlich' }, { status: 400 });
        }

        const company = await prisma.competitorCompany.create({
            data: { name, website, notes },
        });

        return NextResponse.json(company, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Firma existiert bereits' }, { status: 409 });
        }
        console.error('[POST /api/admin/competitor-pricing/companies]', error);
        return NextResponse.json({ error: 'Fehler beim Erstellen' }, { status: 500 });
    }
}
