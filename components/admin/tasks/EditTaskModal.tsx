/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
'use client';

import React, { useState } from 'react';
import { X, Save, Trash2, Calendar, User, Loader2, AlertTriangle } from 'lucide-react';
import { updateTask, deleteTask } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface EditTaskModalProps {
    task: any;
    onClose: () => void;
    onTaskDeleted?: (taskId: number) => void;
    onTaskUpdated?: (updatedTask: any) => void;
}

export default function EditTaskModal({
    task,
    onClose,
    onTaskDeleted,
    onTaskUpdated
}: EditTaskModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            priority: formData.get('priority') as string,
            status: formData.get('status') as string,
            dueDate: (formData.get('dueDate') as string) || null,
            assignedTo: (formData.get('assignedTo') as string) || null,
        };

        try {
            const res = await updateTask(task.id, data);
            if (res && 'error' in res && res.error) {
                throw new Error(res.error);
            }
            toast.success('Aufgabe erfolgreich aktualisiert');
            if (onTaskUpdated) {
                onTaskUpdated({ ...task, ...data });
            }
            router.refresh();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Fehler beim Aktualisieren der Aufgabe');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Möchten Sie die Aufgabe "${task.title}" wirklich unwiderruflich löschen?`)) {
            return;
        }

        setIsDeleting(true);
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
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Fehler beim Löschen der Aufgabe');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-card)] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-hm-rule">
                    <div>
                        <h2 className="text-lg font-bold text-hm-ink">Aufgabe bearbeiten</h2>
                        <p className="text-xs text-hm-muted mt-0.5">Details und Status anpassen</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-[var(--hm-radius-input)] text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 transition-colors cursor-pointer"
                        title="Schließen"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-hm-ink">Titel *</label>
                        <input 
                            name="title"
                            type="text" 
                            required
                            defaultValue={task.title}
                            className="w-full px-3.5 py-2.5 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-sm font-medium text-hm-ink focus:outline-none focus:border-hm-accent focus:ring-1 focus:ring-hm-accent transition-all" 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-hm-ink">Beschreibung</label>
                        <textarea 
                            name="description"
                            rows={3}
                            defaultValue={task.description || ''}
                            className="w-full px-3.5 py-2.5 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-sm text-hm-ink focus:outline-none focus:border-hm-accent focus:ring-1 focus:ring-hm-accent transition-all resize-none" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-hm-ink">Priorität</label>
                            <select 
                                name="priority"
                                defaultValue={task.priority || 'medium'}
                                className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent"
                            >
                                <option value="low">Gering</option>
                                <option value="medium">Mittel</option>
                                <option value="high">Hoch</option>
                                <option value="urgent">Dringend 🚨</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-hm-ink">Status</label>
                            <select 
                                name="status"
                                defaultValue={task.status || 'todo'}
                                className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent"
                            >
                                <option value="todo">Zu erledigen</option>
                                <option value="in_progress">In Bearbeitung</option>
                                <option value="done">Erledigt</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-hm-ink flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-hm-muted" />
                                <span>Fälligkeitsdatum</span>
                            </label>
                            <input 
                                name="dueDate"
                                type="date" 
                                defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-hm-ink flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-hm-muted" />
                                <span>Zuständig</span>
                            </label>
                            <input 
                                name="assignedTo"
                                type="text" 
                                defaultValue={task.assignedTo || ''}
                                placeholder="Name oder Kürzel"
                                className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent" 
                            />
                        </div>
                    </div>

                    {/* Footer Actions with Delete */}
                    <div className="pt-3 flex items-center justify-between gap-3 border-t border-hm-rule">
                        <button 
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting || isLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--hm-radius-input)] bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                            title="Aufgabe unwiderruflich löschen"
                        >
                            {isDeleting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                            )}
                            <span>Aufgabe löschen</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button 
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper text-hm-ink hover:bg-hm-paper-2 text-xs font-medium transition-all"
                            >
                                Abbrechen
                            </button>
                            <button 
                                type="submit"
                                disabled={isLoading || isDeleting}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-[var(--hm-radius-input)] bg-hm-accent text-white text-xs font-semibold hover:bg-hm-accent-hover transition-all shadow-sm shadow-hm-accent/20 disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Wird gespeichert...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Speichern</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
