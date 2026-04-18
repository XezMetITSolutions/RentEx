import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/mobileAuth';
import { scryptSync } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'E-Mail und Passwort erforderlich.' }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({
      where: { email },
      include: { location: true },
    });

    if (!staff || !staff.passwordHash || !staff.isActive) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten oder Konto deaktiviert.' },
        { status: 401 }
      );
    }

    const [salt, storedHash] = staff.passwordHash.includes(':')
      ? staff.passwordHash.split(':')
      : staff.passwordHash.split('.');

    const hash = scryptSync(password, salt, 64).toString('hex');
    if (hash !== storedHash) {
      return NextResponse.json({ error: 'Ungültige Anmeldedaten.' }, { status: 401 });
    }

    await prisma.staff.update({
      where: { id: staff.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signToken(staff.id, 'staff', { staffRole: staff.role });
    return NextResponse.json({
      token,
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        locationId: staff.locationId,
        locationName: staff.location?.name ?? null,
      },
    });
  } catch (err) {
    console.error('[mobile-admin-login]', err);
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
