/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
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
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-hm-ink tracking-tight">Neue Aufgabe</h1>
                    <p className="text-xs text-hm-muted mt-0.5">Erstellen Sie eine neue Team-Aufgabe</p>
                </div>
                <Link
                    href="/admin/tasks"
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-hm-paper border border-hm-rule hover:bg-hm-paper-2 text-hm-ink rounded-[var(--hm-radius-input)] text-xs font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück zum Board
                </Link>
            </div>
            <TaskForm cars={cars} />
        </div>
    );
}
