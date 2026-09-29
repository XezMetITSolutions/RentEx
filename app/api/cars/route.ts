import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { BOOKABLE_CAR_STATUSES, toPublicCar } from '@/lib/publicCar';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category')?.trim() || null;
    const search = searchParams.get('search')?.trim() || null;

    const where: Prisma.CarWhereInput = { isActive: true, status: { in: BOOKABLE_CAR_STATUSES } };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const cars = await prisma.car.findMany({
      where,
      orderBy: { dailyRate: 'asc' },
    });

    // Group by model (Brand + Model) like in the web fleet page
    const grouped = cars.reduce((acc, car) => {
      const key = `${car.brand}-${car.model}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(car);
      return acc;
    }, {} as Record<string, typeof cars>);

    // Select the first car from each group (or random)
    const uniqueCars = Object.values(grouped).map(group => group[0]);

    // Re-sort by price just in case
    const sorted = uniqueCars.sort((a, b) => Number(a.dailyRate) - Number(b.dailyRate));

    // No generated ratings: showing invented review scores to customers is
    // misleading (and unlawful under UWG). The app shows "Neu" without a rating.
    return NextResponse.json(sorted.map(toPublicCar));
  } catch (error) {
    console.error('[GET /api/cars]', error);
    return NextResponse.json({ error: 'Fahrzeuge konnten nicht geladen werden.' }, { status: 500 });
  }
}
