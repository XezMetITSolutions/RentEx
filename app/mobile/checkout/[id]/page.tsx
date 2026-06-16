import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import MobileCheckoutClient from "./MobileCheckoutClient";

export default async function MobileCheckoutDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const carId = parseInt(resolvedParams.id, 10);
  if (isNaN(carId)) return notFound();

  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) return notFound();

  return <MobileCheckoutClient car={car} />;
}
