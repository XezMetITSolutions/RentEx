/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
'use client';

import React, { useState } from 'react';
import { X, Save, Plus, Calendar, User, Car, AlertCircle, Loader2 } from 'lucide-react';
import { createQuickTask } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CarItem {
    id: number;
    brand: string;
    model: string;
    plate: string;
}

interface StaffItem {
    id: number;
    name: string;
    role: string;
}

interface CreateTaskModalProps {
    defaultStatus?: string;
    cars?: CarItem[];
    staffMembers?: StaffItem[];
    onClose: () => void;
    onTaskCreated?: (newTask: any) => void;
}

export default function CreateTaskModal({
    defaultStatus = 'todo',
    cars = [],
    staffMembers = [],
    onClose,
    onTaskCreated
}: CreateTaskModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const title = (formData.get('title') as string)?.trim();
        const description = (formData.get('description') as string)?.trim() || null;
        const priority = (formData.get('priority') as string) || 'medium';
        const status = (formData.get('status') as string) || defaultStatus;
        const dueDate = (formData.get('dueDate') as string) || null;
        const assignedTo = (formData.get('assignedTo') as string)?.trim() || null;
        const relatedCarIdStr = formData.get('relatedCarId') as string;
        const relatedCarId = relatedCarIdStr ? parseInt(relatedCarIdStr, 10) : null;

        if (!title) {
            toast.error('Bitte geben Sie einen Titel ein');
            setIsLoading(false);
            return;
        }

        try {
            const res = await createQuickTask({
                title,
                description,
                priority,
                status,
                dueDate,
                assignedTo,
                relatedCarId
            });

            if (res.error) {
                throw new Error(res.error);
            }

            toast.success('Aufgabe erfolgreich erstellt');
            if (onTaskCreated && res.task) {
                onTaskCreated(res.task);
            }
            router.refresh();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Fehler beim Erstellen der Aufgabe');
        } finally {
            setIsLoading(false);
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
                        <h2 className="text-lg font-bold text-hm-ink">Neue Aufgabe erstellen</h2>
                        <p className="text-xs text-hm-muted mt-0.5">Details zum Workflow eintragen</p>
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
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-hm-ink flex items-center justify-between">
                            <span>Titel *</span>
                            <span className="text-[10px] text-hm-muted font-normal">Pflichtfeld</span>
                        </label>
                        <input 
                            name="title"
                            type="text" 
                            required
                            autoFocus
                            placeholder="z.B. Reifenwechsel vor Abholung prüfen"
                            className="w-full px-3.5 py-2.5 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-sm font-medium text-hm-ink focus:outline-none focus:border-hm-accent focus:ring-1 focus:ring-hm-accent transition-all" 
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-hm-ink">Beschreibung</label>
                        <textarea 
                            name="description"
                            rows={3}
                            placeholder="Zusätzliche Notizen oder Instruktionen für das Team..."
                            className="w-full px-3.5 py-2.5 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-sm text-hm-ink focus:outline-none focus:border-hm-accent focus:ring-1 focus:ring-hm-accent transition-all resize-none" 
                        />
                    </div>

                    {/* Priority & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-hm-ink">Priorität</label>
                            <select 
                                name="priority"
                                defaultValue="medium"
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
                                defaultValue={defaultStatus}
                                className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent"
                            >
                                <option value="todo">Zu erledigen</option>
                                <option value="in_progress">In Bearbeitung</option>
                                <option value="done">Erledigt</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date & Assignee */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-hm-ink flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-hm-muted" />
                                <span>Fälligkeitsdatum</span>
                            </label>
                            <input 
                                name="dueDate"
                                type="date" 
                                className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-hm-ink flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-hm-muted" />
                                <span>Zuständig</span>
                            </label>
                            {staffMembers.length > 0 ? (
                                <select
                                    name="assignedTo"
                                    className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent"
                                >
                                    <option value="">— Unzugewiesen —</option>
                                    {staffMembers.map(s => (
                                        <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                                    ))}
                                </select>
                            ) : (
                                <input 
                                    name="assignedTo"
                                    type="text" 
                                    placeholder="Name oder Kürzel"
                                    className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent" 
                                />
                            )}
                        </div>
                    </div>

                    {/* Vehicle select (optional) */}
                    {cars.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-hm-ink flex items-center gap-1.5">
                                <Car className="w-3.5 h-3.5 text-hm-muted" />
                                <span>Fahrzeug zuordnen (optional)</span>
                            </label>
                            <select 
                                name="relatedCarId" 
                                className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent"
                            >
                                <option value="">— Kein Fahrzeug —</option>
                                {cars.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.brand} {c.model} ({c.plate})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-hm-rule">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper text-hm-ink hover:bg-hm-paper-2 text-xs font-medium transition-all"
                        >
                            Abbrechen
                        </button>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-[var(--hm-radius-input)] bg-hm-accent text-white text-xs font-semibold hover:bg-hm-accent-hover transition-all shadow-sm shadow-hm-accent/20 disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Wird erstellt...</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Aufgabe erstellen</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
