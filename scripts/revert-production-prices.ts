import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REVERT_PRICES = [
    { brand: "Fiat", category: "Kastenwagen", dailyRate: 59 },
    { brand: "VW", model: "Golf Kombi", dailyRate: 32.5, category: "PKW" },
    { brand: "Ford", model: "Mustang Mach-E GT", dailyRate: 54, category: "PKW" },
    { brand: "Ford", model: "Transit Custom L1", dailyRate: 74, category: "Bus" },
    { brand: "Ford", model: "Transit Custom Lang", dailyRate: 84, category: "Bus" },
    { brand: "Peugeot", model: "Traveller", dailyRate: 75, category: "Bus" },
    { brand: "VW", model: "Polo", dailyRate: 29, category: "PKW" },
    { brand: "Skoda", model: "Superb Kombi", dailyRate: 45, category: "PKW" },
    { brand: "Hyundai", model: "Ioniq Elektro", dailyRate: 49, category: "PKW" },
    { brand: "Seat", model: "Leon Kombi", dailyRate: 35, category: "PKW" }
];

async function main() {
    console.log("🚀 Reverting Production Prices to Lower Values...");
    
    // Default fallback prices by category
    const categoryDefaults: Record<string, number> = {
        "Kastenwagen": 59,
        "Bus": 75,
        "PKW": 32.5
    };

    // 1. First, apply category defaults
    for (const [cat, price] of Object.entries(categoryDefaults)) {
        const res = await prisma.car.updateMany({
            where: { category: cat },
            data: { dailyRate: price }
        });
        console.log(`📡 Set all ${cat} to ${price} € (${res.count} cars)`);
    }

    // 2. Apply specific brand/model overrides
    for (const item of REVERT_PRICES) {
        const res = await prisma.car.updateMany({
            where: {
                brand: item.brand,
                model: { contains: item.model ? item.model.split(' ')[0] : '' }
            },
            data: { dailyRate: item.dailyRate }
        });
        if (res.count > 0) {
            console.log(`✅ Refined ${item.brand} ${item.model || ''}: ${res.count} cars to ${item.dailyRate} €`);
        }
    }

    console.log("✨ Revert completed.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
