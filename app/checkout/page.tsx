import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import prisma from "@/lib/prisma";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getSession } from "@/lib/auth";

async function getCar(id: number) {
    const car = await prisma.car.findUnique({
        where: { id: id }
    });
    return car;
}

async function getOptions() {
    const options = await prisma.option.findMany({
        where: { status: 'active' }
    });
    return options;
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedParams = await searchParams;
    const carIdParam = resolvedParams.carId;
    const startDate = resolvedParams.startDate;
    const endDate = resolvedParams.endDate;

    if (!carIdParam || !startDate || !endDate) {
        redirect('/fleet');
    }

    const carId = parseInt(carIdParam as string);
    if (isNaN(carId)) {
        notFound();
    }

    const [car, rawOptions, customerId] = await Promise.all([
        getCar(carId),
        getOptions(),
        getSession()
    ]);

    if (!car) {
        notFound();
    }

    const currentCustomer = customerId
        ? await prisma.customer.findUnique({ where: { id: customerId } })
        : null;

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
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Buchung abschlieẞen</h1>
                    <p className="text-gray-400">Bitte geben Sie Ihre Daten ein, um die Reservierung zu beenden.</p>
                </div>

                <CheckoutForm
                    car={car}
                    options={options}
                    initialCustomer={currentCustomer ? JSON.parse(JSON.stringify(currentCustomer)) : null}
                    searchParams={{
                        startDate: startDate as string,
                        endDate: endDate as string,
                        options: (resolvedParams.options as string) || ''
                    }}
                />
            </main>

            <Footer />
        </div>
    );
}
