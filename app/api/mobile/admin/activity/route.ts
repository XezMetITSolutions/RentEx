import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthStaff } from '@/lib/mobileAuth';

export async function GET(req: NextRequest) {
  const staff = getAuthStaff(req);
  if (!staff) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const logs = await prisma.activityLog
    .findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    .catch(() => [] as any[]);

  return NextResponse.json(
    logs.map((l: any) => ({
      id: l.id,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      userId: l.userId,
      userName: l.userName,
      description: l.description,
      metadata: l.metadata,
      createdAt: l.createdAt.toISOString(),
    }))
  );
}
