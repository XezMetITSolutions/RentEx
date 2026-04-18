import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function parseFeatures(features: string | null): string[] | null {
  if (!features) return null;
  return features
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const carId = Number(id);
    if (!carId || Number.isNaN(carId)) {
      return NextResponse.json({ error: 'Ungültige Fahrzeug-ID.' }, { status: 400 });
    }

    const car = await prisma.car.findUnique({
      where: { id: carId },
      select: {
        id: true,
        brand: true,
        model: true,
        category: true,
        dailyRate: true,
        imageUrl: true,
        fuelType: true,
        transmission: true,
        year: true,
        seats: true,
        doors: true,
        description: true,
        features: true,
        isActive: true,
      },
    });

    if (!car || !car.isActive) {
      return NextResponse.json({ error: 'Fahrzeug nicht gefunden.' }, { status: 404 });
    }

    return NextResponse.json({
      id: car.id,
      brand: car.brand,
      model: car.model,
      category: car.category,
      dailyRate: car.dailyRate.toString(),
      imageUrl: car.imageUrl,
      fuelType: car.fuelType,
      transmission: car.transmission,
      year: car.year,
      seats: car.seats,
      doors: car.doors,
      description: car.description,
      features: parseFeatures(car.features),
    });
  } catch (err) {
    console.error('[cars-id]', err);
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
