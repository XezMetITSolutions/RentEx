
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const bookingId = 4;
  const locationId = 1;

  // 1. Get the booking and its carId
  const rental = await prisma.rental.findUnique({
    where: { id: bookingId },
    select: { carId: true }
  });

  if (!rental) {
    console.error(`Booking #${bookingId} not found`);
    process.exit(1);
  }

  const carId = rental.carId;

  // 2. Update the booking's pickupLocation
  await prisma.rental.update({
    where: { id: bookingId },
    data: { pickupLocationId: locationId }
  });
  console.log(`Updated Booking #${bookingId}: assigned to Location #${locationId}`);

  // 3. Update the car's currentLocation and homeLocation
  await prisma.car.update({
    where: { id: carId },
    data: { 
      locationId: locationId,
      homeLocationId: locationId 
    }
  });
  console.log(`Updated Car #${carId}: assigned to Location #${locationId}`);

  console.log('Sync complete!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
