import MobileFleetClient from "./MobileFleetClient";
import { getCarCategories } from "@/app/actions";
import prisma from "@/lib/prisma";
import { BOOKABLE_CAR_STATUSES, toPublicCar } from "@/lib/publicCar";

export default async function MobileFleetPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const categories = await getCarCategories();
  const cars = await prisma.car.findMany({
    where: { isActive: true, status: { in: BOOKABLE_CAR_STATUSES } },
    orderBy: { dailyRate: 'asc' },
  });

  return <MobileFleetClient initialCars={JSON.parse(JSON.stringify(cars.map(toPublicCar)))} categories={categories} initialSearch={resolvedParams.q || ""} />;
}
