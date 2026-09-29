import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isCarAvailable, lockCarForBooking } from '@/lib/availability';
import { parseBookingDateTime } from '@/lib/bookingUtils';
import { priceRental } from '@/lib/pricing';
import { BOOKABLE_CAR_STATUSES } from '@/lib/publicCar';
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
    // The app sends plain dates ("YYYY-MM-DD"); they mean 10:00 Vienna time,
    // the default pickup/return time of the website. Full ISO timestamps
    // (with an explicit offset) are still accepted as-is.
    const toBookingDate = (value: unknown) => {
      if (typeof value !== 'string' || !value) return null;
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseBookingDateTime(value, '10:00');
      const d = new Date(value);
      return isNaN(+d) ? null : d;
    };
    const startDate = toBookingDate(body?.startDate);
    const endDate = toBookingDate(body?.endDate);

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
    if (!car.isActive || !BOOKABLE_CAR_STATUSES.includes(car.status)) {
      return NextResponse.json({ error: 'Dieses Fahrzeug ist derzeit nicht buchbar.' }, { status: 409 });
    }

    // Same day count and price as a booking on the website. (Previously a
    // hidden 5 % fee was added here that the app never showed to the customer.)
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.max(1, Math.ceil((+endDate - +startDate) / msPerDay - 2 / 24));
    // Only options that are bookable for this car (active template or car-specific).
    const optionIds = Array.isArray(body?.optionIds)
      ? body.optionIds.map(Number).filter(Number.isInteger)
      : [];
    const selectedOptions = optionIds.length
      ? await prisma.option.findMany({
          where: { id: { in: optionIds }, status: 'active', OR: [{ carId: null }, { carId }] },
        })
      : [];
    const price = priceRental(car, selectedOptions, totalDays);
    const totalAmount = price.baseTotal;

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
          includedKm: price.includedKm,
          extrasCost: price.extrasCost,
          insuranceCost: price.insuranceCost,
          insuranceType: price.insuranceType,
          status: 'Pending',
          paymentStatus: 'Pending',
          pickupLocationId: car.locationId,
          returnLocationId: car.locationId,
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
