import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import MobileCheckoutClient from "./MobileCheckoutClient";
import { getCurrentCustomer, toClientCustomer } from "@/lib/dashboardAuth";
import { toPublicCar } from "@/lib/publicCar";
import { getBookableOptions } from "@/lib/bookableOptions";


export default async function MobileCheckoutDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const carId = parseInt(resolvedParams.id, 10);
  if (isNaN(carId)) return notFound();

  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) return notFound();

  const [customer, locations, options] = await Promise.all([
    getCurrentCustomer(),
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
    getBookableOptions(car.id)
  ]);


  return <MobileCheckoutClient car={JSON.parse(JSON.stringify(toPublicCar(car)))} customer={toClientCustomer(customer)} locations={JSON.parse(JSON.stringify(locations))} options={options} />;
}

