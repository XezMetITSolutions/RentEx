
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Plus, ListTodo } from 'lucide-react';
import TaskBoard from '@/components/admin/tasks/TaskBoard';

async function getTasks() {
    return await prisma.task.findMany({
        orderBy: { dueDate: 'asc' },
        include: { car: true }
    });
}

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
    const tasks = await getTasks();

    return (
        <div className="h-[calc(100vh-80px)] p-4 md:p-8 max-w-7xl mx-auto flex flex-col space-y-8">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 dark:border-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                        <ListTodo className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Aufgaben Board</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Organisieren Sie Ihre Team-Workflows</p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <Link 
                        href="/admin/tasks/new" 
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
                    >
                        <Plus className="h-4 w-4" />
                        Neue Aufgabe
                    </Link>
                </div>
            </div>

            {/* Kanban Board */}
            <TaskBoard initialTasks={tasks} />
        </div>
    );
}
