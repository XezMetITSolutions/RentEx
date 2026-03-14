
'use client';


import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Clock, ArrowRight, CheckCircle, PlayCircle, Circle, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { updateTaskStatus } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import EditTaskModal from './EditTaskModal';

export default function TaskCard({ task }: { task: any }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
            router.refresh();
        } catch (error) {
            console.error('Failed to update task status:', error);
            alert('Fehler beim Aktualisieren des Status');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div 
                onDoubleClick={() => setIsEditModalOpen(true)}
                className={`bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 hover:shadow-xl hover:scale-[1.01] transition-all group relative cursor-pointer select-none active:scale-[0.99] ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
            >
                {/* Edit Icon on Hover */}
                <div className="absolute right-4 top-13 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-400 hover:text-indigo-600">
                    <Edit2 className="w-3 h-3" />
                </div>

                {/* Menu */}
                {isMenuOpen && (
                    <div ref={menuRef} className="absolute right-2 top-10 z-20 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 text-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800 mb-1">
                            Status ändern
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange('todo'); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors"
                        >
                            <Circle className="h-4 w-4 text-slate-400" />
                            Zu erledigen
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange('in_progress'); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors"
                        >
                            <PlayCircle className="h-4 w-4 text-blue-500" />
                            In Bearbeitung
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange('done'); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors"
                        >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Erledigt
                        </button>

                        <div className="border-t border-gray-50 dark:border-gray-800 mt-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-xs font-bold text-indigo-600 transition-colors"
                            >
                                <Edit2 className="h-4 w-4" />
                                Bearbeiten
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-0.5 text-[8px] font-black rounded-full uppercase tracking-widest ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {task.priority || 'Normal'}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>

                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1.5 leading-tight">{task.title}</h4>
                <p className="text-[11px] font-medium text-gray-400 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>

                {task.car && (
                    <div className="flex items-center gap-2 text-[10px] text-indigo-600 dark:text-indigo-400 mb-4 bg-indigo-50/50 dark:bg-indigo-900/20 px-3 py-2 rounded-xl font-black uppercase tracking-tighter">
                        <span className="flex-1 truncate">{task.car.brand} {task.car.model}</span>
                        <span className="opacity-50 tracking-widest text-[9px]">{task.car.plate}</span>
                    </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-black text-gray-400 border-t border-gray-50 dark:border-gray-800 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[9px] font-black shadow-lg shadow-indigo-500/20">
                            {task.assignedTo ? task.assignedTo.substring(0, 2).toUpperCase() : '??'}
                        </div>
                        <span className="text-gray-900 dark:text-gray-200">{task.assignedTo || 'Unzugewiesen'}</span>
                    </div>
                    {task.dueDate && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 opacity-50" />
                            <span className={new Date(task.dueDate) < new Date() ? 'text-red-500' : 'uppercase tracking-widest'}>
                                {format(new Date(task.dueDate), 'dd. MMM', { locale: de })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Single Quick Action (Simplified) */}
                <div className="absolute right-4 bottom-14 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    {task.status === 'todo' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange('in_progress'); }}
                            className="bg-indigo-600 text-white p-2 rounded-xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all scale-90 group/btn"
                        >
                            <PlayCircle className="w-4 h-4" />
                        </button>
                    )}
                    {task.status === 'in_progress' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange('done'); }}
                            className="bg-green-600 text-white p-2 rounded-xl shadow-xl shadow-green-500/30 hover:bg-green-700 transition-all scale-90"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {isEditModalOpen && (
                <EditTaskModal 
                    task={task} 
                    onClose={() => setIsEditModalOpen(false)} 
                />
            )}
        </>
    );
}

