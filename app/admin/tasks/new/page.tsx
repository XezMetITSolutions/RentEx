import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import TaskForm from './TaskForm';

export const dynamic = 'force-dynamic';

export default async function NewTaskPage() {
    const cars = await prisma.car.findMany({
        where: { isActive: true },
        orderBy: [{ brand: 'asc' }, { model: 'asc' }],
        select: { id: true, brand: true, model: true, plate: true },
    });

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Neue Aufgabe</h1>
                <Link
                    href="/admin/tasks"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück
                </Link>
            </div>
            <TaskForm cars={cars} />
        </div>
    );
}
