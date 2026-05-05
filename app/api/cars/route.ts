import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category')?.trim() || null;
    const search = searchParams.get('search')?.trim() || null;

    const where: Prisma.CarWhereInput = { isActive: true };
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

    // Add deterministic ratings
    const withRatings = sorted.map(car => {
      // Deterministic pseudo-random based on ID
      const seed = car.id * 12345;
      const pseudoRandom = (seed % 100) / 100; // 0.0 to 0.99
      
      const rating = 4.5 + (pseudoRandom * 0.5); // 4.5 to 5.0
      const reviewCount = 10 + (seed % 90); // 10 to 100 reviews

      return {
        ...car,
        rating: Number(rating.toFixed(1)),
        reviewCount,
      };
    });

    return NextResponse.json(withRatings);
  } catch (error) {
    console.error('[GET /api/cars]', error);
    return NextResponse.json({ error: 'Fahrzeuge konnten nicht geladen werden.' }, { status: 500 });
  }
}
