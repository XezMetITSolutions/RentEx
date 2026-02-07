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
        <form action={formAction} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            {state?.error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{state.error}</p>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titel *</label>
                <input name="title" type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="z.B. Ölwechsel prüfen" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
                <textarea name="description" rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white resize-none" placeholder="Optionale Details" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priorität</label>
                    <select name="priority" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                        <option value="low">Niedrig</option>
                        <option value="medium">Mittel</option>
                        <option value="high">Hoch</option>
                        <option value="urgent">Dringend</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select name="status" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                        <option value="todo">Zu erledigen</option>
                        <option value="in_progress">In Bearbeitung</option>
                        <option value="done">Erledigt</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fällig am</label>
                <input name="dueDate" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zugewiesen an</label>
                <input name="assignedTo" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="Name oder Kürzel" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fahrzeug (optional)</label>
                <select name="relatedCarId" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                    <option value="">— Keins —</option>
                    {cars.map((c) => (
                        <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.plate})</option>
                    ))}
                </select>
            </div>
            <div className="pt-4 flex gap-3">
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                    Aufgabe erstellen
                </button>
                <Link href="/admin/tasks" className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Abbrechen
                </Link>
            </div>
        </form>
    );
}
