'use server';

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createBooking(prevState: any, formData: FormData) {

    // 1. Extract Data
    const carId = parseInt(formData.get('carId') as string);
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    const optionIds = (formData.get('options') as string)?.split(',').filter(Boolean).map(Number) || [];
    const totalAmount = parseFloat(formData.get('totalAmount') as string);

    // Customer Data
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const postalCode = formData.get('postalCode') as string;

    // 2. Find or Create Customer
    // Simple check by email for now
    let customer = await prisma.customer.findUnique({
        where: { email }
    });

    if (!customer) {
        customer = await prisma.customer.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                address,
                city,
                postalCode,
                customerType: 'Private'
            }
        });
    } else {
        // Optional: Update customer details if they changed? 
        // For now let's keep it simple and just use the existing ID
    }

    // 3. Create Rental
    // Calculate days properly
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    // Fetch car just to get daily rate for record keeping 
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car) throw new Error("Car not found");

    // Generate Contract Number
    const year = new Date().getFullYear();
    const count = await prisma.rental.count();
    const contractNumber = `RNT-${year}-${(count + 1).toString().padStart(6, '0')}`;

    // Calculate Extras Cost (re-verify on server ideally, but trusting client for MVP speed)
    // In a real app, re-fetch options and sum up prices. 
    // Let's do a quick query for options to be safe
    const selectedOptions = await prisma.option.findMany({
        where: { id: { in: optionIds } }
    });

    let extrasCost = 0;
    let insuranceCost = 0;
    let selectedInsuranceType = 'Basis';

    selectedOptions.forEach(opt => {
        const cost = opt.isPerDay ? (Number(opt.price) * days) : Number(opt.price);
        if (opt.type === 'insurance') {
            insuranceCost += cost;
            selectedInsuranceType = opt.name;
        } else {
            extrasCost += cost;
        }
    });

    const rental = await prisma.rental.create({
        data: {
            carId,
            customerId: customer.id,
            startDate,
            endDate,
            dailyRate: car.dailyRate,
            totalDays: days,
            totalAmount: totalAmount,
            status: 'Pending',
            paymentStatus: 'Pending',
            paymentMethod: 'arrival', // Custom flag
            contractNumber,
            extrasCost: extrasCost,
            insuranceCost: insuranceCost,
            insuranceType: selectedInsuranceType,
            // Assuming home location for pickup/return for simple flow
            pickupLocationId: car.locationId,
            returnLocationId: car.locationId
        }
    });

    // 4. Redirect
    redirect(`/checkout/success/${rental.id}`);
}
