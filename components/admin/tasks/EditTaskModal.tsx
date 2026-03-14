'use client';

import React, { useState } from 'react';
import { X, Save, Trash2, Calendar, User, AlertTriangle } from 'lucide-react';
import { updateTask } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

interface EditTaskModalProps {
    task: any;
    onClose: () => void;
}

export default function EditTaskModal({ task, onClose }: EditTaskModalProps) {
    const [isLoading, setIsLoading] = useState(false);
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
            dueDate: formData.get('dueDate') as string || null,
            assignedTo: formData.get('assignedTo') as string || null,
        };

        try {
            await updateTask(task.id, data);
            router.refresh();
            onClose();
        } catch (error) {
            alert('Fehler beim Aktualisieren der Aufgabe');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-lg border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 dark:border-gray-800">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-all">Aufgabe bearbeiten</h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Details anpassen</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Titel</label>
                        <input 
                            name="title"
                            type="text" 
                            required
                            defaultValue={task.title}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Beschreibung</label>
                        <textarea 
                            name="description"
                            rows={3}
                            defaultValue={task.description}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Priorität</label>
                            <select 
                                name="priority"
                                defaultValue={task.priority}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                            >
                                <option value="low">Gering</option>
                                <option value="medium">Mittel</option>
                                <option value="high">Hoch</option>
                                <option value="urgent">Dringend</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status</label>
                            <select 
                                name="status"
                                defaultValue={task.status}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                            >
                                <option value="todo">Zu erledigen</option>
                                <option value="in_progress">In Bearbeitung</option>
                                <option value="done">Erledigt</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Fälligkeit</label>
                            <div className="relative">
                                <input 
                                    name="dueDate"
                                    type="date" 
                                    defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Zuständig</label>
                            <input 
                                name="assignedTo"
                                type="text" 
                                defaultValue={task.assignedTo}
                                placeholder="Name"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Abbrechen
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {isLoading ? 'Speichern...' : <><Save className="w-4 h-4" /> Speichern</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
