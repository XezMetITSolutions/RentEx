import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { signToken } from '@/lib/mobileAuth';
import { validateName } from '@/lib/nameValidation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const phone =
      typeof body?.phone === 'string' && body.phone.trim() ? body.phone.trim() : null;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Bitte alle Pflichtfelder ausfüllen.' }, { status: 400 });
    }
    if (password.length < 12) {
      return NextResponse.json({ error: 'Passwort mindestens 12 Zeichen.' }, { status: 400 });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Passwort muss Groß- und Kleinbuchstaben sowie mindestens eine Zahl enthalten.' },
        { status: 400 }
      );
    }

    const nameCheck = validateName(firstName, lastName);
    if (nameCheck.riskScore >= 60) {
      return NextResponse.json(
        { error: `Ungültiger Name: ${nameCheck.reasons.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Diese E-Mail ist bereits registriert.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const customer = await prisma.customer.create({
      data: { firstName, lastName, email, phone, passwordHash },
    });

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
    console.error('[mobile-register]', err);
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
