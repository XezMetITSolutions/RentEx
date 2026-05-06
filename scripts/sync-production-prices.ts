import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CORRECT_PRICES = [
    { brand: "Fiat", model: "Ducato L3H2", dailyRate: 119, category: "Kastenwagen" },
    { brand: "Fiat", model: "Ducato L4H2", dailyRate: 129, category: "Kastenwagen" },
    { brand: "Ford", model: "Transit Custom L1", dailyRate: 139, category: "Bus" },
    { brand: "Ford", model: "Transit Custom Lang", dailyRate: 159, category: "Bus" },
    { brand: "Skoda", model: "Superb Kombi", dailyRate: 109, category: "PKW" },
    { brand: "VW", model: "Golf Kombi", dailyRate: 95, category: "PKW" },
    { brand: "VW", model: "Polo", dailyRate: 65, category: "PKW" },
    { brand: "Hyundai", model: "Ioniq Elektro", dailyRate: 85, category: "PKW" },
    { brand: "Fiat", model: "Ducato L3H2 Plus", dailyRate: 125, category: "Kastenwagen" },
    { brand: "Ford", model: "Mustang Mach-E GT", dailyRate: 199, category: "PKW" },
    { brand: "Peugeot", model: "Traveller", dailyRate: 149, category: "Bus" },
    { brand: "Seat", model: "Leon Kombi", dailyRate: 79, category: "PKW" }
];

async function main() {
    console.log("🚀 Starting Production Price Sync...");
    
    for (const item of CORRECT_PRICES) {
        const result = await prisma.car.updateMany({
            where: {
                brand: item.brand,
                model: {
                    contains: item.model.split(' ')[0] // Flexible matching
                }
            },
            data: {
                dailyRate: item.dailyRate,
                category: item.category
            }
        });
        console.log(`✅ Updated ${item.brand} ${item.model}: ${result.count} cars updated to ${item.dailyRate} €`);
    }

    console.log("✨ Sync completed.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
