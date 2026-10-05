/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import { useState, useMemo, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Search, MapPin, Fuel, Calendar,
    Settings2, Car as CarIcon,
    Edit2, LayoutGrid, List,
    BookOpen, Wrench, X, Save, Loader2,
    Tag, Plus
} from 'lucide-react';
import { DeleteCarButton } from '@/app/admin/fleet/DeleteCarButton';
import { CategoriesModal } from '@/components/admin/CategoriesModal';
import { clsx } from 'clsx';

interface Car {
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
}

export function FleetManager({ initialCars, globalCategories = [] }: { initialCars: Car[], globalCategories?: {id: number, name: string}[] }) {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [brandFilter, setBrandFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [fuelFilter, setFuelFilter] = useState<string>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');

    // Modal States
    const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
    const [fahrtenbuchCar, setFahrtenbuchCar] = useState<Car | null>(null);
    const [wartungCar, setWartungCar] = useState<Car | null>(null);
    const [isPending, startTransition] = useTransition();
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    // Extract unique values for filters
    const brands = useMemo(() => Array.from(new Set(initialCars.map(c => c.brand))).sort(), [initialCars]);
    
    const categories = useMemo(() => {
        if (globalCategories && globalCategories.length > 0) {
            return globalCategories.map(c => c.name);
        }
        return Array.from(new Set(initialCars.map(c => c.category).filter(Boolean))).sort();
    }, [initialCars, globalCategories]);
    
    const fuelTypes = useMemo(() => Array.from(new Set(initialCars.map(c => c.fuelType))).sort(), [initialCars]);
    const locations = useMemo(() => {
        const locs = new Set<string>();
        initialCars.forEach(c => {
            if (c.currentLocation?.name) locs.add(c.currentLocation.name);
            if (c.homeLocation?.name) locs.add(c.homeLocation.name);
        });
        return Array.from(locs).sort();
    }, [initialCars]);

    const filteredCars = useMemo(() => {
        return initialCars.filter(car => {
            const matchesSearch =
                car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                car.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (car.vin && car.vin.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || car.status === statusFilter;
            const matchesBrand = brandFilter === 'all' || car.brand === brandFilter;
            const matchesCategory = categoryFilter === 'all' || car.category === categoryFilter;
            const matchesFuel = fuelFilter === 'all' || car.fuelType === fuelFilter;
            const matchesLocation = locationFilter === 'all' ||
                (car.currentLocation?.name === locationFilter || car.homeLocation?.name === locationFilter);

            return matchesSearch && matchesStatus && matchesBrand && matchesCategory && matchesFuel && matchesLocation;
        });
    }, [initialCars, searchQuery, statusFilter, brandFilter, categoryFilter, fuelFilter, locationFilter]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
            case 'NeedsRepair': return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
            case 'Maintenance': return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            case 'Rented': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'Reserved': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
            default: return 'bg-hm-paper-2 text-hm-muted border-hm-rule';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Active': return 'Verfügbar';
            case 'NeedsRepair': return 'Reparatur';
            case 'Maintenance': return 'Wartung';
            case 'Rented': return 'Vermietet';
            case 'Reserved': return 'Reserviert';
            case 'Inactive': return 'Inaktiv';
            default: return status;
        }
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
                    setTimeout(() => { setFahrtenbuchCar(null); setFormSuccess(null); }, 1200);
                }
            } catch (err: any) {
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
                    setTimeout(() => { setWartungCar(null); setFormSuccess(null); }, 1200);
                }
            } catch (err: any) {
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

                    <Link 
                        href="/admin/fleet/new" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Neues Fahrzeug
                    </Link>
                    <button
                        type="button"
                        onClick={() => setCategoriesModalOpen(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Tag className="w-3.5 h-3.5 text-hm-muted" />
                        Kategorien
                    </button>
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
                        <option value="all">Alle Status</option>
                        <option value="Active">Verfügbar</option>
                        <option value="NeedsRepair">Reparatur erforderlich</option>
                        <option value="Maintenance">Wartung</option>
                        <option value="Rented">Vermietet</option>
                        <option value="Reserved">Reserviert</option>
                        <option value="Inactive">Inaktiv</option>
                    </select>

                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                    >
                        <option value="all">Alle Marken</option>
                        {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                    >
                        <option value="all">Alle Kategorien</option>
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
                                    <th className="px-6 py-3 font-semibold">Standort</th>
                                    <th className="px-6 py-3 font-semibold">Antrieb</th>
                                    <th className="px-6 py-3 font-semibold text-right">Tagespreis</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {filteredCars.map((car) => (
                                    <tr key={car.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/fleet/${car.id}`} className="flex items-center gap-3.5 group">
                                                <div className="relative w-12 h-10 rounded-[var(--hm-radius-input)] overflow-hidden bg-hm-paper-2 border border-hm-rule shrink-0">
                                                    {car.imageUrl ? (
                                                        <Image src={car.imageUrl} alt={car.model} fill className="object-cover transition-transform group-hover:scale-105" />
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
                                                        {car.year} · {car.color}
                                                    </div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink-2 font-semibold">
                                                {car.plate}
                                            </span>
                                            {car.vin && (
                                                <div className="text-[10px] text-hm-muted mt-1" title={car.vin}>
                                                    VIN: {car.vin.substring(0, 8)}...
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {car.category && (
                                                    <div className="text-[10px] font-mono text-hm-muted uppercase tracking-wider">
                                                        {car.category}
                                                    </div>
                                                )}
                                                <span className={clsx(
                                                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] text-[10px] font-mono font-bold uppercase tracking-wider border',
                                                    getStatusBadge(car.status)
                                                )}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                    {getStatusLabel(car.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-hm-ink">
                                                <MapPin className="w-3.5 h-3.5 text-hm-muted shrink-0" />
                                                <span className="truncate">{car.currentLocation?.name || car.homeLocation?.name || '–'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-hm-muted">
                                            <div>{car.fuelType}</div>
                                            <div className="text-[11px]">{car.transmission || '–'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-hm-ink hm-tnum">
                                            €{Number(car.dailyRate).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
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
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <div className="scale-90 origin-right ml-1">
                                                    <DeleteCarButton carId={car.id} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                    {filteredCars.map((car) => (
                        <div key={car.id} className="group bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden hover:border-hm-rule-strong transition-colors flex flex-col justify-between">
                            <div>
                                <Link href={`/admin/fleet/${car.id}`} className="aspect-[16/10] bg-hm-stage relative block overflow-hidden">
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
                                    <div className="absolute top-2.5 right-2.5">
                                        <span className={clsx(
                                            'px-2 py-0.5 rounded-[var(--hm-radius-pill)] text-[9px] font-mono font-bold uppercase tracking-wider border shadow-xs',
                                            getStatusBadge(car.status)
                                        )}>
                                            {getStatusLabel(car.status)}
                                        </span>
                                    </div>
                                </Link>

                                <div className="p-4 space-y-3">
                                    <div>
                                        <Link href={`/admin/fleet/${car.id}`} className="group/title block">
                                            <h3 className="font-semibold text-hm-ink group-hover/title:text-hm-accent transition-colors truncate">
                                                {car.brand} {car.model}
                                            </h3>
                                            <div className="mt-1 font-mono text-[11px] px-2 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink-2 w-fit">
                                                {car.plate}
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
                                            <Settings2 className="h-3 w-3 shrink-0" />
                                            <span className="truncate">{car.transmission || '-'}</span>
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
                                        €{Number(car.dailyRate).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
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
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== FAHRTENBUCH MODAL ===== */}
            {fahrtenbuchCar && (
                <div className="fixed inset-0 bg-hm-ink/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setFahrtenbuchCar(null)}>
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-xl w-full max-w-md border border-hm-rule text-hm-ink overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-hm-paper-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)]">
                                    <BookOpen className="w-4 h-4" />
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
                                    <input name="startKm" type="number" required min={0} className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Ende km</label>
                                    <input name="endKm" type="number" required min={0} className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
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
                <div className="fixed inset-0 bg-hm-ink/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={() => setWartungCar(null)}>
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-xl w-full max-w-md border border-hm-rule text-hm-ink max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-hm-rule flex items-center justify-between sticky top-0 bg-hm-paper z-10">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-hm-paper-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)]">
                                    <Wrench className="w-4 h-4" />
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
                                        <option value="Inspection">Inspektion / TÜV</option>
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
                                    <input name="mileage" type="number" className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
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
