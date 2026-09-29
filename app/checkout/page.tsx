import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import prisma from "@/lib/prisma";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getSession } from "@/lib/auth";
import { toClientCustomer } from "@/lib/dashboardAuth";
import { toPublicCar } from "@/lib/publicCar";
import { getBookableOptions } from "@/lib/bookableOptions";

async function getCar(id: number) {
    const car = await prisma.car.findUnique({
        where: { id: id }
    });
    return car;
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

    const [car, customerId] = await Promise.all([
        getCar(carId),
        getSession()
    ]);

    if (!car) {
        notFound();
    }

    const currentCustomer = customerId
        ? await prisma.customer.findUnique({ where: { id: customerId } })
        : null;

    const options = await getBookableOptions(car.id);

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0A0A0A] text-foreground selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Buchung abschlieẞen</h1>
                    <p className="text-gray-600 dark:text-gray-400">Bitte geben Sie Ihre Daten ein, um die Reservierung zu beenden.</p>
                </div>

                <CheckoutForm
                    car={JSON.parse(JSON.stringify(toPublicCar(car)))}
                    options={options}
                    initialCustomer={toClientCustomer(currentCustomer)}
                    searchParams={{
                        startDate: startDate as string,
                        endDate: endDate as string,
                        pickupTime: (resolvedParams.pickupTime as string) || '10:00',
                        returnTime: (resolvedParams.returnTime as string) || '10:00',
                        options: (resolvedParams.options as string) || '',
                        couponCode: (resolvedParams.couponCode as string) || ''
                    }}
                />
            </main>

            <Footer />
        </div>
    );
}
