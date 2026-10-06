import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { blockingRentalWhere, calendarBlocks } from "@/lib/availability";
import MobileCarDetailClient from "./MobileCarDetailClient";

export default async function MobileVehicleDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const carId = parseInt(resolvedParams.id, 10);
  if (isNaN(carId)) return notFound();

  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: {
      rentals: {
        where: blockingRentalWhere(),
        select: { startDate: true, endDate: true, status: true, actualReturnDate: true },
      }
    }
  });

  if (!car) return notFound();

  // Convert decimal values to standard numbers so they serialize properly to client component
  const sanitizedCar = {
    ...car,
    dailyRate: Number(car.dailyRate),
    extraKmCost: car.extraKmCost ? Number(car.extraKmCost) : null,
    rentals: calendarBlocks(car.rentals).map(rental => ({
      startDate: rental.startDate.toISOString(),
      endDate: rental.endDate.toISOString(),
    }))
  };

  return <MobileCarDetailClient car={sanitizedCar} />;
}
