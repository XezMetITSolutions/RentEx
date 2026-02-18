
'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Clock, ArrowRight, CheckCircle, PlayCircle, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { updateTaskStatus } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export default function TaskCard({ task }: { task: any }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleStatusChange = async (newStatus: string) => {
        if (task.status === newStatus) return;

        setIsLoading(true);
        setIsMenuOpen(false);
        try {
            await updateTaskStatus(task.id, newStatus);
            // The server action calls revalidatePath, but router.refresh() ensures client cache is updated
            router.refresh();
        } catch (error) {
            console.error('Failed to update task status:', error);
            alert('Fehler beim Aktualisieren des Status');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3 hover:shadow-md transition-shadow group relative ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}>

            {/* Menu */}
            {isMenuOpen && (
                <div ref={menuRef} className="absolute right-2 top-8 z-10 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 text-sm">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700 mb-1">
                        Status ändern
                    </div>

                    {task.status !== 'todo' && (
                        <button
                            onClick={() => handleStatusChange('todo')}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                        >
                            <Circle className="h-4 w-4 text-slate-400" />
                            Zu erledigen
                        </button>
                    )}

                    {task.status !== 'in_progress' && (
                        <button
                            onClick={() => handleStatusChange('in_progress')}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                        >
                            <PlayCircle className="h-4 w-4 text-blue-500" />
                            In Bearbeitung
                        </button>
                    )}

                    {task.status !== 'done' && (
                        <button
                            onClick={() => handleStatusChange('done')}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200"
                        >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Erledigt
                        </button>
                    )}
                </div>
            )}

            <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                    {task.priority || 'Normal'}
                </span>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
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

            {/* Quick Actions (only show relevant next step) */}
            <div className="mt-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {task.status === 'todo' && (
                    <button
                        onClick={() => handleStatusChange('in_progress')}
                        className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 flex items-center gap-1"
                        title="Starten"
                    >
                        Starten <ArrowRight className="h-3 w-3" />
                    </button>
                )}
                {task.status === 'in_progress' && (
                    <button
                        onClick={() => handleStatusChange('done')}
                        className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded border border-green-100 hover:bg-green-100 flex items-center gap-1"
                        title="Erledigen"
                    >
                        Erledigen <CheckCircle className="h-3 w-3" />
                    </button>
                )}
            </div>
        </div>
    );
}
