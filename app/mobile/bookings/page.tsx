import MobileBookingsClient from "./MobileBookingsClient";
import prisma from "@/lib/prisma";

export default async function MobileBookingsPage() {
  // For the sake of the demo, we fetch rentals for a specific customer or just all recent ones.
  // Assuming a generic user exists or we just grab the first 10 rentals.
  const rentals = await prisma.rental.findMany({
    take: 10,
    orderBy: { startDate: 'desc' },
    include: {
      car: true,
      pickupLocation: true
    }
  });

  return <MobileBookingsClient rentals={rentals} />;
}
