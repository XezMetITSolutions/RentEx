import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentCustomer, toClientCustomer } from "@/lib/dashboardAuth";
import MobilePaymentClient from "./MobilePaymentClient";
import { calculateChargeableDays } from "@/lib/bookingUtils";
import { evaluateCoupon } from "@/lib/coupons";
import { priceRental } from "@/lib/pricing";
import { toPublicCar } from "@/lib/publicCar";
import { getBookableOptions } from "@/lib/bookableOptions";

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
        getCurrentCustomer(),
    ]);

    if (!car) {
        notFound();
    }

    const options = await getBookableOptions(car.id);

    // Price the coupon the same way createBooking will.
    const pickupTime = (resolvedSearchParams.pickupTime as string) || '10:00';
    const returnTime = (resolvedSearchParams.returnTime as string) || '10:00';
    const days = calculateChargeableDays(startDate as string, pickupTime, endDate as string, returnTime);
    const selectedIds = ((resolvedSearchParams.options as string) || '').split(',').filter(Boolean).map(Number);
    const { baseTotal } = priceRental(car, options.filter(o => selectedIds.includes(o.id)), days);
    const coupon = await evaluateCoupon(resolvedSearchParams.couponCode as string, baseTotal);

    return (
        <MobilePaymentClient 
            car={JSON.parse(JSON.stringify(toPublicCar(car)))} 
            customer={toClientCustomer(customer)} 
            options={options}
            appliedCoupon={coupon ? { code: coupon.code, discountAmount: coupon.discountAmount } : null}
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

