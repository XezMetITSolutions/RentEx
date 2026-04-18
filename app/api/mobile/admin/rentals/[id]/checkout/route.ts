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
  const returnMileage = body?.returnMileage ? Number(body.returnMileage) : null;
  const fuelLevelReturn = typeof body?.fuelLevelReturn === 'string' ? body.fuelLevelReturn : null;
  const damageReport = typeof body?.damageReport === 'string' ? body.damageReport : null;
  const extraCharges = body?.extraCharges != null ? Number(body.extraCharges) : 0;

  const rental = await prisma.rental.findUnique({ where: { id: rentalId } });
  if (!rental) return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 });
  if (rental.status !== 'Active') {
    return NextResponse.json(
      { error: 'Rückgabe nur für aktive Mieten möglich.' },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.rental.update({
      where: { id: rentalId },
      data: {
        status: 'Completed',
        actualReturnDate: new Date(),
        returnMileage: returnMileage ?? undefined,
        fuelLevelReturn: fuelLevelReturn ?? undefined,
        damageReport: damageReport ?? undefined,
        extraCharges: extraCharges ?? undefined,
      },
    }),
    prisma.car.update({
      where: { id: rental.carId },
      data: {
        status: 'Active',
        currentMileage: returnMileage ?? undefined,
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'RENTAL_CHECKOUT',
        entityType: 'Rental',
        entityId: rentalId,
        userId: String(staff.id),
        description: `Staff #${staff.id} completed rental #${rentalId}`,
        metadata: JSON.stringify({ returnMileage, fuelLevelReturn, extraCharges }),
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
