import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyMobileToken } from '@/lib/mobileAuth';
import { apiOk, apiUnauthorized, apiValidation } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const bearer = auth.replace(/^Bearer\s+/i, '');
  const payload = bearer ? verifyMobileToken(bearer) : null;
  if (!payload) {
    return apiUnauthorized('Nicht angemeldet.');
  }

  const body = await req.json().catch(() => null);
  const pushToken = body?.token;
  const platform = typeof body?.platform === 'string' ? body.platform : 'unknown';
  if (!pushToken || typeof pushToken !== 'string' || pushToken.length > 500) {
    return apiValidation('Ungültiges Token.');
  }

  // Upsert into PushToken table: one row per Expo token, owned by the
  // authenticated subject. If the token migrates between users (e.g. user
  // logs in on a device that previously had another account), the unique
  // constraint forces an update so we don't ship pushes to the wrong user.
  const ownerData =
    payload.role === 'staff'
      ? { staffId: payload.sub, customerId: null }
      : { customerId: payload.sub, staffId: null };

  await prisma.pushToken.upsert({
    where: { token: pushToken },
    create: { token: pushToken, platform, ...ownerData },
    update: { platform, ...ownerData },
  });

  await prisma.activityLog
    .create({
      data: {
        action: 'PUSH_TOKEN_REGISTERED',
        entityType: payload.role === 'staff' ? 'Staff' : 'Customer',
        entityId: payload.sub,
        userId: String(payload.sub),
        userName: null,
        description: `Push-Token registriert (${platform})`,
        metadata: JSON.stringify({ platform, role: payload.role }),
      },
    })
    .catch(() => null);

  return apiOk({ success: true });
}

// DELETE — unregister a push token (called on logout or settings toggle)
export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const bearer = auth.replace(/^Bearer\s+/i, '');
  const payload = bearer ? verifyMobileToken(bearer) : null;
  if (!payload) {
    return apiUnauthorized('Nicht angemeldet.');
  }

  const body = await req.json().catch(() => null);
  const pushToken = body?.token;
  if (typeof pushToken !== 'string') {
    return apiValidation('Ungültiges Token.');
  }

  await prisma.pushToken.deleteMany({ where: { token: pushToken } });
  return apiOk({ success: true });
}
