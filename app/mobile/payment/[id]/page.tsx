import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/dashboardAuth";
import MobilePaymentClient from "./MobilePaymentClient";

async function getCar(id: number) {
    return await prisma.car.findUnique({
        where: { id: id }
    });
}

export default async function MobilePaymentPage({ params, searchParams }: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    
    const carIdParam = resolvedParams.id;
    const startDate = resolvedSearchParams.startDate;
    const endDate = resolvedSearchParams.endDate;

    if (!carIdParam || !startDate || !endDate) {
        redirect('/mobile');
    }

    const carId = parseInt(carIdParam as string);
    if (isNaN(carId)) {
        notFound();
    }

    const [car, customer] = await Promise.all([
        getCar(carId),
        getCurrentCustomer()
    ]);

    if (!car) {
        notFound();
    }

    return (
        <MobilePaymentClient 
            car={car} 
            customer={customer} 
            searchParams={{
                startDate: startDate as string,
                endDate: endDate as string
            }} 
        />
    );
}
