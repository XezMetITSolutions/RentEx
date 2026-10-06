/* Hallmark · genre: modern-minimal · macrostructure: Workbench (form + sticky summary) · theme: custom (brand red) · design-system: tokens.css
 * pre-emit critique: P4 H5 E4 S5 R4 V4
 */
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import prisma from "@/lib/prisma";
import CheckoutForm, { type CheckoutCar, type CheckoutCustomer } from "@/components/checkout/CheckoutForm";
import { getSession } from "@/lib/auth";
import { hmFontVariables } from "@/lib/hmFonts";
import { carPhoto } from "@/lib/carPhotos";
import { bookableOptions, type PriceOption } from "@/lib/bookingPrice";

export const metadata: Metadata = {
    title: "Buchung abschließen · Rent-Ex",
    robots: { index: false, follow: false },
};

const toIsoDate = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedParams = await searchParams;
    const param = (key: string) => {
        const v = resolvedParams[key];
        return (Array.isArray(v) ? v[0] : v) ?? "";
    };

    const startDate = param("startDate");
    const endDate = param("endDate");
    if (!param("carId") || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        redirect('/fleet');
    }

    const carId = parseInt(param("carId"), 10);
    if (isNaN(carId)) notFound();

    const [car, rawOptions, customerId] = await Promise.all([
        prisma.car.findUnique({ where: { id: carId } }),
        prisma.option.findMany({ where: { status: 'active', OR: [{ carId: null }, { carId }] } }),
        getSession(),
    ]);
    if (!car || car.status !== 'Active' || !car.isActive) notFound();

    // Only what the form needs — never the password hash or internal fields.
    const customer = customerId
        ? await prisma.customer.findUnique({
            where: { id: customerId },
            select: {
                email: true, firstName: true, lastName: true, phone: true, address: true, city: true,
                postalCode: true, country: true, customerType: true, company: true, taxId: true,
                dateOfBirth: true, licenseNumber: true, licenseCountry: true, licenseExpiryDate: true,
                licensePhotoUrl: true,
            },
        })
        : null;

    const options: PriceOption[] = bookableOptions(rawOptions.map((o) => ({
        id: o.id,
        name: o.name,
        description: o.description,
        price: Number(o.price),
        type: o.type,
        isPerDay: o.isPerDay,
        maxPrice: o.maxPrice != null ? Number(o.maxPrice) : null,
        maxDays: o.maxDays,
        isMandatory: o.isMandatory,
        carId: o.carId,
    })), car.id);

    const checkoutCar: CheckoutCar = {
        id: car.id,
        brand: car.brand,
        model: car.model,
        category: car.category,
        imageUrl: carPhoto(car.brand, car.model, car.imageUrl),
        dailyRate: Number(car.dailyRate),
        maxMileagePerDay: car.maxMileagePerDay,
        depositAmount: car.depositAmount != null ? Number(car.depositAmount) : null,
        extraKmCost: car.extraKmCost != null ? Number(car.extraKmCost) : null,
        fuelPolicy: car.fuelPolicy,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
    };

    const initialCustomer: CheckoutCustomer | null = customer
        ? {
            ...customer,
            dateOfBirth: toIsoDate(customer.dateOfBirth),
            licenseExpiryDate: toIsoDate(customer.licenseExpiryDate),
        }
        : null;

    const pickTime = (v: string) => (/^\d{2}:\d{2}$/.test(v) ? v : "10:00");

    return (
        <div className={`${hmFontVariables} hm-home min-h-screen bg-hm-paper text-hm-ink font-hm-body selection:bg-hm-accent/25`}>
            <Navbar />

            <main className="pt-28 pb-24 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
                <h1 className="hm-display text-[length:var(--hm-text-display-s)] font-[800] leading-[0.92]">
                    Buchung abschließen<span className="text-hm-accent">.</span>
                </h1>
                <p className="mt-3 text-hm-ink-2">Noch wenige Angaben — die Preise rechts sind verbindlich.</p>

                <CheckoutForm
                    car={checkoutCar}
                    options={options}
                    initialCustomer={initialCustomer}
                    initial={{
                        startDate,
                        endDate,
                        pickupTime: pickTime(param("pickupTime")),
                        returnTime: pickTime(param("returnTime")),
                        optionIds: param("options").split(",").map(Number).filter(Number.isInteger),
                        couponCode: param("couponCode"),
                    }}
                />
            </main>

            <Footer />
        </div>
    );
}
