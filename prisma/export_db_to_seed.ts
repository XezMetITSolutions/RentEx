import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Exporting current database state...');

    // 1. Export Options
    const options = await prisma.option.findMany();

    // 2. Export Cars (with Options connected)
    const cars = await prisma.car.findMany({
        include: {
            options: {
                select: { id: true } // Only include relationships
            }
        }
    });

    const seedContent = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database from snapshot...');

  // Clear existing data (optional, be careful in production!)
  // await prisma.car.deleteMany();
  // await prisma.option.deleteMany();

  // 1. Seed Options
  console.log('Seeding Options...');
  const options = ${JSON.stringify(options, null, 2)};

  for (const option of options) {
    await prisma.option.upsert({
      where: { id: option.id },
      update: option,
      create: option,
    });
  }

  // 2. Seed Cars
  console.log('Seeding Cars...');
  const cars = ${JSON.stringify(cars, null, 2)};

  for (const car of cars) {
    // Separate options relation for processing
    const { options: carOptionRelations, ...carData } = car;
    
    // Create/Upsert car
    await prisma.car.upsert({
      where: { id: car.id },
      update: {
        ...carData,
        options: {
          set: carOptionRelations.map((o: { id: number }) => ({ id: o.id }))
        }
      },
      create: {
        ...carData,
        options: {
          connect: carOptionRelations.map((o: { id: number }) => ({ id: o.id }))
        }
      }
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

    const outputPath = path.join(__dirname, 'seed_snapshot.ts');
    fs.writeFileSync(outputPath, seedContent);
    console.log(`Database snapshot exported to ${outputPath}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
