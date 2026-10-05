/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import {
    Folder,
    Car,
    ChevronRight,
    Search,
    RefreshCw,
    Save,
    CheckSquare,
    Square
} from 'lucide-react';
import { getCheckInFolders, getCarsForMapping, assignTemplateToCars } from '@/app/actions/check-in-setup';
import { clsx } from 'clsx';

export default function CheckInSetupPage() {
    const [folders, setFolders] = useState<string[]>([]);
    const [cars, setCars] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [selectedCarIds, setSelectedCarIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const f = await getCheckInFolders();
        const c = await getCarsForMapping();
        setFolders(f);
        setCars(c);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleCarSelection = (id: number) => {
        setSelectedCarIds(prev =>
            prev.includes(id) ? prev.filter(carId => carId !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (!selectedFolder && selectedCarIds.length > 0) {
            if (!confirm("Möchten Sie die Vorlage für diese Fahrzeuge entfernen?")) return;
        }

        setSaving(true);
        try {
            await assignTemplateToCars(selectedCarIds, selectedFolder);
            await loadData();
            setSelectedCarIds([]);
            toast.success('Erfolgreich gespeichert!');
        } catch (error) {
            toast.error('Fehler beim Speichern');
        } finally {
            setSaving(false);
        }
    };

    const filteredCars = cars.filter(c =>
        (c.brand + ' ' + c.model + ' ' + c.plate).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Operativ · Check-In Konfiguration
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Check-In Visuals
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Bilderordner mit Fahrzeugmodellen verknüpfen · Visuelle Prüfschritte
                    </p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="inline-flex items-center gap-2 p-2.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink font-mono text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                    title="Aktualisieren"
                >
                    <RefreshCw className={clsx("w-4 h-4 text-hm-muted", loading && "animate-spin")} />
                    <span>Aktualisieren</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Folders List (Left Column) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule p-5">
                        <div className="flex items-center justify-between pb-4 mb-4 border-b border-hm-rule">
                            <h2 className="hm-display text-base font-bold text-hm-ink flex items-center gap-2">
                                <Folder className="w-4 h-4 text-hm-accent" />
                                Bildervorlagen
                            </h2>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                                {folders.length} Ordner
                            </span>
                        </div>

                        <div className="space-y-2">
                            {folders.map(folder => {
                                const isSelected = selectedFolder === folder;
                                return (
                                    <button
                                        key={folder}
                                        onClick={() => setSelectedFolder(isSelected ? null : folder)}
                                        className={clsx(
                                            "w-full flex items-center justify-between p-3 rounded-[var(--hm-radius-input)] transition-colors border text-left",
                                            isSelected 
                                                ? "bg-hm-accent text-hm-accent-ink border-hm-accent font-semibold shadow-xs" 
                                                : "bg-hm-paper hover:bg-hm-paper-2 border-hm-rule text-hm-ink"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <Folder className={clsx("w-4 h-4 shrink-0", isSelected ? "text-hm-accent-ink" : "text-hm-muted")} />
                                            <span className="text-xs font-mono font-semibold truncate">{folder}</span>
                                        </div>
                                        {isSelected && <ChevronRight className="w-4 h-4 shrink-0" />}
                                    </button>
                                );
                            })}
                            {folders.length === 0 && (
                                <p className="text-xs font-mono uppercase tracking-wider text-center text-hm-muted py-8">
                                    Keine Ordner in /Check-in gefunden
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Step-by-step instructions */}
                    <div className="bg-hm-paper-2 rounded-[var(--hm-radius-card)] p-5 border border-hm-rule text-hm-ink">
                        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-hm-ink mb-3">
                            Arbeitsanweisung
                        </h3>
                        <ol className="space-y-2.5 text-xs text-hm-muted">
                            <li className="flex gap-2">
                                <span className="font-mono font-bold text-hm-accent shrink-0">01.</span>
                                <span>Links einen Bilderordner auswählen (z.B. Fiat Ducato).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-mono font-bold text-hm-accent shrink-0">02.</span>
                                <span>Rechts die gewünschten Fahrzeuge markieren.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-mono font-bold text-hm-accent shrink-0">03.</span>
                                <span>Auf "Zuweisen" klicken, um die Vorlage zu aktivieren.</span>
                            </li>
                        </ol>
                    </div>
                </div>

                {/* Cars List (Right Column) */}
                <div className="lg:col-span-8 flex flex-col">
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden flex flex-col h-[720px]">
                        {/* Search & Header */}
                        <div className="p-4 sm:p-5 border-b border-hm-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="hm-display text-base font-bold text-hm-ink flex items-center gap-2">
                                <Car className="w-4 h-4 text-hm-accent" />
                                Fahrzeugliste
                            </h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted" />
                                <input
                                    type="text"
                                    placeholder="Marke, Modell oder Kennzeichen..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-3 py-1.5 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] w-full sm:w-64 text-xs font-mono text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 custom-scrollbar">
                            {filteredCars.map(car => {
                                const isSelected = selectedCarIds.includes(car.id);
                                return (
                                    <button
                                        key={car.id}
                                        onClick={() => toggleCarSelection(car.id)}
                                        className={clsx(
                                            "w-full text-left p-3 rounded-[var(--hm-radius-input)] border transition-colors flex items-center justify-between gap-3",
                                            isSelected
                                                ? "bg-hm-paper-2 border-hm-rule-strong shadow-xs"
                                                : "bg-hm-paper hover:bg-hm-paper-2 border-hm-rule"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="p-2 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink">
                                                <Car className="w-4 h-4" />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-hm-ink truncate">{car.brand} {car.model}</span>
                                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink-2">
                                                        {car.plate}
                                                    </span>
                                                </div>
                                                
                                                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono">
                                                    {car.checkInTemplate ? (
                                                        <span className="text-emerald-700 dark:text-emerald-400">
                                                            Vorlage: {car.checkInTemplate}
                                                        </span>
                                                    ) : (
                                                        <span className="text-hm-muted italic">
                                                            Keine Vorlage zugewiesen
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-hm-ink">
                                            {isSelected ? (
                                                <CheckSquare className="w-5 h-5 text-hm-accent" />
                                            ) : (
                                                <Square className="w-5 h-5 text-hm-muted" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                            {filteredCars.length === 0 && (
                                <div className="py-20 text-center text-xs font-mono uppercase tracking-wider text-hm-muted">
                                    Keine Fahrzeuge gefunden
                                </div>
                            )}
                        </div>

                        {/* Footer Action Bar */}
                        <div className="p-4 border-t border-hm-rule bg-hm-paper">
                            <button
                                onClick={handleSave}
                                disabled={saving || (selectedCarIds.length === 0)}
                                className="w-full py-2.5 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink font-mono text-xs font-bold uppercase tracking-wider rounded-[var(--hm-radius-input)] shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {selectedFolder
                                    ? `Ordner "${selectedFolder}" zuweisen (${selectedCarIds.length} Fahrzeuge)`
                                    : `Vorlage für ${selectedCarIds.length} Fahrzeuge entfernen`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
