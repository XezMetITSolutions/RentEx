import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import CarDetailClient from "@/components/fleet/CarDetailClient";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { blockingRentalWhere, calendarBlocks } from "@/lib/availability";
import { bookableOptions } from "@/lib/bookingPrice";

async function getCar(id: number) {
    const car = await prisma.car.findUnique({
        where: { id },
        include: {
            options: true,
            rentals: {
                where: blockingRentalWhere(),
                select: { startDate: true, endDate: true, status: true, actualReturnDate: true },
            }
        }
    });

    if (!car) return null;

    // Find siblings of the same model and brand
    const siblings = await prisma.car.findMany({
        where: {
            id: { not: car.id },
            brand: car.brand,
            model: car.model,
            status: { in: ['Active', 'Rented'] },
            isActive: true,
        },
        select: {
            id: true,
            rentals: {
                where: blockingRentalWhere(),
                select: { startDate: true, endDate: true, status: true, actualReturnDate: true },
            }
        }
    });

    // If there are siblings, a date is only blocked if ALL cars of this model are blocked!
    // If no siblings exist, only this car's rentals block the calendar.
    let effectiveRentals = car.rentals;

    if (siblings.length > 0) {
        // Find overlapping rental intervals that cover all siblings simultaneously
        // Simple and robust: if any sibling is free, effectiveRentals only contains true universal blocks
        const allCarRentals = [car.rentals, ...siblings.map(s => s.rentals)];
        // If not all cars are booked, the pool still has availability
        // Only intervals that intersect across ALL sibling cars remain blocked
        effectiveRentals = car.rentals.filter(r1 => {
            return siblings.every(s => 
                s.rentals.some(r2 => 
                    new Date(r2.startDate) <= new Date(r1.endDate) && new Date(r2.endDate) >= new Date(r1.startDate)
                )
            );
        });
    }

    return {
        ...car,
        rentals: effectiveRentals
    };
}

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-');         // Replace multiple - with single -
}

interface PageProps {
    params: Promise<{ id: string; slug?: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const carId = parseInt(resolvedParams.id);
    if (isNaN(carId)) return {};
    
    const car = await getCar(carId);
    if (!car) return {};

    const titleStr = `${car.brand} ${car.model} mieten | Rent-Ex`;
    const descStr = car.description || `${car.brand} ${car.model} mieten in Vorarlberg bei Rent-Ex in Feldkirch.`;

    return {
        title: titleStr,
        description: descStr,
        openGraph: {
            title: titleStr,
            description: descStr,
            images: car.imageUrl ? [{ url: car.imageUrl }] : [],
        }
    };
}

export default async function CarDetailPage({ params }: PageProps) {
    const resolvedParams = await params;
    const carId = parseInt(resolvedParams.id);

    if (isNaN(carId)) {
        notFound();
    }

    const car = await getCar(carId);

    if (!car) {
        notFound();
    }

    // Generate expected slug
    const expectedSlug = slugify(`${car.brand}-${car.model}`);
    const currentSlug = resolvedParams.slug?.[0];

    // SEO Redirect: If no slug or mismatch slug, 301 redirect to correct slug URL
    if (currentSlug !== expectedSlug) {
        redirect(`/fleet/${carId}/${expectedSlug}`);
    }

    const rawOptions = await prisma.option.findMany({
        where: { status: 'active', OR: [{ carId: null }, { carId }] },
    });
    const options = bookableOptions(rawOptions.map((opt) => ({
        id: opt.id,
        name: opt.name,
        description: opt.description,
        price: Number(opt.price),
        type: opt.type,
        isPerDay: opt.isPerDay,
        maxPrice: opt.maxPrice != null ? Number(opt.maxPrice) : null,
        maxDays: opt.maxDays,
        isMandatory: opt.isMandatory,
        carId: opt.carId,
    })), car.id);

    const featuresList = car.features ? car.features.split(',').map(f => f.trim()) : [];

    const serializedCar = JSON.parse(JSON.stringify({
        ...car,
        rentals: calendarBlocks(car.rentals),
    }));

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0A0A0A] text-foreground selection:bg-red-500/30">
            <Navbar />
            <CarDetailClient car={serializedCar} options={options} featuresList={featuresList} />
            <Footer />
        </div>
    );
}
