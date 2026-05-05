import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.car.update({ where: { id: 6 }, data: { imageUrl: '/assets/cars/VW_Golf_Kombi.png' } });
  await prisma.car.update({ where: { id: 7 }, data: { imageUrl: '/assets/cars/VWPolo.png' } });
  await prisma.car.update({ where: { id: 8 }, data: { imageUrl: '/assets/cars/hyundai_ioniq.jpg' } });
  await prisma.car.update({ where: { id: 10 }, data: { imageUrl: '/assets/cars/Ford_Mustang_MachE_GT.png' } });
  await prisma.car.update({ where: { id: 12 }, data: { imageUrl: '/assets/cars/Seat_Leon_Kombi.png' } });
  console.log('All images updated directly by ID.');
}

main().finally(() => prisma.$disconnect());
