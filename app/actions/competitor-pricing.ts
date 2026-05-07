'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateCompetitorPrices() {
    const cars = await prisma.car.findMany({
        select: {
            brand: true,
            model: true,
            category: true,
            dailyRate: true,
        },
        distinct: ['brand', 'model'],
    });

    const competitorNames = ['Sixt', 'Europcar', 'Hertz', 'Avis'];

    const competitorCompanies = await Promise.all(
        competitorNames.map((name) =>
            prisma.competitorCompany.upsert({
                where: { name },
                update: {},
                create: {
                    name,
                    website: `https://www.${name.toLowerCase()}.com`,
                    isActive: true,
                },
            })
        )
    );

    for (const car of cars) {
        const basePrice = Number(car.dailyRate) || 100;

        for (const company of competitorCompanies) {
            // Generate a price roughly +/- 20% of our price
            const variance = Math.random() * 0.4 - 0.2;
            const simulatedPrice = basePrice * (1 + variance);

            await prisma.competitorPrice.create({
                data: {
                    competitorId: company.id,
                    brand: car.brand,
                    model: car.model,
                    dailyRate: simulatedPrice,
                    recordedAt: new Date(),
                },
            });
        }
    }

    revalidatePath('/admin/pricing');
}
