
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const updates = [
    { brand: 'Seat', model: 'Leon Kombi', img: '/assets/cars/Seat_Leon_Kombi.png' },
    { brand: 'Skoda', model: 'Superb Kombi', img: '/assets/cars/Skoda_Superb_Kombi.png' },
    { brand: 'Skoda', model: 'Oktavia Kombi', img: '/assets/cars/Skoda_Superb_Kombi.png' },
    { brand: 'Ford', model: 'Mustang Mach-E GT', img: '/assets/cars/Ford_Mustang_MachE_GT.png' },
    { brand: 'Ford', model: 'Transit Custom Lang', img: '/assets/cars/Ford_Transit_Custom_Lang.png' },
    { brand: 'Fiat', model: 'Ducato L3H2', img: '/assets/cars/Fiat_Ducato_L3H2.png' },
    { brand: 'Fiat', model: 'Ducato L4H2', img: '/assets/cars/Fiat_Ducato_L4H2.png' },
    { brand: 'Ford', model: 'Transit Custom L1', img: '/assets/cars/Ford_Transit_Custom_L1.png' },
    { brand: 'VW', model: 'Golf Kombi', img: '/assets/cars/VW_Golf_Kombi.png' },
  ];

  for (const up of updates) {
    const result = await prisma.car.updateMany({
      where: { brand: up.brand, model: { contains: up.model } },
      data: { imageUrl: up.img }
    });
    console.log(`Updated ${up.brand} ${up.model}: ${result.count} rows`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
