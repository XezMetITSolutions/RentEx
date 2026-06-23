import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function run() {
  const cars = await prisma.car.findMany({ select: { category: true } });
  const usedCategories = Array.from(new Set(cars.map(c => c.category).filter(Boolean)));
  console.log("Used categories:", usedCategories);
  
  await prisma.carCategory.deleteMany({
    where: {
      name: { notIn: usedCategories as string[] }
    }
  });
  console.log("Deleted unused categories.");
}
run();
