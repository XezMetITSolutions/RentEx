import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthCustomerId } from '@/lib/mobileAuth';

function parseFeatures(features: string | null): string[] | null {
  if (!features) return null;
  return features.split(',').map((s) => s.trim()).filter(Boolean);
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

function serializePayment(p: any) {
  return {
    id: p.id,
    amount: p.amount?.toString?.() ?? p.amount,
    paymentMethod: p.paymentMethod,
    transactionId: p.transactionId ?? null,
    notes: p.notes ?? null,
    paidAt: p.paidAt?.toISOString?.() ?? p.createdAt?.toISOString?.() ?? null,
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
    payments: (r.payments ?? []).map(serializePayment),
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
      include: { car: true, pickupLocation: true, returnLocation: true, payments: { orderBy: { createdAt: 'desc' } } },
    });

    if (!rental || rental.customerId !== customerId) {
      return NextResponse.json({ error: 'Buchung nicht gefunden.' }, { status: 404 });
    }

    return NextResponse.json(serializeBooking(rental));
  } catch (err) {
    console.error('[GET /api/mobile/bookings/[id]]', err);
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 });
  }
}
