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
      select: {
        id: true,
        brand: true,
        model: true,
        category: true,
        dailyRate: true,
        imageUrl: true,
        fuelType: true,
        transmission: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
  }
}
