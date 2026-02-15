'use server';

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";

export async function createBooking(prevState: any, formData: FormData) {

    // 1. Extract Data
    const carId = parseInt(formData.get('carId') as string);
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);
    const optionIds = (formData.get('options') as string)?.split(',').filter(Boolean).map(Number) || [];
    const couponCode = (formData.get('couponCode') as string)?.trim().toUpperCase() || null;

    // Customer Data
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const postalCode = formData.get('postalCode') as string;
    const country = formData.get('country') as string || 'Deutschland';
    const customerType = formData.get('customerType') as string || 'Private';
    const companyName = formData.get('companyName') as string || null;
    const taxId = formData.get('taxId') as string || null;
    const paymentMethod = formData.get('paymentMethod') as string;

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
                country,
                customerType,
                company: companyName,
                taxId: taxId
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

    let baseTotal = Number(car.dailyRate) * days + extrasCost + insuranceCost;
    let discountAmount = 0;
    let discountReason: string | null = null;

    if (couponCode) {
        const coupon = await prisma.discountCoupon.findFirst({
            where: { code: couponCode, isActive: true }
        });
        if (coupon) {
            const now = new Date();
            const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
            const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;
            if ((!validFrom || now >= validFrom) && (!validUntil || now <= validUntil)) {
                if (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit) {
                    if (coupon.discountType === 'PERCENTAGE') {
                        discountAmount = baseTotal * (Number(coupon.discountValue) / 100);
                    } else {
                        discountAmount = Math.min(Number(coupon.discountValue), baseTotal);
                    }
                    discountReason = `Gutschein ${coupon.code}`;
                    await prisma.discountCoupon.update({
                        where: { id: coupon.id },
                        data: { usedCount: coupon.usedCount + 1 }
                    });
                }
            }
        }
    }

    const totalAmount = Math.max(0, baseTotal - discountAmount);

    const rental = await prisma.rental.create({
        data: {
            carId,
            customerId: customer.id,
            startDate,
            endDate,
            dailyRate: car.dailyRate,
            totalDays: days,
            totalAmount,
            discountAmount: discountAmount || undefined,
            discountReason: discountReason || undefined,
            status: 'Pending',
            paymentStatus: 'Pending',
            contractNumber,
            extrasCost: extrasCost,
            insuranceCost: insuranceCost,
            insuranceType: selectedInsuranceType,
            pickupLocationId: car.locationId,
            returnLocationId: car.locationId,
            paymentMethod: paymentMethod === 'online' ? 'Online' : 'arrival'
        }
    });

    // 4. Handle Stripe Payment if selected
    if (paymentMethod === 'online') {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rent-ex.vercel.app';

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card', 'sepa_debit', 'sofort', 'giropay', 'paypal', 'klarna'] as any,
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: `${car.brand} ${car.model} Miete`,
                                description: `${days} Tage Miete (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
                            },
                            unit_amount: Math.round(totalAmount * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${baseUrl}/checkout/success/${rental.id}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/checkout?carId=${carId}&startDate=${formData.get('startDate')}&endDate=${formData.get('endDate')}`,
                customer_email: email,
                metadata: {
                    rentalId: rental.id.toString(),
                },
            });

            await prisma.rental.update({
                where: { id: rental.id },
                data: { stripeSessionId: session.id }
            });

            if (session.url) {
                redirect(session.url);
            }
        } catch (error) {
            console.error("Stripe Session Error:", error);
            // Fallback to success page but maybe with a warning?
            // For now let's just proceed to success page if Stripe fails to initialize
        }
    }

    // 4. Redirect
    redirect(`/checkout/success/${rental.id}`);
}
