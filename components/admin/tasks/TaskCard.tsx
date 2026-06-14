'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Clock, CheckCircle, PlayCircle, Circle, Edit2, User, Car } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { updateTaskStatus } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import EditTaskModal from './EditTaskModal';

const getPriorityStyles = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case 'urgent':
            return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
        case 'high':
            return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
        case 'medium':
            return 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30';
        case 'low':
        default:
            return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700/50';
    }
};

const getPriorityLabel = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case 'urgent': return 'Dringend';
        case 'high': return 'Hoch';
        case 'medium': return 'Mittel';
        case 'low': return 'Gering';
        default: return 'Mittel';
    }
};

const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
    const colors = [
        'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30',
        'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-indigo-900/30',
        'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/40 dark:text-violet-400 dark:border-indigo-900/30',
        'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-indigo-900/30',
        'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-indigo-900/30',
        'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-indigo-900/30'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

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
            toast.error('Fehler beim Aktualisieren des Status');
        } finally {
            setIsLoading(false);
        }
    };

    const isOverdue = task.dueDate && 
        new Date(task.dueDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && 
        task.status !== 'done';

    return (
        <>
            <div 
                onDoubleClick={() => setIsEditModalOpen(true)}
                className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/80 mb-4 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:scale-[1.01] hover:border-gray-200 dark:hover:border-gray-700/80 transition-all group relative cursor-pointer select-none active:scale-[0.99] ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
            >
                {/* Edit Icon on Hover */}
                <div className="absolute right-4 top-13 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-400 hover:text-indigo-650 dark:hover:text-indigo-400">
                    <Edit2 className="w-3.5 h-3.5" />
                </div>

                {/* Menu */}
                {isMenuOpen && (
                    <div ref={menuRef} className="absolute right-2 top-10 z-20 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-105/80 dark:border-gray-800/80 py-2 text-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800/80 mb-1">
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
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 text-xs font-bold text-indigo-650 dark:text-indigo-400 transition-colors"
                            >
                                <Edit2 className="h-4 w-4" />
                                Bearbeiten
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-start mb-3.5">
                    <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-lg border uppercase tracking-wider ${getPriorityStyles(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                </div>

                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1.5 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</h4>
                <p className="text-[11.5px] font-medium text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">{task.description}</p>

                {task.car && (
                    <div className="flex items-center gap-2 text-[10px] text-indigo-600 dark:text-indigo-400 mb-4 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/30 dark:border-indigo-900/30 px-3 py-2 rounded-xl font-bold tracking-tight">
                        <Car className="w-3.5 h-3.5 opacity-80 shrink-0" />
                        <span className="flex-1 truncate">{task.car.brand} {task.car.model}</span>
                        <span className="opacity-60 text-[9px] font-mono shrink-0 bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/30">{task.car.plate}</span>
                    </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-gray-800/80 pt-4 mt-1">
                    <div className="flex items-center gap-2">
                        {task.assignedTo ? (
                            <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${getAvatarColor(task.assignedTo)}`}>
                                {getInitials(task.assignedTo)}
                            </div>
                        ) : (
                            <div className="h-6.5 w-6.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400">
                                <User className="h-3 w-3" />
                            </div>
                        )}
                        <span className="text-gray-700 dark:text-gray-300 font-semibold">{task.assignedTo || 'Unzugewiesen'}</span>
                    </div>
                    {task.dueDate && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] uppercase tracking-wider font-extrabold ${
                            isOverdue 
                                ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30' 
                                : 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700/50'
                        }`}>
                            <Clock className={`h-3 w-3 ${isOverdue ? 'animate-pulse text-rose-500' : 'opacity-60'}`} />
                            <span>
                                {format(new Date(task.dueDate), 'dd. MMM', { locale: de })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Single Quick Action */}
                <div className="absolute right-4 bottom-14 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-10">
                    {task.status === 'todo' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange('in_progress'); }}
                            className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all scale-95"
                        >
                            <PlayCircle className="w-4 h-4" />
                        </button>
                    )}
                    {task.status === 'in_progress' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleStatusChange('done'); }}
                            className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all scale-95"
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
