import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import MobileCheckoutClient from "./MobileCheckoutClient";
import { getCurrentCustomer } from "@/lib/dashboardAuth";

export default async function MobileCheckoutDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const carId = parseInt(resolvedParams.id, 10);
  if (isNaN(carId)) return notFound();

  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) return notFound();

  const customer = await getCurrentCustomer();
  const locations = await prisma.location.findMany({ orderBy: { name: 'asc' } });

  return <MobileCheckoutClient car={car} customer={customer} locations={locations} />;
}
