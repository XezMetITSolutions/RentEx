import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import CarDetailClient from "@/components/fleet/CarDetailClient";

// ... keep getCar function ... 

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

// ... helper function to be removed/moved ...
