import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import CarDetailClient from "@/components/fleet/CarDetailClient";
import { notFound, redirect, unstable_rethrow } from "next/navigation";
import prisma from "@/lib/prisma";
import { blockingRentalWhere } from "@/lib/availability";
import { Metadata } from "next";
import Link from "next/link";
import { toPublicCar } from "@/lib/publicCar";
import { getBookableOptions } from "@/lib/bookableOptions";

async function getCar(id: number) {
    return prisma.car.findUnique({
        where: { id },
        include: {
            // Only the dates are needed for the calendar; this is sent to the public client.
            rentals: {
                where: blockingRentalWhere(),
                select: { startDate: true, endDate: true }
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
    try {
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
    } catch {
        return {};
    }
}

export default async function CarDetailPage({ params }: PageProps) {
    try {
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

        // Same selection as the checkout: generic templates + this car's options.
        const options = await getBookableOptions(car.id);

        const featuresList = car.features ? car.features.split(',').map(f => f.trim()) : [];

        const serializedCar = JSON.parse(JSON.stringify(toPublicCar(car)));

        return (
            <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0A0A0A] text-foreground selection:bg-red-500/30">
                <Navbar />
                <CarDetailClient car={serializedCar} options={options} featuresList={featuresList} />
                <Footer />
            </div>
        );
    } catch (error) {
        // notFound() / redirect() work by throwing — let Next handle them
        unstable_rethrow(error);
        console.error("CarDetailPage error:", error);        return (
            <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0A0A0A] text-foreground flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-500/20">
                        <h1 className="text-2xl font-bold mb-2">Fahrzeug nicht verfügbar</h1>
                        <p className="opacity-80">Dieses Fahrzeug konnte momentan nicht geladen werden. Bitte versuchen Sie es in Kürze erneut.</p>
                    </div>
                    <Link href="/fleet" className="inline-block px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:scale-[1.02] transition-all">
                        Zurück zur Fahrzeugflotte
                    </Link>
                </div>
            </div>
        );
    }
}
