import prisma from '@/lib/prisma';
import ReservationForm from './ReservationForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getData() {
    const [cars, customers, locations] = await Promise.all([
        prisma.car.findMany({
            where: { isActive: true },
            select: { id: true, brand: true, model: true, plate: true, dailyRate: true }
        }),
        prisma.customer.findMany({
            orderBy: { lastName: 'asc' },
            select: { id: true, firstName: true, lastName: true }
        }),
        prisma.location.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true }
        })
    ]);

    return {
        cars: cars.map(car => ({ ...car, dailyRate: Number(car.dailyRate) })), // Convert Decimal to number
        customers,
        locations
    };
}

export default async function NewReservationPage() {
    const { cars, customers, locations } = await getData();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Link
                    href="/admin/reservations"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Neue Reservierung</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Erstellen Sie eine neue Buchung</p>
                </div>
            </div>

            <ReservationForm cars={cars} customers={customers} locations={locations} />
        </div>
    );
}
