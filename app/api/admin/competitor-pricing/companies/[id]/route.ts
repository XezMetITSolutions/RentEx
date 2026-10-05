import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiModule } from '@/lib/adminAccess';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const auth = await requireAdminApiModule('Mitbewerber');
    if (auth.response) return auth.response;
    const session = auth.session;

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
