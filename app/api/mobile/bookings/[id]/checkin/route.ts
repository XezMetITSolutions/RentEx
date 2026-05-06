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
  const data = await req.json();

  try {
    const rental = await prisma.rental.findUnique({
      where: { id: bookingId },
    });

    if (!rental || rental.customerId !== customerId) {
      return NextResponse.json({ error: 'Buchung nicht gefunden.' }, { status: 404 });
    }

    // Update rental with check-in data
    await prisma.rental.update({
      where: { id: bookingId },
      data: {
        pickupMileage: data.mileage,
        fuelLevelPickup: data.fuelLevel,
        signature: data.signature,
        checkInAt: new Date(),
        status: 'Active', // Move to active once checked in
      },
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
    return NextResponse.json({ error: 'Check-in fehlgeschlagen.' }, { status: 500 });
  }
}
