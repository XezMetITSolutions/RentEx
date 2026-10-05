/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { createFahrtenbuchEntry } from '@/app/actions/admin';
import { useActionState } from 'react';
import { Save } from 'lucide-react';

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
        <form action={formAction} className="space-y-4 text-hm-ink">
            {state?.error && (
                <p className="text-xs font-mono text-red-600 bg-red-500/10 px-3 py-2 rounded border border-red-500/20">{state.error}</p>
            )}
            <div>
                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Fahrzeug *</label>
                <select name="carId" required className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors">
                    <option value="">— Fahrzeug auswählen —</option>
                    {cars.map((c) => (
                        <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.plate})</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Datum *</label>
                <input name="datum" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Start km *</label>
                    <input name="startKm" type="number" required min={0} className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                </div>
                <div>
                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Ende km *</label>
                    <input name="endKm" type="number" required min={0} className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                </div>
            </div>
            <div>
                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Zweck *</label>
                <select name="zweck" className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors">
                    <option value="DIENSTFAHRT">Dienstfahrt</option>
                    <option value="PRIVATFAHRT">Privatfahrt</option>
                </select>
            </div>
            <div>
                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Fahrtzweck / Route</label>
                <input name="fahrtzweck" type="text" className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors" placeholder="z.B. Feldkirch – Dornbirn" />
            </div>
            <button 
                type="submit" 
                className="w-full inline-flex items-center justify-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-hm-accent-ink transition-colors shadow-xs"
            >
                <Save className="w-3.5 h-3.5" />
                Eintrag speichern
            </button>
        </form>
    );
}
