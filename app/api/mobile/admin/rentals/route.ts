import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthStaff } from '@/lib/mobileAuth';

function serialize(r: any) {
  return {
    id: r.id,
    status: r.status,
    paymentStatus: r.paymentStatus,
    startDate: r.startDate.toISOString(),
    endDate: r.endDate.toISOString(),
    totalAmount: r.totalAmount?.toString?.() ?? r.totalAmount,
    isOverdue: r.isOverdue,
    contractNumber: r.contractNumber,
    car: r.car
      ? {
          id: r.car.id,
          brand: r.car.brand,
          model: r.car.model,
          plate: r.car.plate,
          imageUrl: r.car.imageUrl,
        }
      : null,
    customer: r.customer
      ? {
          id: r.customer.id,
          firstName: r.customer.firstName,
          lastName: r.customer.lastName,
          email: r.customer.email,
          phone: r.customer.phone,
        }
      : null,
  };
}

export async function GET(req: NextRequest) {
  const staff = getAuthStaff(req);
  if (!staff) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.trim();

  const where: any = {};
  if (status && status !== 'all') where.status = status;
  if (search) {
    where.OR = [
      { contractNumber: { contains: search, mode: 'insensitive' } },
      { customer: { firstName: { contains: search, mode: 'insensitive' } } },
      { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      { customer: { email: { contains: search, mode: 'insensitive' } } },
      { car: { brand: { contains: search, mode: 'insensitive' } } },
      { car: { model: { contains: search, mode: 'insensitive' } } },
      { car: { plate: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const rentals = await prisma.rental.findMany({
    where,
    include: { car: true, customer: true },
    orderBy: { startDate: 'desc' },
    take: 100,
  });

  return NextResponse.json(rentals.map(serialize));
}
