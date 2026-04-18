import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthStaff } from '@/lib/mobileAuth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const staff = getAuthStaff(req);
  if (!staff) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { id } = await context.params;
  const rental = await prisma.rental.findUnique({
    where: { id: Number(id) },
    include: {
      car: true,
      customer: true,
      pickupLocation: true,
      returnLocation: true,
    },
  });
  if (!rental) {
    return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 });
  }
  return NextResponse.json({
    id: rental.id,
    status: rental.status,
    paymentStatus: rental.paymentStatus,
    startDate: rental.startDate.toISOString(),
    endDate: rental.endDate.toISOString(),
    actualReturnDate: rental.actualReturnDate?.toISOString() ?? null,
    pickupMileage: rental.pickupMileage,
    returnMileage: rental.returnMileage,
    dailyRate: rental.dailyRate?.toString(),
    totalDays: rental.totalDays,
    totalAmount: rental.totalAmount?.toString(),
    contractNumber: rental.contractNumber,
    isOverdue: rental.isOverdue,
    notes: rental.notes,
    car: rental.car,
    customer: {
      id: rental.customer.id,
      firstName: rental.customer.firstName,
      lastName: rental.customer.lastName,
      email: rental.customer.email,
      phone: rental.customer.phone,
      licenseNumber: rental.customer.licenseNumber,
    },
    pickupLocation: rental.pickupLocation?.name ?? null,
    returnLocation: rental.returnLocation?.name ?? null,
  });
}
