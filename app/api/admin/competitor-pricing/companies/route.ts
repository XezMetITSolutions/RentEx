import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

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
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

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
