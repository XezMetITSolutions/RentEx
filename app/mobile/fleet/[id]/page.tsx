import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import MobileCarDetailClient from "./MobileCarDetailClient";

export default async function MobileVehicleDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const carId = parseInt(resolvedParams.id, 10);
  if (isNaN(carId)) return notFound();

  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: {
      rentals: {
        where: {
          status: { in: ['Active', 'Pending'] }
        }
      }
    }
  });

  if (!car) return notFound();

  // Convert decimal values to standard numbers so they serialize properly to client component
  const sanitizedCar = {
    ...car,
    dailyRate: Number(car.dailyRate),
    extraKmCost: car.extraKmCost ? Number(car.extraKmCost) : null,
    rentals: car.rentals.map(rental => ({
      ...rental,
      totalAmount: Number(rental.totalAmount),
      dailyRate: Number(rental.dailyRate),
      extrasCost: Number(rental.extrasCost),
      insuranceCost: Number(rental.insuranceCost),
      discountAmount: rental.discountAmount ? Number(rental.discountAmount) : null,
      startDate: rental.startDate.toISOString(), // safe string serialization
      endDate: rental.endDate.toISOString(),
      createdAt: rental.createdAt.toISOString(),
      updatedAt: rental.updatedAt.toISOString(),
    }))
  };

  return <MobileCarDetailClient car={sanitizedCar} />;
}
