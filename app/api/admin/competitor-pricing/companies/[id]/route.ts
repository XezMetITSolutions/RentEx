import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminForArea } from '@/lib/adminAccess';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const session = await getAdminForArea('competitor-pricing');
    if (!session) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    try {
        const id = parseInt(idStr);
        await prisma.competitorCompany.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[DELETE /api/admin/competitor-pricing/companies]', error);
        return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
    }
}
