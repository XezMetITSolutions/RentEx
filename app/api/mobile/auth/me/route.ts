import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthCustomerId } from '@/lib/mobileAuth';

function serialize(c: any) {
  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    address: c.address,
    city: c.city,
    postalCode: c.postalCode,
    country: c.country,
  };
}

export async function GET(req: NextRequest) {
  const customerId = getAuthCustomerId(req);
  if (!customerId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    return NextResponse.json({ error: 'Benutzer nicht gefunden.' }, { status: 404 });
  }
  return NextResponse.json(serialize(customer));
}

export async function PATCH(req: NextRequest) {
  const customerId = getAuthCustomerId(req);
  if (!customerId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 });
  }

  const data: Record<string, any> = {};
  const allowed = ['firstName', 'lastName', 'phone', 'address', 'city', 'postalCode', 'country'];
  for (const key of allowed) {
    if (key in body) {
      const val = body[key];
      if (val === null) data[key] = null;
      else if (typeof val === 'string') {
        const trimmed = val.trim();
        data[key] = trimmed === '' ? null : trimmed;
      }
    }
  }

  if (data.firstName === null || data.lastName === null) {
    return NextResponse.json({ error: 'Vor- und Nachname dürfen nicht leer sein.' }, { status: 400 });
  }

  try {
    const updated = await prisma.customer.update({ where: { id: customerId }, data });
    return NextResponse.json(serialize(updated));
  } catch (err) {
    console.error('[mobile-me-patch]', err);
    return NextResponse.json({ error: 'Aktualisierung fehlgeschlagen.' }, { status: 500 });
  }
}
