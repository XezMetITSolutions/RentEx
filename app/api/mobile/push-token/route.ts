import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobileAuth';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  const payload = token ? verifyMobileToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const pushToken = body?.token;
  const platform = body?.platform || 'unknown';
  if (!pushToken || typeof pushToken !== 'string' || pushToken.length > 500) {
    return NextResponse.json({ error: 'Ungültiges Token.' }, { status: 400 });
  }

  await prisma.activityLog
    .create({
      data: {
        action: 'PUSH_TOKEN_REGISTERED',
        entityType: payload.role === 'staff' ? 'Staff' : 'Customer',
        entityId: payload.sub,
        userId: String(payload.sub),
        userName: null,
        description: `Push-Token registriert (${platform})`,
        metadata: JSON.stringify({ token: pushToken, platform, role: payload.role }),
      },
    })
    .catch(() => null);

  return NextResponse.json({ success: true });
}
