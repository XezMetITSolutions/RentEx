import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthCustomerId } from '@/lib/mobileAuth';
import { emailTemplates, sendEmail } from '@/lib/notificationTemplates';

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

export async function POST(
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

    const rental = await prisma.rental.findUnique({ where: { id: bookingId } });
    if (!rental || rental.customerId !== customerId) {
      return NextResponse.json({ error: 'Buchung nicht gefunden.' }, { status: 404 });
    }

    if (rental.status !== 'Pending' && rental.status !== 'Confirmed') {
      return NextResponse.json(
        { error: 'Diese Buchung kann nicht mehr storniert werden.' },
        { status: 400 }
      );
    }

    const updated = await prisma.rental.update({
      where: { id: bookingId },
      data: { status: 'Cancelled' },
      include: { car: true, customer: true, pickupLocation: true, returnLocation: true },
    });

    // Send cancellation confirmation email (best-effort)
    if (updated.customer && updated.car && updated.contractNumber) {
      sendEmail(updated.customer.email, emailTemplates.cancellationConfirmation({
        contractNumber: updated.contractNumber,
        customer: {
          firstName: updated.customer.firstName,
          lastName: updated.customer.lastName,
          email: updated.customer.email,
        },
        car: {
          brand: updated.car.brand,
          model: updated.car.model,
          plate: updated.car.plate,
        },
        rental: {
          startDate: updated.startDate,
          endDate: updated.endDate,
          totalAmount: Number(updated.totalAmount),
        },
      })).catch((e) => console.error('[cancel] Email send failed:', e));
    }

    return NextResponse.json(serializeBooking(updated));
  } catch (err) {
    console.error('[POST /api/mobile/bookings/[id]/cancel]', err);
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 });
  }
}
