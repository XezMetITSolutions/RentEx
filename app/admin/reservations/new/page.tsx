import prisma from '@/lib/prisma';
import ReservationForm from './ReservationForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

async function getData() {
    const [cars, customers, locations, options] = await Promise.all([
        prisma.car.findMany({
            where: { isActive: true },
            select: { 
                id: true, 
                brand: true, 
                model: true, 
                plate: true, 
                dailyRate: true,
                rentals: {
                    where: { 
                        status: { not: 'Cancelled' },
                        endDate: { gte: new Date() }
                    },
                    select: { startDate: true, endDate: true }
                }
            }
        }),
        prisma.customer.findMany({
            orderBy: { lastName: 'asc' },
            select: { 
                id: true, 
                firstName: true, 
                lastName: true, 
                country: true,
                licenseNumber: true,
                licenseExpiryDate: true,
                licensePhotoUrl: true,
                _count: {
                    select: { rentals: true }
                }
            }
        }),
        prisma.location.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true }
        }),
        prisma.option.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    return {
        cars: cars.map(car => ({ ...car, dailyRate: Number(car.dailyRate) })), // Convert Decimal to number
        customers: customers.map(c => ({
            ...c,
            rentalsCount: c._count.rentals
        })),
        locations,
        options: options.map(opt => ({ ...opt, price: Number(opt.price) }))
    };
}

export default async function NewReservationPage() {
    const { cars, customers, locations, options } = await getData();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Link
                    href="/admin/reservations"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-550"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Neue Reservierung</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Erstellen Sie eine neue Buchung</p>
                </div>
            </div>

            <Suspense fallback={
                <div className="h-64 flex items-center justify-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-150">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-gray-500">Lade Buchungsformular...</p>
                    </div>
                </div>
            }>
                <ReservationForm cars={cars} customers={customers} locations={locations} options={options} />
            </Suspense>
        </div>
    );
}
