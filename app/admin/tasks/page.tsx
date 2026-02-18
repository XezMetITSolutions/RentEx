
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus } from 'lucide-react';


import TaskCard from '@/components/admin/tasks/TaskCard';

async function getTasks() {
    return await prisma.task.findMany({
        orderBy: { dueDate: 'asc' },
        include: { car: true }
    });
}

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
    const tasks = await getTasks();

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.status === 'done');

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aufgaben</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Team-Organisation & To-Dos</p>
                </div>
                <Link href="/admin/tasks/new" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    Neue Aufgabe
                </Link>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                {/* TODO Column */}
                <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                            Zu erledigen
                            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">{todoTasks.length}</span>
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600"><Plus className="h-4 w-4" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {todoTasks.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                </div>

                {/* IN PROGRESS Column */}
                <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            In Bearbeitung
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">{inProgressTasks.length}</span>
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600"><Plus className="h-4 w-4" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                </div>

                {/* DONE Column */}
                <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Erledigt
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs">{doneTasks.length}</span>
                        </h3>
                        <button className="text-gray-400 hover:text-gray-600"><Plus className="h-4 w-4" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {doneTasks.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
