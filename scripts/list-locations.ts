
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.location.findMany();
  console.log('Available Locations:');
  locations.forEach(l => {
    console.log(`- [${l.id}] ${l.name}: ${l.address}, ${l.city}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
