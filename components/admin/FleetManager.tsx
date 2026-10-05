/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Search, MapPin, Fuel, Calendar,
    Settings2, Car as CarIcon,
    Edit2, LayoutGrid, List,
    BookOpen, Wrench, X, Save, Loader2,
    Tag, Plus, Download, AlertTriangle,
    CheckCircle2, Clock, Trash2, Archive,
    ChevronDown, Gauge, ShieldAlert
} from 'lucide-react';
import { CategoriesModal } from '@/components/admin/CategoriesModal';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { updateCarQuickStatus, archiveCar, deleteCar, checkCarDeletable } from '@/app/actions/cars';
import { isPast, differenceInDays } from 'date-fns';
import { useRouter } from 'next/navigation';

export interface Car {
    id: number;
    brand: string;
    model: string;
    plate: string;
    year: number;
    color: string;
    fuelType: string;
    transmission: string | null;
    category: string | null;
    status: string;
    dailyRate: number | null;
    imageUrl: string | null;
    currentLocation: { id: number; name: string } | null;
    homeLocation: { id: number; name: string } | null;
    isActive: boolean;
    vin: string | null;
    currentMileage?: number | null;
    nextInspection?: string | null;
}

const AVAILABLE_STATUSES = [
    { value: 'Active', label: 'Verfügbar', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
    { value: 'Rented', label: 'Vermietet', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
    { value: 'Maintenance', label: 'Wartung', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
    { value: 'NeedsRepair', label: 'Reparatur', color: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' },
    { value: 'Reserved', label: 'Reserviert', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' },
    { value: 'Inactive', label: 'Inaktiv', color: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border-zinc-500/20' },
];

export function FleetManager({
    initialCars,
    globalCategories = [],
    initialLocation = 'all'
}: {
    initialCars: Car[];
    globalCategories?: { id: number; name: string }[];
    initialLocation?: string;
}) {
    const router = useRouter();
    const [cars, setCars] = useState<Car[]>(initialCars);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [brandFilter, setBrandFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [fuelFilter, setFuelFilter] = useState<string>('all');
    const [locationFilter, setLocationFilter] = useState<string>(initialLocation || 'all');

    // Keep cars state synced if initialCars prop changes
    useEffect(() => {
        setCars(initialCars);
    }, [initialCars]);

    // Modal States
    const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
    const [fahrtenbuchCar, setFahrtenbuchCar] = useState<Car | null>(null);
    const [wartungCar, setWartungCar] = useState<Car | null>(null);

    // Delete / Archive Modal state
    const [carToDelete, setCarToDelete] = useState<Car | null>(null);
    const [checkingDelete, setCheckingDelete] = useState(false);
    const [deleteCheckResult, setDeleteCheckResult] = useState<{
        canDelete: boolean;
        rentalCount: number;
        maintenanceCount: number;
        damageCount: number;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // In-line status change state
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
    const [activeStatusMenuId, setActiveStatusMenuId] = useState<number | null>(null);

    const [isPending, startTransition] = useTransition();
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Extract unique values for filters
    const brands = useMemo(() => Array.from(new Set(cars.map(c => c.brand))).sort(), [cars]);

    const categories = useMemo(() => {
        if (globalCategories && globalCategories.length > 0) {
            return globalCategories.map(c => c.name);
        }
        return Array.from(new Set(cars.map(c => c.category).filter(Boolean))).sort();
    }, [cars, globalCategories]);

    const fuelTypes = useMemo(() => Array.from(new Set(cars.map(c => c.fuelType))).sort(), [cars]);
    const locations = useMemo(() => {
        const locs = new Set<string>();
        cars.forEach(c => {
            if (c.currentLocation?.name) locs.add(c.currentLocation.name);
            if (c.homeLocation?.name) locs.add(c.homeLocation.name);
        });
        return Array.from(locs).sort();
    }, [cars]);

    // Filtered cars
    const filteredCars = useMemo(() => {
        return cars.filter(car => {
            const matchesSearch =
                car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (car.vin && car.vin.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || car.status === statusFilter;
            const matchesBrand = brandFilter === 'all' || car.brand === brandFilter;
            const matchesCategory = categoryFilter === 'all' || car.category === categoryFilter;
            const matchesFuel = fuelFilter === 'all' || car.fuelType === fuelFilter;
            const matchesLocation =
                locationFilter === 'all' ||
                car.currentLocation?.name === locationFilter ||
                car.homeLocation?.name === locationFilter;

            return matchesSearch && matchesStatus && matchesBrand && matchesCategory && matchesFuel && matchesLocation;
        });
    }, [cars, searchQuery, statusFilter, brandFilter, categoryFilter, fuelFilter, locationFilter]);

    // KPI Counters
    const kpis = useMemo(() => {
        const total = cars.length;
        const available = cars.filter(c => c.status === 'Active').length;
        const rented = cars.filter(c => c.status === 'Rented').length;
        const maintenance = cars.filter(c => c.status === 'Maintenance' || c.status === 'NeedsRepair').length;
        const rate = total > 0 ? Math.round((rented / total) * 100) : 0;

        return { total, available, rented, maintenance, rate };
    }, [cars]);

    // TÜV / §57a Helper
    const getInspectionWarning = (inspectionDateStr?: string | null) => {
        if (!inspectionDateStr) return null;
        try {
            const date = new Date(inspectionDateStr);
            const now = new Date();
            if (isPast(date)) {
                return {
                    isExpired: true,
                    daysDiff: differenceInDays(now, date),
                    text: '§57a abgelaufen'
                };
            }
            const daysLeft = differenceInDays(date, now);
            if (daysLeft <= 30) {
                return {
                    isExpired: false,
                    daysDiff: daysLeft,
                    text: `§57a in ${daysLeft} Tagen`
                };
            }
        } catch {
            return null;
        }
        return null;
    };

    const getStatusBadge = (status: string) => {
        const found = AVAILABLE_STATUSES.find(s => s.value === status);
        return found ? found.color : 'bg-hm-paper-2 text-hm-muted border-hm-rule';
    };

    const getStatusLabel = (status: string) => {
        const found = AVAILABLE_STATUSES.find(s => s.value === status);
        return found ? found.label : status;
    };

    // Quick Status Update
    const handleQuickStatusChange = async (carId: number, newStatus: string) => {
        setActiveStatusMenuId(null);
        setUpdatingStatusId(carId);

        // Optimistic update
        setCars(prev =>
            prev.map(c => (c.id === carId ? { ...c, status: newStatus, isActive: newStatus !== 'Inactive' } : c))
        );

        try {
            const res = await updateCarQuickStatus(carId, newStatus);
            if (res.success) {
                toast.success(`Fahrzeugstatus auf "${getStatusLabel(newStatus)}" geändert`);
            } else {
                toast.error(res.error || 'Fehler beim Ändern des Status');
                router.refresh();
            }
        } catch {
            toast.error('Netzwerkfehler');
            router.refresh();
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // Delete / Archive Modal Check
    const handleOpenDeleteModal = async (car: Car) => {
        setCarToDelete(car);
        setCheckingDelete(true);
        setDeleteCheckResult(null);

        try {
            const result = await checkCarDeletable(car.id);
            setDeleteCheckResult(result);
        } catch {
            setDeleteCheckResult({ canDelete: false, rentalCount: 0, maintenanceCount: 0, damageCount: 0 });
        } finally {
            setCheckingDelete(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!carToDelete) return;
        setIsDeleting(true);

        try {
            const res = await deleteCar(carToDelete.id);
            if (res.success) {
                toast.success(`Fahrzeug ${carToDelete.brand} ${carToDelete.model} wurde gelöscht.`);
                setCars(prev => prev.filter(c => c.id !== carToDelete.id));
                setCarToDelete(null);
            } else {
                toast.error(res.error || 'Fehler beim Löschen');
            }
        } catch {
            toast.error('Netzwerkfehler beim Löschen');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleConfirmArchive = async () => {
        if (!carToDelete) return;
        setIsDeleting(true);

        try {
            const res = await archiveCar(carToDelete.id);
            if (res.success) {
                toast.success(`Fahrzeug ${carToDelete.brand} ${carToDelete.model} wurde deaktiviert und archiviert.`);
                setCars(prev =>
                    prev.map(c => (c.id === carToDelete.id ? { ...c, status: 'Inactive', isActive: false } : c))
                );
                setCarToDelete(null);
            } else {
                toast.error(res.error || 'Fehler beim Archivieren');
            }
        } catch {
            toast.error('Netzwerkfehler beim Archivieren');
        } finally {
            setIsDeleting(false);
        }
    };

    // CSV Export
    const handleExportCSV = () => {
        if (filteredCars.length === 0) {
            toast.error('Keine Fahrzeuge zum Exportieren vorhanden.');
            return;
        }

        const headers = [
            'ID',
            'Kennzeichen',
            'Marke',
            'Modell',
            'Baujahr',
            'Farbe',
            'Kategorie',
            'Status',
            'Standort',
            'Kraftstoff',
            'Getriebe',
            'Kilometerstand',
            'Tagespreis (EUR)',
            'VIN'
        ];

        const rows = filteredCars.map(c => [
            c.id,
            `"${c.plate}"`,
            `"${c.brand}"`,
            `"${c.model}"`,
            c.year,
            `"${c.color}"`,
            `"${c.category || ''}"`,
            `"${getStatusLabel(c.status)}"`,
            `"${c.currentLocation?.name || c.homeLocation?.name || ''}"`,
            `"${c.fuelType}"`,
            `"${c.transmission || ''}"`,
            c.currentMileage || 0,
            c.dailyRate ? c.dailyRate.toFixed(2) : '0.00',
            `"${c.vin || ''}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rentex-flotte-export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${filteredCars.length} Fahrzeuge als CSV exportiert.`);
    };

    const handleFahrtenbuchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);
        const form = e.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            try {
                const res = await fetch('/api/admin/fahrtenbuch', {
                    method: 'POST',
                    body: JSON.stringify({
                        carId: Number(formData.get('carId')),
                        datum: formData.get('datum'),
                        startKm: Number(formData.get('startKm')),
                        endKm: Number(formData.get('endKm')),
                        zweck: formData.get('zweck'),
                        fahrtzweck: formData.get('fahrtzweck') || null,
                    }),
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();
                if (data.error) {
                    setFormError(data.error);
                } else {
                    setFormSuccess('Fahrtenbuch-Eintrag gespeichert!');
                    form.reset();
                    setTimeout(() => {
                        setFahrtenbuchCar(null);
                        setFormSuccess(null);
                    }, 1200);
                }
            } catch {
                setFormError('Netzwerkfehler');
            }
        });
    };

    const handleWartungSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);
        const form = e.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
            try {
                const res = await fetch('/api/admin/maintenance', {
                    method: 'POST',
                    body: JSON.stringify({
                        carId: Number(formData.get('carId')),
                        maintenanceType: formData.get('maintenanceType'),
                        performedDate: formData.get('performedDate'),
                        description: formData.get('description'),
                        cost: formData.get('cost') ? Number(formData.get('cost')) : null,
                        mileage: formData.get('mileage') ? Number(formData.get('mileage')) : null,
                        performedBy: formData.get('performedBy') || null,
                        notes: formData.get('notes') || null,
                    }),
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await res.json();
                if (data.error) {
                    setFormError(data.error);
                } else {
                    setFormSuccess('Wartungseintrag gespeichert!');
                    form.reset();
                    setTimeout(() => {
                        setWartungCar(null);
                        setFormSuccess(null);
                    }, 1200);
                }
            } catch {
                setFormError('Netzwerkfehler');
            }
        });
    };

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Flotte · Fuhrparkverwaltung
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                            Fahrzeugflotte
                        </h1>
                        <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                            {filteredCars.length} Fahrzeuge
                        </span>
                    </div>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Zentrales Flottenverzeichnis · Status, Disposition & Standorte
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* View Switcher */}
                    <div className="flex items-center bg-hm-paper-2 rounded-[var(--hm-radius-input)] p-1 border border-hm-rule">
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-1.5 rounded-[calc(var(--hm-radius-input)-2px)] transition-all",
                                viewMode === 'list'
                                    ? "bg-hm-paper text-hm-ink shadow-xs border border-hm-rule"
                                    : "text-hm-muted hover:text-hm-ink"
                            )}
                            title="Listenansicht"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={clsx(
                                "p-1.5 rounded-[calc(var(--hm-radius-input)-2px)] transition-all",
                                viewMode === 'grid'
                                    ? "bg-hm-paper text-hm-ink shadow-xs border border-hm-rule"
                                    : "text-hm-muted hover:text-hm-ink"
                            )}
                            title="Kachelansicht"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    {/* CSV Export Button */}
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                        title="Aktuelle Ansicht als CSV exportieren"
                    >
                        <Download className="w-3.5 h-3.5 text-hm-muted" />
                        <span>CSV Export</span>
                    </button>

                    {/* Categories Modal Button */}
                    <button
                        type="button"
                        onClick={() => setCategoriesModalOpen(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Tag className="w-3.5 h-3.5 text-hm-muted" />
                        Kategorien
                    </button>

                    {/* Add Vehicle Button */}
                    <Link
                        href="/admin/fleet/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Neues Fahrzeug
                    </Link>
                </div>
            </div>

            {/* KPI Summary Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div
                    onClick={() => setStatusFilter('all')}
                    className={clsx(
                        "p-4 rounded-[var(--hm-radius-card)] border transition-all cursor-pointer select-none",
                        statusFilter === 'all'
                            ? "bg-hm-accent/10 border-hm-accent/40 shadow-xs"
                            : "bg-hm-paper border-hm-rule hover:border-hm-rule-strong"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-hm-muted">Gesamt Flotte</span>
                        <CarIcon className="w-4 h-4 text-hm-accent" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-hm-ink">{kpis.total}</span>
                        <span className="text-xs font-mono text-hm-muted">Autos</span>
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter('Active')}
                    className={clsx(
                        "p-4 rounded-[var(--hm-radius-card)] border transition-all cursor-pointer select-none",
                        statusFilter === 'Active'
                            ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs"
                            : "bg-hm-paper border-hm-rule hover:border-hm-rule-strong"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
                            Verfügbar
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-emerald-700 dark:text-emerald-400">{kpis.available}</span>
                        <span className="text-xs font-mono text-emerald-600/70">Mietbereit</span>
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter('Rented')}
                    className={clsx(
                        "p-4 rounded-[var(--hm-radius-card)] border transition-all cursor-pointer select-none",
                        statusFilter === 'Rented'
                            ? "bg-blue-500/10 border-blue-500/40 shadow-xs"
                            : "bg-hm-paper border-hm-rule hover:border-hm-rule-strong"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 font-semibold">
                            Vermietet
                        </span>
                        <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-blue-700 dark:text-blue-400">{kpis.rented}</span>
                        <span className="text-xs font-mono text-blue-600/70">Im Einsatz</span>
                    </div>
                </div>

                <div
                    onClick={() => setStatusFilter('Maintenance')}
                    className={clsx(
                        "p-4 rounded-[var(--hm-radius-card)] border transition-all cursor-pointer select-none",
                        statusFilter === 'Maintenance' || statusFilter === 'NeedsRepair'
                            ? "bg-amber-500/10 border-amber-500/40 shadow-xs"
                            : "bg-hm-paper border-hm-rule hover:border-hm-rule-strong"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
                            Wartung / Reparatur
                        </span>
                        <Wrench className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-amber-700 dark:text-amber-400">{kpis.maintenance}</span>
                        <span className="text-xs font-mono text-amber-600/70">In Werkstatt</span>
                    </div>
                </div>

                <div className="p-4 rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper select-none col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-hm-muted">Auslastung</span>
                        <span className="font-mono text-xs font-bold text-hm-ink">{kpis.rate}%</span>
                    </div>
                    <div className="mt-3 w-full bg-hm-paper-2 rounded-full h-2 overflow-hidden border border-hm-rule">
                        <div
                            className="bg-hm-accent h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(kpis.rate, 100)}%` }}
                        />
                    </div>
                    <div className="mt-1.5 text-[10px] font-mono text-hm-muted text-right">
                        {kpis.rented} von {kpis.total} vermietet
                    </div>
                </div>
            </div>

            <CategoriesModal isOpen={categoriesModalOpen} onClose={() => setCategoriesModalOpen(false)} />

            {/* Filters Area */}
            <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted" />
                        <input
                            type="text"
                            placeholder="Suchen (Kennzeichen, Modell, VIN)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                    >
                        <option value="all">Alle Status ({cars.length})</option>
                        <option value="Active">Verfügbar ({cars.filter(c => c.status === 'Active').length})</option>
                        <option value="Rented">Vermietet ({cars.filter(c => c.status === 'Rented').length})</option>
                        <option value="Maintenance">Wartung ({cars.filter(c => c.status === 'Maintenance').length})</option>
                        <option value="NeedsRepair">Reparatur erforderlich ({cars.filter(c => c.status === 'NeedsRepair').length})</option>
                        <option value="Reserved">Reserviert ({cars.filter(c => c.status === 'Reserved').length})</option>
                        <option value="Inactive">Inaktiv ({cars.filter(c => c.status === 'Inactive').length})</option>
                    </select>

                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                    >
                        <option value="all">Alle Marken ({brands.length})</option>
                        {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                    >
                        <option value="all">Alle Kategorien ({categories.length})</option>
                        {categories.map(cat => <option key={cat as string} value={cat as string}>{cat}</option>)}
                    </select>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-hm-rule font-mono text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={fuelFilter}
                            onChange={(e) => setFuelFilter(e.target.value)}
                            className="bg-transparent border-none text-hm-muted hover:text-hm-ink transition-colors cursor-pointer"
                        >
                            <option value="all">Alle Kraftstoffe</option>
                            {fuelTypes.map(fuel => <option key={fuel} value={fuel}>{fuel}</option>)}
                        </select>

                        <span className="text-hm-rule">·</span>

                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="bg-transparent border-none text-hm-muted hover:text-hm-ink transition-colors cursor-pointer"
                        >
                            <option value="all">Alle Standorte</option>
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                            setBrandFilter('all');
                            setCategoryFilter('all');
                            setFuelFilter('all');
                            setLocationFilter('all');
                        }}
                        className="uppercase tracking-wider text-[11px] text-hm-muted hover:text-hm-accent transition-colors"
                    >
                        Filter zurücksetzen
                    </button>
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] font-mono text-hm-muted bg-hm-paper-2 border-b border-hm-rule uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-6 py-3 font-semibold">Kennzeichen / VIN</th>
                                    <th className="px-6 py-3 font-semibold">Kategorie & Status</th>
                                    <th className="px-6 py-3 font-semibold">Standort & KM</th>
                                    <th className="px-6 py-3 font-semibold">TÜV (§57a)</th>
                                    <th className="px-6 py-3 font-semibold text-right">Tagespreis</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {filteredCars.map((car) => {
                                    const inspectionWarning = getInspectionWarning(car.nextInspection);
                                    const isUpdatingStatus = updatingStatusId === car.id;
                                    const isStatusMenuOpen = activeStatusMenuId === car.id;

                                    return (
                                        <tr key={car.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                            {/* Vehicle */}
                                            <td className="px-6 py-4">
                                                <Link href={`/admin/fleet/${car.id}`} className="flex items-center gap-3.5 group">
                                                    <div className="relative w-12 h-10 rounded-[var(--hm-radius-input)] overflow-hidden bg-hm-paper-2 border border-hm-rule shrink-0">
                                                        {car.imageUrl ? (
                                                            <Image
                                                                src={car.imageUrl}
                                                                alt={car.model}
                                                                fill
                                                                className="object-cover transition-transform group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-hm-muted">
                                                                <CarIcon className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-hm-ink group-hover:text-hm-accent transition-colors">
                                                            {car.brand} {car.model}
                                                        </div>
                                                        <div className="text-[11px] font-mono text-hm-muted">
                                                            {car.year} · {car.color} · {car.fuelType}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </td>

                                            {/* Plate / VIN */}
                                            <td className="px-6 py-4 font-mono">
                                                <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink font-semibold">
                                                    {car.plate}
                                                </span>
                                                {car.vin && (
                                                    <div className="text-[10px] text-hm-muted mt-1" title={car.vin}>
                                                        VIN: {car.vin.substring(0, 8)}...
                                                    </div>
                                                )}
                                            </td>

                                            {/* Category & Status with In-Line Quick Switch */}
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    {car.category && (
                                                        <div className="text-[10px] font-mono text-hm-muted uppercase tracking-wider">
                                                            {car.category}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Quick Status Dropdown */}
                                                    <div className="relative inline-block">
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveStatusMenuId(isStatusMenuOpen ? null : car.id)}
                                                            disabled={isUpdatingStatus}
                                                            className={clsx(
                                                                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] text-[10px] font-mono font-bold uppercase tracking-wider border transition-opacity hover:opacity-80',
                                                                getStatusBadge(car.status),
                                                                isUpdatingStatus && 'opacity-50'
                                                            )}
                                                            title="Status schnell ändern"
                                                        >
                                                            {isUpdatingStatus ? (
                                                                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                            ) : (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                            )}
                                                            <span>{getStatusLabel(car.status)}</span>
                                                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                                                        </button>

                                                        {isStatusMenuOpen && (
                                                            <>
                                                                <div
                                                                    className="fixed inset-0 z-20"
                                                                    onClick={() => setActiveStatusMenuId(null)}
                                                                />
                                                                <div className="absolute left-0 top-full mt-1 w-44 bg-hm-paper rounded-[var(--hm-radius-input)] shadow-lg border border-hm-rule py-1 z-30">
                                                                    <div className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-hm-muted border-b border-hm-rule">
                                                                        Status ändern
                                                                    </div>
                                                                    {AVAILABLE_STATUSES.map(st => (
                                                                        <button
                                                                            key={st.value}
                                                                            type="button"
                                                                            onClick={() => handleQuickStatusChange(car.id, st.value)}
                                                                            className={clsx(
                                                                                "w-full text-left px-2.5 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-hm-paper-2 transition-colors",
                                                                                car.status === st.value && "font-bold text-hm-accent"
                                                                            )}
                                                                        >
                                                                            <span>{st.label}</span>
                                                                            {car.status === st.value && <CheckCircle2 className="w-3 h-3 text-hm-accent" />}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Location & Current Mileage */}
                                            <td className="px-6 py-4 font-mono text-xs">
                                                <div className="flex items-center gap-1.5 text-hm-ink">
                                                    <MapPin className="w-3.5 h-3.5 text-hm-muted shrink-0" />
                                                    <span className="truncate">{car.currentLocation?.name || car.homeLocation?.name || '–'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px] text-hm-muted mt-1">
                                                    <Gauge className="w-3 h-3" />
                                                    <span>{(car.currentMileage || 0).toLocaleString('de-DE')} km</span>
                                                </div>
                                            </td>

                                            {/* Inspection / Pickerl */}
                                            <td className="px-6 py-4 font-mono text-xs">
                                                {inspectionWarning ? (
                                                    <span
                                                        className={clsx(
                                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border",
                                                            inspectionWarning.isExpired
                                                                ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                                                                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                                        )}
                                                        title={car.nextInspection ? `Fällig: ${new Date(car.nextInspection).toLocaleDateString('de-DE')}` : ''}
                                                    >
                                                        <AlertTriangle className="w-3 h-3" />
                                                        <span>{inspectionWarning.text}</span>
                                                    </span>
                                                ) : car.nextInspection ? (
                                                    <span className="text-[11px] text-hm-muted">
                                                        {new Date(car.nextInspection).toLocaleDateString('de-DE')}
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] text-hm-muted italic">–</span>
                                                )}
                                            </td>

                                            {/* Daily Rate */}
                                            <td className="px-6 py-4 text-right font-mono font-bold text-hm-ink hm-tnum">
                                                €{Number(car.dailyRate || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Calendar shortcut */}
                                                    <Link
                                                        href={`/admin/reservations?search=${encodeURIComponent(car.plate)}`}
                                                        className="p-1.5 text-hm-muted hover:text-hm-accent hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                                        title="Buchungskalender & Reservierungen"
                                                    >
                                                        <Calendar className="w-4 h-4" />
                                                    </Link>

                                                    {/* Fahrtenbuch modal button */}
                                                    <button
                                                        onClick={() => { setFahrtenbuchCar(car); setFormError(null); setFormSuccess(null); }}
                                                        className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                                        title="Fahrtenbuch"
                                                    >
                                                        <BookOpen className="w-4 h-4" />
                                                    </button>

                                                    {/* Wartung modal button */}
                                                    <button
                                                        onClick={() => { setWartungCar(car); setFormError(null); setFormSuccess(null); }}
                                                        className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                                        title="Wartung"
                                                    >
                                                        <Wrench className="w-4 h-4" />
                                                    </button>

                                                    {/* Edit link */}
                                                    <Link
                                                        href={`/admin/fleet/${car.id}`}
                                                        className="p-1.5 text-hm-muted hover:text-hm-accent hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                                        title="Bearbeiten"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>

                                                    {/* Safe Delete / Archive Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDeleteModal(car)}
                                                        className="p-1.5 text-hm-muted hover:text-red-600 hover:bg-red-500/10 rounded-[var(--hm-radius-input)] transition-colors"
                                                        title="Löschen oder Archivieren"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredCars.length === 0 && (
                            <div className="py-20 text-center text-hm-muted">
                                <CarIcon className="w-10 h-10 text-hm-muted/40 mx-auto mb-3" />
                                <p className="text-xs font-mono uppercase tracking-wider">Keine Fahrzeuge gefunden</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCars.map((car) => {
                        const inspectionWarning = getInspectionWarning(car.nextInspection);
                        const isUpdatingStatus = updatingStatusId === car.id;
                        const isStatusMenuOpen = activeStatusMenuId === car.id;

                        return (
                            <div key={car.id} className="group bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden hover:border-hm-rule-strong transition-colors flex flex-col justify-between">
                                <div>
                                    <div className="aspect-[16/10] bg-hm-stage relative block overflow-hidden">
                                        <Link href={`/admin/fleet/${car.id}`}>
                                            {car.imageUrl ? (
                                                <Image
                                                    src={car.imageUrl}
                                                    alt={`${car.brand} ${car.model}`}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-hm-muted">
                                                    <CarIcon className="h-10 w-10" />
                                                </div>
                                            )}
                                        </Link>

                                        {/* Status badge & Quick Switch */}
                                        <div className="absolute top-2.5 right-2.5 z-10">
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveStatusMenuId(isStatusMenuOpen ? null : car.id)}
                                                    disabled={isUpdatingStatus}
                                                    className={clsx(
                                                        'px-2 py-0.5 rounded-[var(--hm-radius-pill)] text-[9px] font-mono font-bold uppercase tracking-wider border shadow-xs inline-flex items-center gap-1 bg-hm-paper/95 backdrop-blur-xs',
                                                        getStatusBadge(car.status)
                                                    )}
                                                >
                                                    {isUpdatingStatus ? (
                                                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                    ) : (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    )}
                                                    <span>{getStatusLabel(car.status)}</span>
                                                    <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                                                </button>

                                                {isStatusMenuOpen && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-20"
                                                            onClick={() => setActiveStatusMenuId(null)}
                                                        />
                                                        <div className="absolute right-0 top-full mt-1 w-44 bg-hm-paper rounded-[var(--hm-radius-input)] shadow-lg border border-hm-rule py-1 z-30">
                                                            <div className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-hm-muted border-b border-hm-rule">
                                                                Status ändern
                                                            </div>
                                                            {AVAILABLE_STATUSES.map(st => (
                                                                <button
                                                                    key={st.value}
                                                                    type="button"
                                                                    onClick={() => handleQuickStatusChange(car.id, st.value)}
                                                                    className={clsx(
                                                                        "w-full text-left px-2.5 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-hm-paper-2 transition-colors",
                                                                        car.status === st.value && "font-bold text-hm-accent"
                                                                    )}
                                                                >
                                                                    <span>{st.label}</span>
                                                                    {car.status === st.value && <CheckCircle2 className="w-3 h-3 text-hm-accent" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Inspection alert floating tag */}
                                        {inspectionWarning && (
                                            <div className="absolute top-2.5 left-2.5">
                                                <span
                                                    className={clsx(
                                                        "px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border shadow-xs inline-flex items-center gap-1",
                                                        inspectionWarning.isExpired
                                                            ? "bg-red-600 text-white border-red-700"
                                                            : "bg-amber-500 text-white border-amber-600"
                                                    )}
                                                >
                                                    <AlertTriangle className="w-2.5 h-2.5" />
                                                    <span>{inspectionWarning.text}</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 space-y-3">
                                        <div>
                                            <Link href={`/admin/fleet/${car.id}`} className="group/title block">
                                                <h3 className="font-semibold text-hm-ink group-hover/title:text-hm-accent transition-colors truncate">
                                                    {car.brand} {car.model}
                                                </h3>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink">
                                                        {car.plate}
                                                    </span>
                                                    {car.category && (
                                                        <span className="text-[10px] font-mono text-hm-muted uppercase tracking-wider">
                                                            {car.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-hm-muted pt-2 border-t border-hm-rule">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Calendar className="h-3 w-3 shrink-0" />
                                                <span>{car.year}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Fuel className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{car.fuelType}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Gauge className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{(car.currentMileage || 0).toLocaleString('de-DE')} km</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 truncate">
                                                <MapPin className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{car.currentLocation?.name ?? car.homeLocation?.name ?? '–'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 pt-3 border-t border-hm-rule flex items-center justify-between bg-hm-paper">
                                    <div>
                                        <p className="text-[10px] font-mono uppercase tracking-wider text-hm-muted">Tagespreis</p>
                                        <p className="font-mono font-bold text-hm-ink hm-tnum">
                                            €{Number(car.dailyRate || 0).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            href={`/admin/reservations?search=${encodeURIComponent(car.plate)}`}
                                            className="p-1.5 text-hm-muted hover:text-hm-accent hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                            title="Buchungskalender"
                                        >
                                            <Calendar className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => { setFahrtenbuchCar(car); setFormError(null); setFormSuccess(null); }}
                                            className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                            title="Fahrtenbuch"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { setWartungCar(car); setFormError(null); setFormSuccess(null); }}
                                            className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                            title="Wartung"
                                        >
                                            <Wrench className="w-4 h-4" />
                                        </button>
                                        <Link
                                            href={`/admin/fleet/${car.id}`}
                                            className="p-1.5 text-hm-muted hover:text-hm-accent hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                            title="Bearbeiten"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleOpenDeleteModal(car)}
                                            className="p-1.5 text-hm-muted hover:text-red-600 hover:bg-red-500/10 rounded-[var(--hm-radius-input)] transition-colors"
                                            title="Löschen oder Archivieren"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ===== SAFE DELETE / ARCHIVE MODAL ===== */}
            {carToDelete && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => !isDeleting && setCarToDelete(null)}
                >
                    <div
                        className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-2xl w-full max-w-md border border-hm-rule text-hm-ink overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-5 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper-2">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-[var(--hm-radius-input)]">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                        Fahrzeug entfernen / archivieren
                                    </h2>
                                    <p className="text-[11px] font-mono text-hm-muted">
                                        {carToDelete.brand} {carToDelete.model} · {carToDelete.plate}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => !isDeleting && setCarToDelete(null)}
                                className="p-1 text-hm-muted hover:text-hm-ink transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {checkingDelete ? (
                                <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs font-mono text-hm-muted">
                                    <Loader2 className="w-6 h-6 animate-spin text-hm-accent" />
                                    <span>Prüfe Historie und Mietverträge...</span>
                                </div>
                            ) : deleteCheckResult && !deleteCheckResult.canDelete ? (
                                <div className="space-y-3">
                                    <div className="p-3 rounded-[var(--hm-radius-input)] bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-800 dark:text-amber-300">
                                        <div className="font-bold flex items-center gap-1.5 mb-1">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                            <span>Fahrzeug besitzt verknüpfte Datensätze:</span>
                                        </div>
                                        <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px]">
                                            {deleteCheckResult.rentalCount > 0 && (
                                                <li>{deleteCheckResult.rentalCount} Mietverträge / Buchungen</li>
                                            )}
                                            {deleteCheckResult.maintenanceCount > 0 && (
                                                <li>{deleteCheckResult.maintenanceCount} Wartungs- / Werkstatteinträge</li>
                                            )}
                                            {deleteCheckResult.damageCount > 0 && (
                                                <li>{deleteCheckResult.damageCount} Schadensmeldungen</li>
                                            )}
                                        </ul>
                                    </div>
                                    <p className="text-xs text-hm-muted">
                                        Aus buchhalterischen und steuerrechtlichen Gründen kann dieses Fahrzeug nicht endgültig gelöscht werden. Sie können es stattdessen <strong>archivieren (deaktivieren)</strong>. Es steht dann nicht mehr zur Vermietung bereit.
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-hm-muted">
                                    Dieses Fahrzeug hat keine verknüpften Buchungen. Möchten Sie <strong>{carToDelete.brand} {carToDelete.model} ({carToDelete.plate})</strong> wirklich endgültig aus der Flotte löschen?
                                </p>
                            )}

                            {/* Modal Actions */}
                            <div className="pt-3 border-t border-hm-rule flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setCarToDelete(null)}
                                    disabled={isDeleting}
                                    className="px-3.5 py-2 rounded-[var(--hm-radius-input)] font-mono text-xs uppercase tracking-wider text-hm-muted hover:text-hm-ink transition-colors"
                                >
                                    Abbrechen
                                </button>

                                {deleteCheckResult && !deleteCheckResult.canDelete ? (
                                    <button
                                        type="button"
                                        onClick={handleConfirmArchive}
                                        disabled={isDeleting}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--hm-radius-input)] bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-xs transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                                        <span>Fahrzeug archivieren</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleConfirmDelete}
                                        disabled={isDeleting}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--hm-radius-input)] bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-xs transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                        <span>Endgültig löschen</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== FAHRTENBUCH MODAL ===== */}
            {fahrtenbuchCar && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setFahrtenbuchCar(null)}>
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-2xl w-full max-w-md border border-hm-rule text-hm-ink overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper-2">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-hm-paper border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)]">
                                    <BookOpen className="w-4 h-4 text-hm-accent" />
                                </div>
                                <div>
                                    <h2 className="hm-display text-sm font-bold text-hm-ink tracking-tight">Fahrtenbuch</h2>
                                    <p className="text-[11px] font-mono text-hm-muted">{fahrtenbuchCar.brand} {fahrtenbuchCar.model} · {fahrtenbuchCar.plate}</p>
                                </div>
                            </div>
                            <button onClick={() => setFahrtenbuchCar(null)} className="p-1 text-hm-muted hover:text-hm-ink transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleFahrtenbuchSubmit} className="p-5 space-y-4">
                            <input type="hidden" name="carId" value={fahrtenbuchCar.id} />

                            {formError && <p className="text-xs font-mono text-red-600 bg-red-500/10 px-3 py-2 rounded border border-red-500/20">{formError}</p>}
                            {formSuccess && <p className="text-xs font-mono text-emerald-600 bg-emerald-500/10 px-3 py-2 rounded border border-emerald-500/20">{formSuccess}</p>}

                            <div>
                                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Datum</label>
                                <input name="datum" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Start km</label>
                                    <input name="startKm" type="number" required min={0} defaultValue={fahrtenbuchCar.currentMileage || 0} className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Ende km</label>
                                    <input name="endKm" type="number" required min={0} defaultValue={(fahrtenbuchCar.currentMileage || 0) + 10} className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Zweck</label>
                                    <select name="zweck" className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors">
                                        <option value="DIENSTFAHRT">Dienstfahrt</option>
                                        <option value="PRIVATFAHRT">Privatfahrt</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Fahrtzweck</label>
                                    <input name="fahrtzweck" type="text" className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" placeholder="z.B. Feldkirch – Wien" />
                                </div>
                            </div>

                            <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-hm-accent-ink disabled:opacity-50 transition-colors shadow-xs">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Speichern
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== WARTUNG MODAL ===== */}
            {wartungCar && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setWartungCar(null)}>
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-2xl w-full max-w-md border border-hm-rule text-hm-ink max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-hm-rule flex items-center justify-between sticky top-0 bg-hm-paper-2 z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-hm-paper border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)]">
                                    <Wrench className="w-4 h-4 text-hm-accent" />
                                </div>
                                <div>
                                    <h2 className="hm-display text-sm font-bold text-hm-ink tracking-tight">Wartung eintragen</h2>
                                    <p className="text-[11px] font-mono text-hm-muted">{wartungCar.brand} {wartungCar.model} · {wartungCar.plate}</p>
                                </div>
                            </div>
                            <button onClick={() => setWartungCar(null)} className="p-1 text-hm-muted hover:text-hm-ink transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleWartungSubmit} className="p-5 space-y-4">
                            <input type="hidden" name="carId" value={wartungCar.id} />

                            {formError && <p className="text-xs font-mono text-red-600 bg-red-500/10 px-3 py-2 rounded border border-red-500/20">{formError}</p>}
                            {formSuccess && <p className="text-xs font-mono text-emerald-600 bg-emerald-500/10 px-3 py-2 rounded border border-emerald-500/20">{formSuccess}</p>}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Art der Wartung</label>
                                    <select name="maintenanceType" required className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors">
                                        <option value="Oil Change">Ölwechsel</option>
                                        <option value="Tire Change">Reifenwechsel</option>
                                        <option value="Inspection">Inspektion / TÜV (§57a)</option>
                                        <option value="Repair">Reparatur</option>
                                        <option value="Service">Service</option>
                                        <option value="Other">Sonstiges</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Datum</label>
                                    <input name="performedDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Beschreibung</label>
                                <input name="description" type="text" required className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" placeholder="z.B. Bremsbeläge vorne gewechselt" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Kosten (€)</label>
                                    <input name="cost" type="number" step="0.01" className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Kilometerstand</label>
                                    <input name="mileage" type="number" defaultValue={wartungCar.currentMileage || 0} className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Durchgeführt von</label>
                                <input name="performedBy" type="text" className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" placeholder="Werkstatt / Person" />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Notizen</label>
                                <textarea name="notes" rows={2} className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors resize-none"></textarea>
                            </div>

                            <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-hm-accent-ink disabled:opacity-50 transition-colors shadow-xs">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Speichern
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
