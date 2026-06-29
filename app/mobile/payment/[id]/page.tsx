import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/dashboardAuth";
import MobilePaymentClient from "./MobilePaymentClient";

async function getCar(id: number) {
    return await prisma.car.findUnique({
        where: { id: id }
    });
}

async function getOptions() {
    const options = await prisma.option.findMany({
        where: { status: 'active' }
    });
    return options;
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

    const [car, customer, rawOptions] = await Promise.all([
        getCar(carId),
        getCurrentCustomer(),
        getOptions()
    ]);

    if (!car) {
        notFound();
    }

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

    return (
        <MobilePaymentClient 
            car={car} 
            customer={customer} 
            options={options}
            searchParams={{
                startDate: startDate as string,
                endDate: endDate as string,
                pickupTime: (resolvedSearchParams.pickupTime as string) || '10:00',
                returnTime: (resolvedSearchParams.returnTime as string) || '10:00',
                options: (resolvedSearchParams.options as string) || '',
                couponCode: (resolvedSearchParams.couponCode as string) || ''
            }} 
        />
    );
}

