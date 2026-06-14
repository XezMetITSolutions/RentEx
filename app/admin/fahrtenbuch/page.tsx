import prisma from '@/lib/prisma';
import FahrtenbuchPanel from '@/components/admin/FahrtenbuchPanel';

export const dynamic = 'force-dynamic';

export default async function FahrtenbuchPage() {
    const cars = await prisma.car.findMany({
        where: { isActive: true },
        orderBy: [{ brand: 'asc' }, { model: 'asc' }],
    });

    const entries = await prisma.fahrtenbuchEntry.findMany({
        orderBy: { datum: 'desc' },
        include: {
            car: { select: { id: true, brand: true, model: true, plate: true } }
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fahrtenbuch</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Kilometerbuch für Finanzamt (Dienst- und Privatfahrten)
                </p>
            </div>

            <FahrtenbuchPanel cars={cars} initialEntries={entries as any} />
        </div>
    );
}
