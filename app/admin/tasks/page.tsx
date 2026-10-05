/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, ListTodo } from 'lucide-react';
import TaskBoard from '@/components/admin/tasks/TaskBoard';
import { getAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

async function getTasks(locationId?: number | null) {
    const where: any = {};
    if (locationId) {
        where.OR = [
            { car: { locationId: locationId } },
            { relatedCarId: null }
        ];
    }

    return await prisma.task.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        include: { car: true }
    });
}

export default async function TasksPage() {
    const staff = await getAdminSession();
    const isRestricted = staff && staff.role !== 'ADMINISTRATOR' && staff.role !== 'SUPERADMIN';
    
    const [tasks, cars, staffMembers] = await Promise.all([
        getTasks(isRestricted ? staff?.locationId : undefined),
        prisma.car.findMany({
            where: { isActive: true },
            orderBy: [{ brand: 'asc' }, { model: 'asc' }],
            select: { id: true, brand: true, model: true, plate: true }
        }),
        prisma.staff.findMany({
            where: { isActive: true },
            select: { id: true, name: true, role: true },
            orderBy: { name: 'asc' }
        })
    ]);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-hm-paper p-6 sm:p-7 rounded-[var(--hm-radius-card)] border border-hm-rule shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[var(--hm-radius-input)] bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <ListTodo className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-hm-ink tracking-tight">Aufgaben Board</h1>
                        <p className="text-xs sm:text-sm text-hm-muted mt-0.5">
                            Organisieren und koordinieren Sie Ihre Team-Workflows & Fahrzeuginspektionen.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link 
                        href="/admin/tasks/new" 
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--hm-radius-input)] bg-hm-accent text-white text-xs sm:text-sm font-semibold hover:bg-hm-accent-hover transition-all shadow-sm shadow-hm-accent/20"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Neue Aufgabe</span>
                    </Link>
                </div>
            </div>

            {/* Kanban / List Board */}
            <TaskBoard 
                initialTasks={tasks} 
                cars={cars} 
                staffMembers={staffMembers} 
            />
        </div>
    );
}
