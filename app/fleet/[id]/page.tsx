import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import CarDetailClient from "@/components/fleet/CarDetailClient";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const carId = parseInt(resolvedParams.id);
    
    if (isNaN(carId)) {
        return { title: "Fahrzeug nicht gefunden" };
    }

    const car = await getCar(carId);

    if (!car) {
        return { title: "Fahrzeug nicht gefunden" };
    }

    const priceFormatted = new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(car.dailyRate));

    return {
        title: `${car.brand} ${car.model} mieten`,
        description: `${car.brand} ${car.model} (${car.category}) mieten in Feldkirch. Erstklassiger Komfort, Top-Preise ab ${priceFormatted}/Tag und flexibler Service. Jetzt online reservieren!`,
        openGraph: {
            title: `${car.brand} ${car.model} mieten | RentEx`,
            description: `${car.brand} ${car.model} (${car.category}) mieten in Feldkirch. Erstklassiger Komfort, Top-Preise ab ${priceFormatted}/Tag und flexibler Service. Jetzt online reservieren!`,
            images: car.imageUrl ? [{ url: car.imageUrl }] : [],
        },
    };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const carId = parseInt(resolvedParams.id);

    if (isNaN(carId)) {
        notFound();
    }

    const car = await getCar(carId);

    if (!car) {
        notFound();
    }

    const options = (car.options || []).map(opt => ({
        ...opt,
        price: Number(opt.price)
    }));

    // Parse features from CSV string
    const featuresList = car.features ? car.features.split(',').map(f => f.trim()) : [];

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />
            <CarDetailClient car={car} options={options} featuresList={featuresList} />
            <Footer />
        </div>
    );
}
