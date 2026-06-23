import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const cars = await prisma.car.findMany({ select: { category: true } });
        const usedCategories = Array.from(new Set(cars.map(c => c.category).filter(Boolean)));
        
        await prisma.carCategory.deleteMany({
            where: {
                name: { notIn: usedCategories as string[] }
            }
        });
        
        return NextResponse.json({ success: true, usedCategories });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
