import prisma from '@/lib/prisma';
import PricingView from '@/components/admin/PricingView';

export const dynamic = 'force-dynamic';

export default async function PricingAnalysisPage() {
    // 1. Fetch our fleet (distinct models)
    const cars = await prisma.car.findMany({
        select: {
            id: true,
            brand: true,
            model: true,
            category: true,
            dailyRate: true,
        },
        distinct: ['brand', 'model']
    });

    // 2. Fetch competitor prices
    const competitorPrices = await prisma.competitorPrice.findMany({
        orderBy: { fetchedAt: 'desc' }
    });

    // 3. Process data for the view
    const data = cars.map(car => {
        const carName = `${car.brand} ${car.model}`;
        const relevantCompetitors = competitorPrices.filter(cp =>
            cp.carModel === carName ||
            (cp.category === car.category && !cp.carModel) // Fallback to category match if exact model not found
        );

        // Get unique competitors (latest price for each company)
        const latestPrices = new Map();
        relevantCompetitors.forEach(cp => {
            if (!latestPrices.has(cp.competitorName)) {
                latestPrices.set(cp.competitorName, cp);
            }
        });

        const competitors = Array.from(latestPrices.values()).map(cp => ({
            competitor: cp.competitorName,
            dailyRate: Number(cp.dailyRate),
            weeklyRate: 0, // Calculated in frontend
            monthlyRate: 0, // Calculated in frontend
            lastUpdated: cp.fetchedAt.toISOString()
        }));

        const marketAverage = competitors.length > 0
            ? competitors.reduce((acc, curr) => acc + curr.dailyRate, 0) / competitors.length
            : 0;

        let recommendation: 'increase' | 'decrease' | 'maintain' = 'maintain';
        const ourPrice = Number(car.dailyRate);

        if (marketAverage > 0) {
            if (ourPrice < marketAverage * 0.9) recommendation = 'increase';
            else if (ourPrice > marketAverage * 1.1) recommendation = 'decrease';
        }

        return {
            id: car.id,
            brand: car.brand,
            model: car.model,
            category: car.category || 'Reise',
            ourPrice,
            marketAverage: Number(marketAverage.toFixed(2)),
            recommendation,
            competitors
        };
    });

    return <PricingView data={data} />;
}
