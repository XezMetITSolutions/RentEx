import { updateCar } from '@/app/actions';
import { ArrowLeft, Car, Save, Tag, ShieldCheck, Wrench, DollarSign, Settings as SettingsIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import CarEditForm from './CarEditForm';

async function getCar(id: number) {
    const car = await prisma.car.findUnique({
        where: { id },
        include: {
            options: true
        }
    });
    return car;
}

async function getAllOptions() {
    return prisma.option.findMany({
        where: { status: 'active' },
        orderBy: { name: 'asc' }
    });
}

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const carId = parseInt(resolvedParams.id);

    if (isNaN(carId)) notFound();

    const [car, allOptions] = await Promise.all([
        getCar(carId),
        getAllOptions()
    ]);

    if (!car) notFound();

    const plainCar = JSON.parse(JSON.stringify(car));
    const plainOptions = JSON.parse(JSON.stringify(allOptions));

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fahrzeug bearbeiten</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{car.brand} {car.model} ({car.plate})</p>
                </div>
                <Link
                    href={`/admin/fleet/${car.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück
                </Link>
            </div>

            <CarEditForm car={plainCar} allOptions={plainOptions} />
        </div>
    );
}
