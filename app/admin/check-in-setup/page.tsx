/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { toast } from 'sonner';
import React, { useState, useEffect, useMemo } from 'react';
import {
    Folder,
    Car,
    ChevronRight,
    Search,
    RefreshCw,
    Save,
    CheckSquare,
    Square,
    Eye,
    X,
    Filter,
    CheckCircle2,
    AlertCircle,
    Trash2,
    Maximize2,
    Layers
} from 'lucide-react';
import {
    getCheckInFolders,
    getCarsForMapping,
    assignTemplateToCars,
    unassignTemplateFromCar,
    getTemplatePreview,
    TemplateAnglePreview
} from '@/app/actions/check-in-setup';
import { clsx } from 'clsx';

interface CarItem {
    id: number;
    brand: string;
    model: string;
    plate: string;
    checkInTemplate: string | null;
}

export default function CheckInSetupPage() {
    const [folders, setFolders] = useState<string[]>([]);
    const [cars, setCars] = useState<CarItem[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [selectedCarIds, setSelectedCarIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [folderSearch, setFolderSearch] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'unassigned' | 'assigned'>('all');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [unassigningId, setUnassigningId] = useState<number | null>(null);

    // Template preview
    const [previewAngles, setPreviewAngles] = useState<TemplateAnglePreview[]>([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<{ url: string; label: string } | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [f, c] = await Promise.all([
                getCheckInFolders(),
                getCarsForMapping()
            ]);
            setFolders(f);
            setCars(c);
        } catch (error) {
            toast.error('Fehler beim Laden der Daten');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Load preview when folder selection changes
    useEffect(() => {
        if (!selectedFolder) {
            setPreviewAngles([]);
            return;
        }

        let isMounted = true;
        setPreviewLoading(true);

        getTemplatePreview(selectedFolder)
            .then(angles => {
                if (isMounted) {
                    setPreviewAngles(angles);
                }
            })
            .catch(() => {
                if (isMounted) setPreviewAngles([]);
            })
            .finally(() => {
                if (isMounted) setPreviewLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedFolder]);

    const toggleCarSelection = (id: number) => {
        setSelectedCarIds(prev =>
            prev.includes(id) ? prev.filter(carId => carId !== id) : [...prev, id]
        );
    };

    // Calculate folder usage counts
    const folderUsageCount = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const car of cars) {
            if (car.checkInTemplate) {
                counts[car.checkInTemplate] = (counts[car.checkInTemplate] || 0) + 1;
            }
        }
        return counts;
    }, [cars]);

    // Filter cars
    const filteredCars = useMemo(() => {
        return cars.filter(c => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                !searchTerm ||
                (c.brand + ' ' + c.model + ' ' + c.plate).toLowerCase().includes(searchLower) ||
                (c.checkInTemplate && c.checkInTemplate.toLowerCase().includes(searchLower));

            if (!matchesSearch) return false;

            if (filterTab === 'unassigned') {
                return !c.checkInTemplate;
            }
            if (filterTab === 'assigned') {
                return !!c.checkInTemplate;
            }
            return true;
        });
    }, [cars, searchTerm, filterTab]);

    // Filter folders
    const filteredFolders = useMemo(() => {
        if (!folderSearch) return folders;
        return folders.filter(f => f.toLowerCase().includes(folderSearch.toLowerCase()));
    }, [folders, folderSearch]);

    // Select all visible / Deselect all
    const handleSelectAllVisible = () => {
        const visibleIds = filteredCars.map(c => c.id);
        const allVisibleSelected = visibleIds.every(id => selectedCarIds.includes(id));

        if (allVisibleSelected) {
            // Deselect visible
            setSelectedCarIds(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            // Add visible IDs without duplicates
            setSelectedCarIds(prev => Array.from(new Set([...prev, ...visibleIds])));
        }
    };

    const handleClearSelection = () => {
        setSelectedCarIds([]);
    };

    const handleSave = async () => {
        if (selectedCarIds.length === 0) return;

        if (!selectedFolder) {
            if (!confirm(`Möchten Sie die Vorlage für diese ${selectedCarIds.length} Fahrzeuge wirklich entfernen?`)) {
                return;
            }
        }

        setSaving(true);
        try {
            await assignTemplateToCars(selectedCarIds, selectedFolder);
            await loadData();
            setSelectedCarIds([]);
            toast.success(
                selectedFolder
                    ? `Vorlage "${selectedFolder}" erfolgreich zugewiesen!`
                    : 'Vorlage erfolgreich entfernt!'
            );
        } catch (error) {
            toast.error('Fehler beim Speichern der Vorlage');
        } finally {
            setSaving(false);
        }
    };

    const handleUnassignSingle = async (e: React.MouseEvent, carId: number) => {
        e.stopPropagation();
        setUnassigningId(carId);
        try {
            await unassignTemplateFromCar(carId);
            await loadData();
            toast.success('Vorlage für dieses Fahrzeug entfernt');
        } catch (error) {
            toast.error('Fehler beim Entfernen der Vorlage');
        } finally {
            setUnassigningId(null);
        }
    };

    const unassignedCount = cars.filter(c => !c.checkInTemplate).length;
    const assignedCount = cars.filter(c => !!c.checkInTemplate).length;
    const allVisibleSelected =
        filteredCars.length > 0 && filteredCars.every(c => selectedCarIds.includes(c.id));

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
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink flex items-center gap-3">
                        <Layers className="w-7 h-7 text-hm-accent" />
                        Check-In Visuals & Vorlagen
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
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule p-5 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-hm-rule">
                            <h2 className="hm-display text-base font-bold text-hm-ink flex items-center gap-2">
                                <Folder className="w-4 h-4 text-hm-accent" />
                                Bildervorlagen
                            </h2>
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                                {folders.length} Ordner
                            </span>
                        </div>

                        {/* Search input for folders */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-hm-muted" />
                            <input
                                type="text"
                                placeholder="Vorlage suchen..."
                                value={folderSearch}
                                onChange={(e) => setFolderSearch(e.target.value)}
                                className="pl-8 pr-3 py-1.5 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] w-full text-xs font-mono text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                            />
                        </div>

                        {/* Folder List */}
                        <div className="space-y-1.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                            {filteredFolders.map(folder => {
                                const isSelected = selectedFolder === folder;
                                const usage = folderUsageCount[folder] || 0;
                                return (
                                    <button
                                        key={folder}
                                        onClick={() => setSelectedFolder(isSelected ? null : folder)}
                                        className={clsx(
                                            "w-full flex items-center justify-between p-2.5 rounded-[var(--hm-radius-input)] transition-all border text-left",
                                            isSelected
                                                ? "bg-hm-accent text-hm-accent-ink border-hm-accent font-semibold shadow-xs"
                                                : "bg-hm-paper hover:bg-hm-paper-2 border-hm-rule text-hm-ink"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <Folder className={clsx("w-4 h-4 shrink-0", isSelected ? "text-hm-accent-ink" : "text-hm-muted")} />
                                            <span className="text-xs font-mono font-medium truncate">{folder}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            {usage > 0 && (
                                                <span className={clsx(
                                                    "font-mono text-[10px] px-1.5 py-0.5 rounded",
                                                    isSelected
                                                        ? "bg-white/20 text-white"
                                                        : "bg-hm-paper-2 text-hm-muted border border-hm-rule"
                                                )}>
                                                    {usage} {usage === 1 ? 'Auto' : 'Autos'}
                                                </span>
                                            )}
                                            {isSelected && <ChevronRight className="w-4 h-4 shrink-0" />}
                                        </div>
                                    </button>
                                );
                            })}
                            {filteredFolders.length === 0 && (
                                <p className="text-xs font-mono uppercase tracking-wider text-center text-hm-muted py-6">
                                    Keine Ordner gefunden
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Visual Inspection Angles Preview */}
                    {selectedFolder && (
                        <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule p-5 space-y-4 transition-all animate-fadeIn">
                            <div className="flex items-center justify-between pb-3 border-b border-hm-rule">
                                <div className="space-y-0.5">
                                    <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-hm-ink flex items-center gap-2">
                                        <Eye className="w-3.5 h-3.5 text-hm-accent" />
                                        Vorschau: {selectedFolder}
                                    </h3>
                                    <p className="text-[11px] font-mono text-hm-muted">
                                        Prüfwinkel für digitale Schadensaufnahme
                                    </p>
                                </div>
                                <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                    {previewAngles.length} Ansichten
                                </span>
                            </div>

                            {previewLoading ? (
                                <div className="py-8 flex items-center justify-center gap-2 text-xs font-mono text-hm-muted">
                                    <RefreshCw className="w-4 h-4 animate-spin text-hm-accent" />
                                    <span>Lade Bildwinkel...</span>
                                </div>
                            ) : previewAngles.length === 0 ? (
                                <div className="py-6 text-center space-y-1">
                                    <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                                    <p className="text-xs font-mono text-hm-muted">
                                        Keine Aussenansichten im Ordner gefunden.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {previewAngles.map(angle => (
                                        <div
                                            key={angle.key}
                                            onClick={() => setLightboxImage({ url: angle.url, label: angle.label })}
                                            className="group relative cursor-pointer rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 overflow-hidden hover:border-hm-accent transition-all"
                                        >
                                            <div className="aspect-4/3 w-full relative flex items-center justify-center bg-black/5">
                                                <img
                                                    src={angle.url}
                                                    alt={angle.label}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Maximize2 className="w-4 h-4 text-white drop-shadow" />
                                                </div>
                                            </div>
                                            <div className="p-1.5 text-center bg-hm-paper border-t border-hm-rule">
                                                <span className="font-mono text-[10px] font-semibold text-hm-ink block truncate">
                                                    {angle.label}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

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
                                <span>Rechts die gewünschten Fahrzeuge markieren (oder Filter nutzen).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="font-mono font-bold text-hm-accent shrink-0">03.</span>
                                <span>Auf "Zuweisen" klicken, um die Vorlage für Check-In zu aktivieren.</span>
                            </li>
                        </ol>
                    </div>
                </div>

                {/* Cars List (Right Column) */}
                <div className="lg:col-span-7 flex flex-col">
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden flex flex-col min-h-[720px]">
                        {/* Search & Header */}
                        <div className="p-4 sm:p-5 border-b border-hm-rule space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h2 className="hm-display text-base font-bold text-hm-ink flex items-center gap-2">
                                    <Car className="w-4 h-4 text-hm-accent" />
                                    Fahrzeugliste ({filteredCars.length})
                                </h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted" />
                                    <input
                                        type="text"
                                        placeholder="Marke, Modell, Kennzeichen..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-3 py-1.5 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] w-full sm:w-64 text-xs font-mono text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-hm-rule/60">
                                <div className="inline-flex rounded-[var(--hm-radius-input)] bg-hm-paper-2 p-0.5 border border-hm-rule text-xs font-mono">
                                    <button
                                        type="button"
                                        onClick={() => setFilterTab('all')}
                                        className={clsx(
                                            "px-2.5 py-1 rounded-[calc(var(--hm-radius-input)-2px)] font-medium transition-colors",
                                            filterTab === 'all'
                                                ? "bg-hm-paper text-hm-ink shadow-xs font-semibold"
                                                : "text-hm-muted hover:text-hm-ink"
                                        )}
                                    >
                                        Alle ({cars.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilterTab('unassigned')}
                                        className={clsx(
                                            "px-2.5 py-1 rounded-[calc(var(--hm-radius-input)-2px)] font-medium transition-colors flex items-center gap-1.5",
                                            filterTab === 'unassigned'
                                                ? "bg-hm-paper text-amber-700 dark:text-amber-400 shadow-xs font-semibold"
                                                : "text-hm-muted hover:text-hm-ink"
                                        )}
                                    >
                                        <span>Ohne Vorlage</span>
                                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 text-[10px] font-bold">
                                            {unassignedCount}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilterTab('assigned')}
                                        className={clsx(
                                            "px-2.5 py-1 rounded-[calc(var(--hm-radius-input)-2px)] font-medium transition-colors",
                                            filterTab === 'assigned'
                                                ? "bg-hm-paper text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold"
                                                : "text-hm-muted hover:text-hm-ink"
                                        )}
                                    >
                                        Mit Vorlage ({assignedCount})
                                    </button>
                                </div>

                                {/* Bulk Selection Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSelectAllVisible}
                                        disabled={filteredCars.length === 0}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--hm-radius-input)] bg-hm-paper-2 hover:bg-hm-paper border border-hm-rule text-xs font-mono font-medium text-hm-ink transition-colors disabled:opacity-40"
                                    >
                                        {allVisibleSelected ? (
                                            <>
                                                <Square className="w-3.5 h-3.5 text-hm-muted" />
                                                <span>Sichtbare abwählen</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckSquare className="w-3.5 h-3.5 text-hm-accent" />
                                                <span>Alle sichtbaren ({filteredCars.length})</span>
                                            </>
                                        )}
                                    </button>

                                    {selectedCarIds.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearSelection}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-muted hover:text-hm-ink transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                            <span>Auswahl aufheben ({selectedCarIds.length})</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 custom-scrollbar">
                            {filteredCars.map(car => {
                                const isSelected = selectedCarIds.includes(car.id);
                                const isCurrentFolderAssigned = selectedFolder && car.checkInTemplate === selectedFolder;
                                return (
                                    <div
                                        key={car.id}
                                        onClick={() => toggleCarSelection(car.id)}
                                        className={clsx(
                                            "w-full text-left p-3 rounded-[var(--hm-radius-input)] border transition-all flex items-center justify-between gap-3 cursor-pointer select-none",
                                            isSelected
                                                ? "bg-hm-paper-2 border-hm-rule-strong shadow-xs ring-1 ring-hm-rule-strong"
                                                : "bg-hm-paper hover:bg-hm-paper-2 border-hm-rule"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className={clsx(
                                                "p-2 rounded border transition-colors",
                                                isSelected
                                                    ? "bg-hm-accent text-white border-hm-accent"
                                                    : "bg-hm-paper-2 border-hm-rule text-hm-ink"
                                            )}>
                                                <Car className="w-4 h-4" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-hm-ink truncate">
                                                        {car.brand} {car.model}
                                                    </span>
                                                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink-2">
                                                        {car.plate}
                                                    </span>
                                                </div>

                                                <div className="mt-1 flex items-center gap-2 text-[11px] font-mono">
                                                    {car.checkInTemplate ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span>Vorlage: {car.checkInTemplate}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>Keine Vorlage</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {/* Quick unassign button */}
                                            {car.checkInTemplate && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleUnassignSingle(e, car.id)}
                                                    disabled={unassigningId === car.id}
                                                    className="p-1 rounded text-hm-muted hover:text-red-600 hover:bg-red-500/10 transition-colors"
                                                    title="Vorlage entfernen"
                                                >
                                                    {unassigningId === car.id ? (
                                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            )}

                                            <div className="text-hm-ink">
                                                {isSelected ? (
                                                    <CheckSquare className="w-5 h-5 text-hm-accent" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-hm-muted" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredCars.length === 0 && (
                                <div className="py-20 text-center space-y-2">
                                    <Car className="w-8 h-8 text-hm-muted mx-auto opacity-50" />
                                    <p className="text-xs font-mono uppercase tracking-wider text-hm-muted">
                                        Keine Fahrzeuge gefunden
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer Action Bar */}
                        <div className="p-4 border-t border-hm-rule bg-hm-paper flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-xs font-mono text-hm-muted">
                                {selectedCarIds.length > 0 ? (
                                    <span className="font-semibold text-hm-ink">
                                        {selectedCarIds.length} von {cars.length} Fahrzeugen ausgewählt
                                    </span>
                                ) : (
                                    <span>Wählen Sie Fahrzeuge aus der Liste aus</span>
                                )}
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving || selectedCarIds.length === 0}
                                className="w-full sm:w-auto px-6 py-2.5 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink font-mono text-xs font-bold uppercase tracking-wider rounded-[var(--hm-radius-input)] shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {selectedFolder
                                    ? `Ordner "${selectedFolder}" zuweisen (${selectedCarIds.length})`
                                    : `Vorlage für ${selectedCarIds.length} Fahrzeuge entfernen`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
                    onClick={() => setLightboxImage(null)}
                >
                    <div
                        className="relative max-w-3xl w-full bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-3 border-b border-hm-rule flex items-center justify-between bg-hm-paper-2">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-hm-ink">
                                {lightboxImage.label}
                            </span>
                            <button
                                type="button"
                                onClick={() => setLightboxImage(null)}
                                className="p-1 rounded text-hm-muted hover:text-hm-ink transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 bg-black/5 flex items-center justify-center">
                            <img
                                src={lightboxImage.url}
                                alt={lightboxImage.label}
                                className="max-h-[70vh] w-auto object-contain rounded"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
