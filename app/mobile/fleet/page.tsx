import MobileFleetClient from "./MobileFleetClient";
import { getCarCategories } from "@/app/actions";
import prisma from "@/lib/prisma";

export default async function MobileFleetPage() {
  const categories = await getCarCategories();
  const cars = await prisma.car.findMany({
    where: { isActive: true, status: 'Active' },
    orderBy: { dailyRate: 'asc' },
  });

  return <MobileFleetClient initialCars={cars} categories={categories} />;
}
