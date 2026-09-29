import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { blockingRentalWhere } from "@/lib/availability";
import MobileCarDetailClient from "./MobileCarDetailClient";
import { toPublicCar } from "@/lib/publicCar";

export default async function MobileVehicleDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const carId = parseInt(resolvedParams.id, 10);
  if (isNaN(carId)) return notFound();

  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: {
      // Only the dates are needed for the calendar; this is sent to the public client.
      rentals: {
        where: blockingRentalWhere(),
        select: { startDate: true, endDate: true }
      }
    }
  });

  if (!car) return notFound();

  // Decimal and Date values must become plain JSON before reaching the client component.
  const sanitizedCar = {
    ...JSON.parse(JSON.stringify(toPublicCar(car))),
    dailyRate: Number(car.dailyRate),
    extraKmCost: car.extraKmCost ? Number(car.extraKmCost) : null,
  };

  return <MobileCarDetailClient car={sanitizedCar} />;
}
