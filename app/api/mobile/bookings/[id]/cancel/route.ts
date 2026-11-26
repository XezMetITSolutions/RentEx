import { cancellationQuote, cancellationBlockReason } from '@/lib/cancellationPolicy';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthCustomerId } from '@/lib/mobileAuth';
import { cancelRentalForCustomer } from '@/lib/cancellation';

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

    const body = await req.json().catch(() => ({}));
    if (typeof body.acceptedFee !== "number") return NextResponse.json({ error: "Bitte zuerst die Stornokosten abrufen und bestätigen." }, { status: 409 });
    const cancelled = await cancelRentalForCustomer({
      rentalId: bookingId,
      acceptedFee: body.acceptedFee,
      customerId,
      actor: { kind: 'customer', customerId },
    });
    if (!cancelled.ok) {
      const status = cancelled.error === 'Reservierung nicht gefunden.' ? 404 : 400;
      return NextResponse.json({ error: cancelled.error }, { status });
    }

    const updated = await prisma.rental.findUnique({
      where: { id: bookingId },
      include: { car: true, customer: true, pickupLocation: true, returnLocation: true },
    });
    if (!updated) {
      return NextResponse.json({ error: 'Buchung nicht gefunden.' }, { status: 404 });
    }

    return NextResponse.json(serializeBooking(updated));
  } catch (err) {
    console.error('[POST /api/mobile/bookings/[id]/cancel]', err);
    return NextResponse.json({ error: 'Interner Serverfehler.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: {params: Promise<{id:string}>}) {
 const customerId=getAuthCustomerId(req);if(!customerId)return NextResponse.json({error:'Nicht angemeldet.'},{status:401});
 const {id}=await context.params;const rentalId=Number(id);if(!Number.isSafeInteger(rentalId)||rentalId<=0)return NextResponse.json({error:'Ungültige ID.'},{status:400});
 const rental=await prisma.rental.findFirst({where:{id:rentalId,customerId},include:{payments:true}});
 if(!rental)return NextResponse.json({error:'Buchung nicht gefunden.'},{status:404});
 const blocked=cancellationBlockReason(rental);if(blocked)return NextResponse.json({error:blocked},{status:400});
 return NextResponse.json(cancellationQuote(rental,rental.payments.reduce((n,p)=>n+Number(p.amount),0)));
}
