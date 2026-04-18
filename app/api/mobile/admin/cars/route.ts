import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthStaff } from '@/lib/mobileAuth';

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
      { brand: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
      { plate: { contains: search, mode: 'insensitive' } },
    ];
  }

  const cars = await prisma.car.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      brand: true,
      model: true,
      plate: true,
      year: true,
      status: true,
      category: true,
      fuelType: true,
      dailyRate: true,
      imageUrl: true,
      currentMileage: true,
      nextInspection: true,
    },
  });

  return NextResponse.json(
    cars.map((c) => ({
      ...c,
      dailyRate: c.dailyRate?.toString(),
      nextInspection: c.nextInspection?.toISOString() ?? null,
    }))
  );
}
