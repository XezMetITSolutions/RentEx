/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
    MoreHorizontal,
    Clock,
    CheckCircle,
    PlayCircle,
    Circle,
    Edit2,
    Trash2,
    Car,
    AlertCircle,
    ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { updateTaskStatus, deleteTask } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import EditTaskModal from './EditTaskModal';
import { clsx } from 'clsx';

interface TaskCardProps {
    task: any;
    onTaskDeleted?: (taskId: number) => void;
    onTaskUpdated?: (updatedTask: any) => void;
}

export default function TaskCard({ task, onTaskDeleted, onTaskUpdated }: TaskCardProps) {
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
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleStatusChange = async (newStatus: string) => {
        if (task.status === newStatus) return;

        setIsLoading(true);
        setIsMenuOpen(false);
        try {
            const res = await updateTaskStatus(task.id, newStatus);
            if (res && 'error' in res && res.error) {
                throw new Error(res.error);
            }
            if (onTaskUpdated) {
                onTaskUpdated({ ...task, status: newStatus });
            }
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Fehler beim Aktualisieren des Status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Möchten Sie die Aufgabe "${task.title}" wirklich löschen?`)) {
            return;
        }

        setIsLoading(true);
        setIsMenuOpen(false);
        try {
            const res = await deleteTask(task.id);
            if (res && 'error' in res && res.error) {
                throw new Error(res.error);
            }
            toast.success('Aufgabe gelöscht');
            if (onTaskDeleted) {
                onTaskDeleted(task.id);
            }
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Fehler beim Löschen der Aufgabe');
        } finally {
            setIsLoading(false);
        }
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
            case 'high':
                return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
            case 'low':
                return 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20';
            default:
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'Dringend 🚨';
            case 'high': return 'Hoch';
            case 'low': return 'Gering';
            default: return 'Mittel';
        }
    };

    return (
        <>
            <div 
                onClick={() => setIsEditModalOpen(true)}
                className={clsx(
                    "bg-hm-paper p-4 sm:p-5 rounded-[var(--hm-radius-card)] shadow-xs border border-hm-rule mb-3 hover:shadow-md hover:border-hm-muted transition-all group relative cursor-pointer select-none active:scale-[0.99]",
                    isLoading && "opacity-60 pointer-events-none"
                )}
            >
                {/* Header: Priority & Quick Actions */}
                <div className="flex justify-between items-center mb-2.5">
                    <span className={clsx(
                        "px-2.5 py-0.5 text-[10px] font-semibold rounded-full border uppercase tracking-wider",
                        getPriorityBadge(task.priority)
                    )}>
                        {getPriorityLabel(task.priority)}
                    </span>

                    <div className="flex items-center gap-1">
                        {/* Hover Quick Edit Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditModalOpen(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2"
                            title="Bearbeiten"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* 3-dots Context Menu */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(!isMenuOpen);
                            }}
                            className="text-hm-muted hover:text-hm-ink transition-colors p-1.5 rounded-md hover:bg-hm-paper-2"
                            title="Optionen"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div 
                        ref={menuRef} 
                        className="absolute right-2 top-10 z-30 w-48 bg-hm-paper rounded-[var(--hm-radius-input)] shadow-xl border border-hm-rule py-1.5 text-xs overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-3 py-1.5 text-[10px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule mb-1">
                            Status ändern
                        </div>

                        <button
                            onClick={() => handleStatusChange('todo')}
                            className="w-full text-left px-3 py-1.5 hover:bg-hm-paper-2 flex items-center gap-2.5 text-xs font-medium text-hm-ink transition-colors"
                        >
                            <Circle className="h-3.5 w-3.5 text-slate-400" />
                            <span>Zu erledigen</span>
                        </button>

                        <button
                            onClick={() => handleStatusChange('in_progress')}
                            className="w-full text-left px-3 py-1.5 hover:bg-hm-paper-2 flex items-center gap-2.5 text-xs font-medium text-hm-ink transition-colors"
                        >
                            <PlayCircle className="h-3.5 w-3.5 text-blue-500" />
                            <span>In Bearbeitung</span>
                        </button>

                        <button
                            onClick={() => handleStatusChange('done')}
                            className="w-full text-left px-3 py-1.5 hover:bg-hm-paper-2 flex items-center gap-2.5 text-xs font-medium text-hm-ink transition-colors"
                        >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Erledigt</span>
                        </button>

                        <div className="border-t border-hm-rule mt-1 pt-1">
                            <button
                                onClick={() => {
                                    setIsEditModalOpen(true);
                                    setIsMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 hover:bg-hm-paper-2 flex items-center gap-2.5 text-xs font-medium text-hm-ink transition-colors"
                            >
                                <Edit2 className="h-3.5 w-3.5 text-hm-muted" />
                                <span>Bearbeiten</span>
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full text-left px-3 py-1.5 hover:bg-red-500/10 flex items-center gap-2.5 text-xs font-medium text-red-600 transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                <span>Aufgabe löschen</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Title & Description */}
                <h4 className="font-bold text-hm-ink text-sm mb-1 leading-snug">{task.title}</h4>
                {task.description && (
                    <p className="text-xs text-hm-muted line-clamp-2 mb-3 leading-relaxed">
                        {task.description}
                    </p>
                )}

                {/* Car Badge (Clickable) */}
                {task.car && (
                    <Link
                        href={`/admin/fleet/${task.car.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 text-xs text-hm-ink hover:text-hm-accent bg-hm-paper-2 px-2.5 py-1.5 rounded-[var(--hm-radius-input)] border border-hm-rule mb-3 transition-colors group/car"
                        title="Fahrzeugdetails aufrufen"
                    >
                        <Car className="w-3.5 h-3.5 text-hm-muted group-hover/car:text-hm-accent" />
                        <span className="flex-1 truncate font-medium">{task.car.brand} {task.car.model}</span>
                        <span className="font-mono text-[10px] text-hm-muted tracking-wider">{task.car.plate}</span>
                        <ArrowUpRight className="w-3 h-3 text-hm-muted opacity-0 group-hover/car:opacity-100 transition-opacity" />
                    </Link>
                )}

                {/* Footer: Assignee & Due Date */}
                <div className="flex items-center justify-between text-xs border-t border-hm-rule pt-3 mt-1">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-hm-paper-2 border border-hm-rule flex items-center justify-center text-hm-ink text-[10px] font-bold">
                            {task.assignedTo ? task.assignedTo.substring(0, 2).toUpperCase() : '?'}
                        </div>
                        <span className="text-hm-ink font-medium text-[11px] truncate max-w-[120px]">
                            {task.assignedTo || 'Unzugewiesen'}
                        </span>
                    </div>

                    {task.dueDate && (
                        <div className={clsx(
                            "flex items-center gap-1.5 text-[11px] font-medium font-mono",
                            isOverdue
                                ? "text-red-600 dark:text-red-400 font-bold"
                                : "text-hm-muted"
                        )}>
                            {isOverdue && <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />}
                            <Clock className="w-3 h-3 opacity-60" />
                            <span>
                                {format(new Date(task.dueDate), 'dd. MMM', { locale: de })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Single Quick Status Advance Icon on Card */}
                <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                    {task.status === 'todo' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange('in_progress');
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg shadow-sm transition-all"
                            title="In Bearbeitung verschieben"
                        >
                            <PlayCircle className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {task.status === 'in_progress' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange('done');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg shadow-sm transition-all"
                            title="Als erledigt markieren"
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {isEditModalOpen && (
                <EditTaskModal 
                    task={task} 
                    onClose={() => setIsEditModalOpen(false)}
                    onTaskDeleted={onTaskDeleted}
                    onTaskUpdated={onTaskUpdated}
                />
            )}
        </>
    );
}
