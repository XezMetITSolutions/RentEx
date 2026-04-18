import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthStaff } from '@/lib/mobileAuth';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const staff = getAuthStaff(req);
  if (!staff) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { id } = await context.params;
  const rentalId = Number(id);
  if (!rentalId) return NextResponse.json({ error: 'Ungültige ID.' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const pickupMileage = body?.pickupMileage ? Number(body.pickupMileage) : null;
  const fuelLevelPickup = typeof body?.fuelLevelPickup === 'string' ? body.fuelLevelPickup : null;
  const notes = typeof body?.notes === 'string' ? body.notes : null;

  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental) return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 });
  if (rental.status !== 'Pending' && rental.status !== 'Confirmed') {
    return NextResponse.json(
      { error: 'Check-in nur für ausstehende oder bestätigte Buchungen möglich.' },
      { status: 400 }
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.rental.update({
      where: { id: rentalId },
      data: {
        status: 'Active',
        checkInAt: new Date(),
        pickupMileage: pickupMileage ?? undefined,
        fuelLevelPickup: fuelLevelPickup ?? undefined,
        notes: notes ?? undefined,
      },
    }),
    prisma.car.update({
      where: { id: rental.carId },
      data: {
        status: 'Rented',
        currentMileage: pickupMileage ?? undefined,
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'RENTAL_CHECKIN',
        entityType: 'Rental',
        entityId: rentalId,
        userId: String(staff.id),
        description: `Staff #${staff.id} checked in rental #${rentalId}`,
        metadata: JSON.stringify({ pickupMileage, fuelLevelPickup }),
      },
    }),
  ]);

  return NextResponse.json({ success: true, rental: { id: updated.id, status: updated.status } });
}
