import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import CarDetailClient from "@/components/fleet/CarDetailClient";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

async function getCar(id: number) {
    return prisma.car.findUnique({
        where: { id },
        include: {
            options: true,
            rentals: {
                where: {
                    status: { in: ['Active', 'Pending'] }
                }
            }
        }
    });
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

    const titleStr = `${car.brand} ${car.model} mieten | RentEx`;
    const descStr = car.description || `${car.brand} ${car.model} mieten in Vorarlberg. Bestpreisgarantie bei RentEx.`;

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

    const options = (car.options || []).map(opt => ({
        ...opt,
        price: Number(opt.price)
    }));

    const featuresList = car.features ? car.features.split(',').map(f => f.trim()) : [];

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0A0A0A] text-foreground selection:bg-red-500/30">
            <Navbar />
            <CarDetailClient car={car} options={options} featuresList={featuresList} />
            <Footer />
        </div>
    );
}
