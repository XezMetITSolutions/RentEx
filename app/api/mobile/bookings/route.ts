import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isCarAvailable, lockCarForBooking } from '@/lib/availability';
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
    if (!car) {
      return NextResponse.json({ error: 'Fahrzeug nicht gefunden.' }, { status: 404 });
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.max(1, Math.ceil((+endDate - +startDate) / msPerDay));
    const dailyRate = Number(car.dailyRate);
    const subtotal = dailyRate * totalDays;
    const serviceFee = subtotal * 0.05;
    const totalAmount = subtotal + serviceFee;

    // Lock the car row so two concurrent requests cannot both pass the overlap check.
    const rental = await prisma.$transaction(async (tx) => {
      await lockCarForBooking(tx, carId);
      if (!(await isCarAvailable(carId, startDate, endDate, tx))) return null;
      return tx.rental.create({
        data: {
          carId,
          customerId,
          startDate,
          endDate,
          dailyRate: car.dailyRate,
          totalDays,
          totalAmount,
          status: 'Pending',
          paymentStatus: 'Pending',
        },
        include: {
          car: true,
          pickupLocation: true,
          returnLocation: true,
        },
      });
    });
    if (!rental) {
      return NextResponse.json(
        { error: 'Fahrzeug ist in diesem Zeitraum bereits gebucht.' },
        { status: 409 }
      );
    }

    return NextResponse.json(serializeBooking(rental), { status: 201 });
  } catch (err) {
    console.error('[POST /api/mobile/bookings]', err);
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 });
  }
}
