/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { createFahrtenbuchEntry } from '@/app/actions/admin';
import { useActionState, useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Gauge, Navigation } from 'lucide-react';
import { clsx } from 'clsx';

export type CarOption = {
    id: number;
    brand: string;
    model: string;
    plate: string;
    currentMileage?: number | null;
    latestEndKm?: number | null;
};

type FormState = { error?: string } | null;

export default function FahrtenbuchForm({ cars }: { cars: CarOption[] }) {
    const [selectedCarId, setSelectedCarId] = useState<number | ''>('');
    const [startKm, setStartKm] = useState<number | ''>('');
    const [endKm, setEndKm] = useState<number | ''>('');

    const [state, formAction] = useActionState<FormState, FormData>(
        async (_: FormState, formData: FormData) => {
            const result = await createFahrtenbuchEntry(formData);
            return result ?? null;
        },
        null
    );

    // Auto-fill startKm when car selection changes
    const handleCarChange = (carIdStr: string) => {
        const id = parseInt(carIdStr, 10);
        if (isNaN(id)) {
            setSelectedCarId('');
            setStartKm('');
            setEndKm('');
            return;
        }
        setSelectedCarId(id);
        const car = cars.find((c) => c.id === id);
        if (car) {
            const initialKm = car.latestEndKm ?? car.currentMileage ?? 0;
            setStartKm(initialKm);
            setEndKm(initialKm);
        }
    };

    const distance = typeof startKm === 'number' && typeof endKm === 'number' ? endKm - startKm : null;
    const isValidDistance = distance !== null && distance >= 0;

    return (
        <form action={formAction} className="space-y-4 text-hm-ink">
            {state?.error && (
                <div className="flex items-center gap-2 text-xs font-mono text-red-600 bg-red-500/10 px-3 py-2 rounded border border-red-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{state.error}</span>
                </div>
            )}

            <div>
                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">
                    Fahrzeug *
                </label>
                <select
                    name="carId"
                    required
                    value={selectedCarId}
                    onChange={(e) => handleCarChange(e.target.value)}
                    className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors cursor-pointer"
                >
                    <option value="">— Fahrzeug auswählen —</option>
                    {cars.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.brand} {c.model} ({c.plate}) — Stand: {(c.latestEndKm ?? c.currentMileage ?? 0).toLocaleString('de-AT')} km
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">
                    Datum *
                </label>
                <input
                    name="datum"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors cursor-pointer"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">
                        Start km *
                    </label>
                    <div className="relative">
                        <input
                            name="startKm"
                            type="number"
                            required
                            min={0}
                            value={startKm}
                            onChange={(e) => setStartKm(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            placeholder="z.B. 45000"
                            className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">
                        Ende km *
                    </label>
                    <div className="relative">
                        <input
                            name="endKm"
                            type="number"
                            required
                            min={0}
                            value={endKm}
                            onChange={(e) => setEndKm(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            placeholder="z.B. 45120"
                            className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Calculated Distance Preview */}
            {distance !== null && (
                <div
                    className={clsx(
                        "p-2.5 rounded-[var(--hm-radius-input)] border font-mono text-xs flex items-center justify-between transition-colors",
                        isValidDistance
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                            : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                    )}
                >
                    <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5" />
                        <span>Fahrstrecke:</span>
                    </div>
                    <span className="font-bold">
                        {isValidDistance ? `+${distance.toLocaleString('de-AT')} km` : 'Ungültig (Ende < Start)'}
                    </span>
                </div>
            )}

            <div>
                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">
                    Zweck *
                </label>
                <select
                    name="zweck"
                    className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors cursor-pointer"
                >
                    <option value="DIENSTFAHRT">Dienstfahrt (Geschäftlich)</option>
                    <option value="PRIVATFAHRT">Privatfahrt</option>
                </select>
            </div>

            <div>
                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">
                    Fahrtzweck / Route
                </label>
                <div className="relative">
                    <input
                        name="fahrtzweck"
                        type="text"
                        className="w-full px-3 py-2 border border-hm-rule bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                        placeholder="z.B. Übergabe Kunde Dornbirn, Werkstattbesuch"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={distance !== null && !isValidDistance}
                className="w-full inline-flex items-center justify-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-hm-accent-ink transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
                <Save className="w-3.5 h-3.5" />
                Eintrag speichern
            </button>
        </form>
    );
}
