import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { getAuthCustomerId } from '@/lib/mobileAuth';
import { rateLimit, getClientIp, RATE_LIMITS, rateLimitErrorMessage } from '@/lib/rateLimit';
import { apiOk, apiValidation, apiUnauthorized, apiRateLimited } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
  const customerId = getAuthCustomerId(req);
  if (!customerId) {
    return apiUnauthorized('Nicht angemeldet.');
  }

  const ip = getClientIp(req);
  const rl = rateLimit(`mobile-change-pw:${ip}:${customerId}`, RATE_LIMITS.AUTH_PASSWORD);
  if (!rl.allowed) {
    return apiRateLimited(rl, rateLimitErrorMessage(rl));
  }

  const body = await req.json().catch(() => null);
  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return apiValidation('Ungültige Anfrage.');
  }
  if (newPassword.length < 6) {
    return apiValidation('Neues Passwort mindestens 6 Zeichen.');
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { passwordHash: true },
  });

  if (!customer?.passwordHash) {
    return apiValidation('Kein Passwort gesetzt.');
  }
  if (!verifyPassword(currentPassword, customer.passwordHash)) {
    return apiUnauthorized('Aktuelles Passwort ist falsch.');
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { passwordHash: hashPassword(newPassword) },
  });
  return apiOk({ success: true });
}
