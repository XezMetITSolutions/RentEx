import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthCustomerId } from '@/lib/mobileAuth';
import { lockCarForBooking } from '@/lib/availability';
import { assertPickupMileage } from '@/lib/rentalGuards';

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
  const data = await req.json();

  try {
    const rental = await prisma.rental.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { isBlacklisted: true } },
        car: { select: { currentMileage: true } },
      },
    });

    if (!rental || rental.customerId !== customerId) {
      return NextResponse.json({ error: 'Buchung nicht gefunden.' }, { status: 404 });
    }
    if (rental.customer.isBlacklisted) {
      return NextResponse.json({ error: 'Eine Übernahme ist derzeit nicht möglich. Bitte rufen Sie uns an.' }, { status: 403 });
    }
    if (rental.status !== 'Pending' && rental.status !== 'Confirmed') {
      return NextResponse.json({ error: 'Diese Buchung kann nicht mehr übernommen werden.' }, { status: 400 });
    }
    const payOnArrival = rental.paymentMethod === 'arrival' || rental.paymentMethod === 'Cash' || rental.paymentMethod === 'Bar';
    if (rental.paymentStatus !== 'Paid' && !payOnArrival) {
      return NextResponse.json({ error: 'Bitte bezahlen Sie die Buchung vor der Übernahme.' }, { status: 402 });
    }
    let mileage: number;
    try {
      mileage = assertPickupMileage(Number(data.mileage), rental.car.currentMileage);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kilometerstand ungültig.';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const other = await prisma.rental.count({
      where: { carId: rental.carId, status: 'Active', id: { not: bookingId } },
    });
    if (other > 0) {
      return NextResponse.json({ error: 'Das Fahrzeug ist noch nicht zurück.' }, { status: 409 });
    }
    const earliest = new Date(rental.startDate).getTime() - 12 * 60 * 60 * 1000;
    if (Date.now() < earliest) {
      return NextResponse.json({ error: 'Die Übernahme ist erst 12 Stunden vor Abholung möglich.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await lockCarForBooking(tx, rental.carId);
      const stillOut = await tx.rental.count({
        where: { carId: rental.carId, status: 'Active', id: { not: bookingId } },
      });
      if (stillOut > 0) throw new Error('Das Fahrzeug ist noch nicht zurück.');
      await tx.rental.update({
        where: { id: bookingId },
        data: {
          pickupMileage: mileage,
          fuelLevelPickup: data.fuelLevel,
          signature: data.signature,
          checkInAt: new Date(),
          status: 'Active',
        },
      });
      await tx.car.update({
        where: { id: rental.carId },
        data: { status: 'Rented', currentMileage: mileage },
      });
    });

    // Create damage records if any
    if (data.damages && Array.isArray(data.damages)) {
      for (const damage of data.damages) {
        await prisma.damageRecord.create({
          data: {
            rentalId: bookingId,
            carId: rental.carId,
            type: damage.type,
            description: damage.description,
            photoUrl: damage.photoUrl,
            locationOnCar: damage.locationOnCar,
            xPosition: damage.xPosition,
            yPosition: damage.yPosition,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Check-in error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('nicht zurück') || message.includes('unplausibel') || message.includes('unter dem letzten')) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Check-in fehlgeschlagen.' }, { status: 500 });
  }
}
