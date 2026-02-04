import { ArrowRight, Car, Calendar, CreditCard, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

// Helper function to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Helper function to format date
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeStyle: 'short' }).format(date);
};

export default async function DashboardPage() {
    // Normally we would get the userId from auth session.
    // Since we are not using a specific auth library here, we'll try to get the first customer as a placeholder
    // or handle the empty state.
    const customer = await prisma.customer.findFirst();

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Keine Kundendaten gefunden</h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">Bitte registrieren Sie sich oder legen Sie einen Kunden an.</p>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Registrieren
                </Link>
            </div>
        )
    }

    // Fetch real data for this customer
    const activeRentals = await prisma.rental.findMany({
        where: {
            customerId: customer.id,
            status: { in: ['Active', 'Pending'] } // Assuming 'Active' or 'Pending' means current
        },
        include: {
            car: true,
            pickupLocation: true,
            returnLocation: true
        },
        orderBy: { startDate: 'asc' }
    });

    const activeRental = activeRentals[0];

    const recentPayments = await prisma.payment.findMany({
        where: {
            rental: { customerId: customer.id }
        },
        take: 3,
        orderBy: { paymentDate: 'desc' }
    });

    const totalRentalsCount = await prisma.rental.count({
        where: { customerId: customer.id }
    });

    // Calculate upcoming reservation (future start date)
    const upcomingReservationCount = await prisma.rental.count({
        where: {
            customerId: customer.id,
            startDate: { gt: new Date() },
            status: { not: 'Cancelled' }
        }
    });


    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Übersicht
                </h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    Willkommen zurück, {customer.firstName}. Hier ist Ihr Mietüberblick.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Aktive Mieten", value: activeRentals.length.toString(), icon: Car, color: "text-blue-600 dark:text-blue-500" },
                    { label: "Gesamtfahrten", value: totalRentalsCount.toString(), icon: Clock, color: "text-emerald-600 dark:text-emerald-500" },
                    { label: "Meine Punkte", value: "0", icon: ShieldCheck, color: "text-amber-600 dark:text-amber-500" }, // Placeholder for loyalty points
                    { label: "Reservierungen", value: upcomingReservationCount.toString(), icon: Calendar, color: "text-purple-600 dark:text-purple-500" },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                                <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                            </div>
                            <div className={`rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3">

                {/* Active Rental Card (Main) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Aktuelle Miete</h2>
                        {activeRental && (
                            <Link href="/dashboard/rentals" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500">
                                Details ansehen
                            </Link>
                        )}
                    </div>

                    {activeRental ? (
                        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                            <div className="flex flex-col md:flex-row">
                                <div className="relative h-64 md:h-auto md:w-2/5 p-6 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
                                    <div className="relative w-full h-40">
                                        {/* If we had an image URL in the DB, we'd use it here. Using a generic one or the car's image if available */}
                                        {activeRental.car.imageUrl ? (
                                            <img
                                                src={activeRental.car.imageUrl}
                                                alt={`${activeRental.car.brand} ${activeRental.car.model}`}
                                                className="object-contain w-full h-full rounded-lg"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-zinc-400">
                                                <Car className="h-16 w-16" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-6">
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{activeRental.car.brand} {activeRental.car.model}</h3>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">{activeRental.car.plate} • {activeRental.car.color}</p>
                                            </div>
                                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                                                Aktiv
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="space-y-1">
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Abholung</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{formatDate(activeRental.startDate)}</p>
                                            <p className="text-xs text-zinc-500">{activeRental.pickupLocation?.name || 'Zentrale'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Rückgabe</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{formatDate(activeRental.endDate)}</p>
                                            <p className="text-xs text-zinc-500">{activeRental.returnLocation?.name || 'Zentrale'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        {/* Simple progress bar logic could be added based on dates */}
                                        <div className="w-full bg-zinc-100 rounded-full h-2.5 dark:bg-zinc-800 mb-2">
                                            <div className="bg-blue-600 h-2.5 rounded-full w-[50%]"></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                                            <span>Status: Läuft</span>
                                            <span>Bereit zur Rückgabe</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4 flex justify-between items-center dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="flex gap-4">
                                    <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">Verlängern</button>
                                    <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">Pannenhilfe</button>
                                </div>
                                <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500">
                                    Zum Rückgabeort <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
                            <p className="text-zinc-500 dark:text-zinc-400">Sie haben derzeit keine aktive Miete.</p>
                            <Link href="/fleet" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500">
                                Jetzt Fahrzeug mieten &rarr;
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Transactions & Actions */}
                <div className="space-y-6">

                    {/* Recent List */}
                    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Letzte Transaktionen</h3>
                        </div>
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {recentPayments.length > 0 ? recentPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                                                {payment.paymentMethod}
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {formatDate(payment.paymentDate)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold text-zinc-900 dark:text-zinc-100`}>
                                        {formatCurrency(Number(payment.amount))}
                                    </span>
                                </div>
                            )) : (
                                <div className="p-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                    Keine Transaktionen gefunden.
                                </div>
                            )}
                        </div>
                        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                            <Link href="/dashboard/payments" className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200">
                                Alle anzeigen <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Support */}
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-900 p-6 text-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                        <h3 className="text-lg font-bold">Brauchen Sie Hilfe?</h3>
                        <p className="mt-2 text-sm text-zinc-400">Unser Support-Team ist 24/7 für Sie da.</p>
                        <button className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-100 dark:bg-zinc-100 dark:hover:bg-zinc-200">
                            Live-Support starten
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
