
import prisma from '@/lib/prisma';
import { Plus, MoreHorizontal, Calendar, CheckSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

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

    const TaskCard = ({ task }: { task: any }) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3 cursor-move hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                    }`}>
                    {task.priority || 'Normal'}
                </span>
                <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{task.title}</h4>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>

            {task.car && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-900 p-1.5 rounded">
                    <span className="font-medium">{task.car.brand} {task.car.model}</span>
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                <div className="flex items-center gap-1">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[9px] font-bold">
                        {task.assignedTo ? task.assignedTo.substring(0, 2).toUpperCase() : '??'}
                    </div>
                </div>
                {task.dueDate && (
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className={new Date(task.dueDate) < new Date() ? 'text-red-500 font-bold' : ''}>
                            {format(new Date(task.dueDate), 'dd. MMM', { locale: de })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aufgaben</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Team-Organisation & To-Dos</p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    Neue Aufgabe
                </button>
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
