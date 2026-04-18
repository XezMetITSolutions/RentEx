import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { getAuthCustomerId } from '@/lib/mobileAuth';

export async function POST(req: NextRequest) {
  const customerId = getAuthCustomerId(req);
  if (!customerId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Neues Passwort mindestens 6 Zeichen.' }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { passwordHash: true },
  });

  if (!customer?.passwordHash) {
    return NextResponse.json({ error: 'Kein Passwort gesetzt.' }, { status: 400 });
  }
  if (!verifyPassword(currentPassword, customer.passwordHash)) {
    return NextResponse.json({ error: 'Aktuelles Passwort ist falsch.' }, { status: 401 });
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { passwordHash: hashPassword(newPassword) },
  });
  return NextResponse.json({ success: true });
}
