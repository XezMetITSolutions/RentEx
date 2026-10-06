import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CAR_BUSY_MESSAGE, isBookableCar, isCarAvailable, lockCarForBooking } from '@/lib/availability';
import { quoteBooking } from '@/lib/bookingPrice';
import { chargeableDaysBetween } from '@/lib/bookingUtils';
import { bookingRejectedReason } from '@/lib/rentalGuards';
import { getAuthCustomerId } from '@/lib/mobileAuth';

function parseFeatures(features: string | null): string[] | null {
  if (!features) return null;
  return features
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function serializeCar(car: any) {
  if (!car) return null;
  return {
    id: car.id,
    brand: car.brand,
    model: car.model,
    category: car.category,
    dailyRate: car.dailyRate?.toString?.() ?? car.dailyRate,
    imageUrl: car.imageUrl,
    fuelType: car.fuelType,
    transmission: car.transmission,
    year: car.year,
    seats: car.seats,
    doors: car.doors,
    description: car.description,
    features: parseFeatures(car.features),
  };
}

function serializeBooking(r: any) {
  return {
    id: r.id,
    carId: r.carId,
    car: serializeCar(r.car),
    customerId: r.customerId,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate.toISOString(),
    status: r.status,
    paymentStatus: r.paymentStatus,
    totalAmount: r.totalAmount?.toString?.() ?? r.totalAmount,
    pickupLocation: r.pickupLocation?.name ?? null,
    returnLocation: r.returnLocation?.name ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const customerId = getAuthCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
    }

    const rentals = await prisma.rental.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        car: true,
        pickupLocation: true,
        returnLocation: true,
      },
    });

    return NextResponse.json(rentals.map(serializeBooking));
  } catch (err) {
    console.error('[GET /api/mobile/bookings]', err);
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const customerId = getAuthCustomerId(req);
    if (!customerId) {
      return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const carId = Number(body?.carId);
    const startDate = body?.startDate ? new Date(body.startDate) : null;
    const endDate = body?.endDate ? new Date(body.endDate) : null;

    if (!carId || !startDate || !endDate || isNaN(+startDate) || isNaN(+endDate)) {
      return NextResponse.json({ error: 'Ungültige Daten.' }, { status: 400 });
    }
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'Rückgabedatum muss nach Abholung liegen.' },
        { status: 400 }
      );
    }

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car || !isBookableCar(car)) {
      return NextResponse.json({ error: 'Fahrzeug nicht gefunden.' }, { status: 404 });
    }

    const totalDays = chargeableDaysBetween(startDate, endDate);
    const rejected = bookingRejectedReason(car, endDate, totalDays);
    if (rejected) {
      return NextResponse.json({ error: rejected }, { status: 400 });
    }
    const quote = quoteBooking(car, [], totalDays, null, startDate);

    // Lock the car row so two concurrent requests cannot both pass the overlap check.
    const rental = await prisma.$transaction(async (tx) => {
      await lockCarForBooking(tx, carId);
      if (!(await isCarAvailable(carId, startDate, endDate, tx))) return null;
      const created = await tx.rental.create({
        data: {
          carId,
          customerId,
          startDate,
          endDate,
          dailyRate: car.dailyRate,
          totalDays,
          totalAmount: quote.total,
          includedKm: quote.includedKm,
          status: 'Pending',
          paymentStatus: 'Pending',
          pickupLocationId: car.locationId,
          returnLocationId: car.locationId,
        },
      });
      const withNumber = await tx.rental.update({
        where: { id: created.id },
        data: { contractNumber: `RNT-${new Date().getFullYear()}-${String(created.id).padStart(7, '0')}` },
        include: {
          car: true,
          pickupLocation: true,
          returnLocation: true,
        },
      });
      return withNumber;
    });
    if (!rental) {
      return NextResponse.json(
        { error: CAR_BUSY_MESSAGE },
        { status: 409 }
      );
    }

    return NextResponse.json(serializeBooking(rental), { status: 201 });
  } catch (err) {
    console.error('[POST /api/mobile/bookings]', err);
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 });
  }
}
