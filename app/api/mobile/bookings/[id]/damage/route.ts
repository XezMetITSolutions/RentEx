import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthCustomerId } from '@/lib/mobileAuth';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const customerId = getAuthCustomerId(req);
  if (!customerId) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const { id } = await context.params;
  const bookingId = Number(id);
  if (!bookingId) {
    return NextResponse.json({ error: 'Ungültige ID.' }, { status: 400 });
  }

  const rental = await prisma.rental.findUnique({
    where: { id: bookingId },
    select: { id: true, customerId: true, carId: true, status: true },
  });

  if (!rental || rental.customerId !== customerId) {
    return NextResponse.json({ error: 'Buchung nicht gefunden.' }, { status: 404 });
  }

  if (rental.status === 'Cancelled') {
    return NextResponse.json({ error: 'Stornierte Buchungen können nicht gemeldet werden.' }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const { description, type, locationOnCar, photoUrl } = body ?? {};

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return NextResponse.json(
      { error: 'Beschreibung erforderlich (mindestens 10 Zeichen).' },
      { status: 400 }
    );
  }

  const VALID_TYPES = ['Scratch', 'Dent', 'Broken Glass', 'Missing Part', 'Other'];
  const damageType = VALID_TYPES.includes(type) ? type : 'Other';

  const damage = await prisma.damageRecord.create({
    data: {
      carId: rental.carId,
      rentalId: bookingId,
      type: damageType,
      description: description.trim(),
      locationOnCar: locationOnCar?.trim() || null,
      photoUrl: photoUrl?.trim() || null,
      reportedByCustomerId: customerId,
    },
  });

  return NextResponse.json({ success: true, damage }, { status: 201 });
}
