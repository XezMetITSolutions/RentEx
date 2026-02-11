'use client';

import { createFahrtenbuchEntry } from '@/app/actions/admin';
import { useActionState } from 'react';

type Car = { id: number; brand: string; model: string; plate: string };
type FormState = { error?: string } | null;

export default function FahrtenbuchForm({ cars }: { cars: Car[] }) {
    const [state, formAction] = useActionState<FormState, FormData>(
        async (_: FormState, formData: FormData) => {
            const result = await createFahrtenbuchEntry(formData);
            return result ?? null;
        },
        null
    );

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{state.error}</p>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fahrzeug *</label>
                <select name="carId" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                    <option value="">— wählen —</option>
                    {cars.map((c) => (
                        <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.plate})</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum *</label>
                <input name="datum" type="date" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start km *</label>
                    <input name="startKm" type="number" required min={0} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ende km *</label>
                    <input name="endKm" type="number" required min={0} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zweck *</label>
                <select name="zweck" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                    <option value="DIENSTFAHRT">Dienstfahrt</option>
                    <option value="PRIVATFAHRT">Privatfahrt</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fahrtzweck (z.B. Strecke)</label>
                <input name="fahrtzweck" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="z.B. Feldkirch – Wien" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Eintrag speichern
            </button>
        </form>
    );
}
