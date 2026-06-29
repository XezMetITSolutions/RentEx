import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import MobileCheckoutClient from "./MobileCheckoutClient";
import { getCurrentCustomer } from "@/lib/dashboardAuth";

async function getOptions() {
  const options = await prisma.option.findMany({
      where: { status: 'active' }
  });
  return options;
}

export default async function MobileCheckoutDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const carId = parseInt(resolvedParams.id, 10);
  if (isNaN(carId)) return notFound();

  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) return notFound();

  const [customer, locations, rawOptions] = await Promise.all([
    getCurrentCustomer(),
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
    getOptions()
  ]);

  // De-duplicate options by name: prefer car-specific options over templates
  const processedOptionsMap = new Map();
  // 1. Templates
  rawOptions.filter(o => o.carId === null).forEach(o => processedOptionsMap.set(o.name, o));
  // 2. Car specifics
  rawOptions.filter(o => o.carId === car.id).forEach(o => processedOptionsMap.set(o.name, o));

  const options = Array.from(processedOptionsMap.values()).map(opt => ({
      ...opt,
      price: Number(opt.price)
  }));

  return <MobileCheckoutClient car={car} customer={customer} locations={locations} options={options} />;
}

