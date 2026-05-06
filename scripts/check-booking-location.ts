
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const id = Number(process.argv[2]);
  if (!id) {
    console.error('Please provide a booking ID');
    process.exit(1);
  }

  const rental = await prisma.rental.findUnique({
    where: { id },
    include: {
      pickupLocation: true,
      car: true
    }
  });

  if (!rental) {
    console.log('Booking not found');
  } else {
    console.log('Booking Details:');
    console.log(`ID: ${rental.id}`);
    console.log(`Car: ${rental.car?.brand} ${rental.car?.model} (${rental.car?.plate})`);
    console.log(`Pickup Location: ${rental.pickupLocation?.name || 'NONE'}`);
    console.log(`Address: ${rental.pickupLocation?.address || 'NONE'}`);
    console.log(`City: ${rental.pickupLocation?.city || 'NONE'}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
