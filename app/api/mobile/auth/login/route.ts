import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { signToken } from '@/lib/mobileAuth';
import { rateLimit, getClientIp, RATE_LIMITS, rateLimitErrorMessage } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'E-Mail und Passwort erforderlich.' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const rl = rateLimit(`mobile-login:${ip}:${email}`, RATE_LIMITS.AUTH_LOGIN);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: rateLimitErrorMessage(rl) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.passwordHash) {
      return NextResponse.json({ error: 'Ungültige Anmeldedaten.' }, { status: 401 });
    }

    if (!verifyPassword(password, customer.passwordHash)) {
      return NextResponse.json({ error: 'Ungültige Anmeldedaten.' }, { status: 401 });
    }

    if (customer.isBlacklisted) {
      return NextResponse.json(
        { error: 'Konto gesperrt. Bitte kontaktieren Sie den Support.' },
        { status: 403 }
      );
    }

    const token = signToken(customer.id, 'customer');
    return NextResponse.json({
      token,
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        postalCode: customer.postalCode,
        country: customer.country,
      },
    });
  } catch (err) {
    console.error('[mobile-login]', err);
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
