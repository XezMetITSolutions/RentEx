import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthStaff } from '@/lib/mobileAuth';

export async function GET(req: NextRequest) {
  const staff = getAuthStaff(req);
  if (!staff) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.trim();

  const where: any = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      city: true,
      isBlacklisted: true,
      customerType: true,
      createdAt: true,
      _count: { select: { rentals: true } },
    },
  });

  return NextResponse.json(
    customers.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      city: c.city,
      isBlacklisted: c.isBlacklisted,
      customerType: c.customerType,
      rentalCount: c._count.rentals,
      createdAt: c.createdAt.toISOString(),
    }))
  );
}
