/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
'use client';

import { createTask } from '@/app/actions/admin';
import { useActionState } from 'react';
import Link from 'next/link';

type Car = { id: number; brand: string; model: string; plate: string };
type FormState = { error?: string } | null;

export default function TaskForm({ cars }: { cars: Car[] }) {
    const [state, formAction] = useActionState<FormState, FormData>(
        async (_: FormState, formData: FormData) => {
            const result = await createTask(formData);
            return result ?? null;
        },
        null
    );

    return (
        <form action={formAction} className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule shadow-sm p-6 space-y-4">
            {state?.error && (
                <p className="text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-[var(--hm-radius-input)] font-medium">
                    {state.error}
                </p>
            )}
            <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-hm-ink">Titel *</label>
                <input 
                    name="title" 
                    type="text" 
                    required 
                    className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-sm text-hm-ink focus:outline-none focus:border-hm-accent" 
                    placeholder="z.B. Reifenwechsel vor Abholung prüfen" 
                />
            </div>
            <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-hm-ink">Beschreibung</label>
                <textarea 
                    name="description" 
                    rows={3} 
                    className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-sm text-hm-ink focus:outline-none focus:border-hm-accent resize-none" 
                    placeholder="Optionale Details und Instruktionen" 
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-hm-ink">Priorität</label>
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
                    <label className="block text-xs font-semibold text-hm-ink">Status</label>
                    <select 
                        name="status" 
                        defaultValue="todo"
                        className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent"
                    >
                        <option value="todo">Zu erledigen</option>
                        <option value="in_progress">In Bearbeitung</option>
                        <option value="done">Erledigt</option>
                    </select>
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-hm-ink">Fällig am</label>
                <input 
                    name="dueDate" 
                    type="date" 
                    className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent" 
                />
            </div>
            <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-hm-ink">Zugewiesen an</label>
                <input 
                    name="assignedTo" 
                    type="text" 
                    className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent" 
                    placeholder="Name oder Kürzel" 
                />
            </div>
            <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-hm-ink">Fahrzeug (optional)</label>
                <select 
                    name="relatedCarId" 
                    className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink focus:outline-none focus:border-hm-accent"
                >
                    <option value="">— Keins —</option>
                    {cars.map((c) => (
                        <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.plate})</option>
                    ))}
                </select>
            </div>
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-hm-rule">
                <Link 
                    href="/admin/tasks" 
                    className="px-4 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-medium text-hm-ink hover:bg-hm-paper-2 transition-colors"
                >
                    Abbrechen
                </Link>
                <button 
                    type="submit" 
                    className="px-5 py-2 rounded-[var(--hm-radius-input)] bg-hm-accent text-white text-xs font-semibold hover:bg-hm-accent-hover transition-all shadow-sm shadow-hm-accent/20 cursor-pointer"
                >
                    Aufgabe erstellen
                </button>
            </div>
        </form>
    );
}
