import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getAdminSession();
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    try {
        const id = parseInt(params.id);
        await prisma.competitorCompany.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/admin/competitor-pricing/companies]', error);
        return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
    }
}
