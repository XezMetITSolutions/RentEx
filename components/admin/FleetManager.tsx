'use client';

import { useState, useMemo, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Search, MapPin, Fuel, Calendar,
    Settings2, Car as CarIcon,
    Edit2, LayoutGrid, List,
    BookOpen, Wrench, X, Save, Loader2,
    Tag
} from 'lucide-react';
import { DeleteCarButton } from '@/app/admin/fleet/DeleteCarButton';
import { CategoriesModal } from '@/components/admin/CategoriesModal';

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
    
    // Use global categories if available, otherwise fallback to existing car categories
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'NeedsRepair': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            case 'Maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'Rented': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'Reserved': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Active': return 'Verfügbar';
            case 'NeedsRepair': return '⚠️ Reparatur';
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
                    setTimeout(() => {
                        setFahrtenbuchCar(null);
                        setFormSuccess(null);
                    }, 1500);
                }
            } catch {
                setFormError('Fehler beim Speichern.');
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
                        description: formData.get('description'),
                        performedDate: formData.get('performedDate'),
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
                    }, 1500);
                }
            } catch {
                setFormError('Fehler beim Speichern.');
            }
        });
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-10 px-4 sm:px-6">
            {/* Header Area (Clean SaaS Style) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <CarIcon className="w-6 h-6 text-gray-400" />
                        Fahrzeugflotte
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs rounded-md font-medium border border-gray-200 dark:border-gray-700">
                            {filteredCars.length} Fahrzeuge
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verwalten Sie Ihre Fahrzeuge, Status und Standorte zentral.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    <Link href="/admin/fleet/new" className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium transition-colors shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100">
                        <PlusIcon className="w-4 h-4" />
                        Neues Fahrzeug
                    </Link>
                    <button
                        type="button"
                        onClick={() => setCategoriesModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
                    >
                        <Tag className="w-4 h-4" />
                        Kategorien
                    </button>
                </div>
            </div>

            <CategoriesModal isOpen={categoriesModalOpen} onClose={() => setCategoriesModalOpen(false)} />

            {/* Filters Area (Clean & Functional) */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Suchen (Kennzeichen, Modell, VIN)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm transition-all"
                    >
                        <option value="all">Alle Status</option>
                        <option value="Active">Verfügbar</option>
                        <option value="NeedsRepair">⚠️ Reparatur erforderlich</option>
                        <option value="Maintenance">Wartung</option>
                        <option value="Rented">Vermietet</option>
                        <option value="Reserved">Reserviert</option>
                        <option value="Inactive">Inaktiv</option>
                    </select>

                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm transition-all"
                    >
                        <option value="all">Alle Marken</option>
                        {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm transition-all"
                    >
                        <option value="all">Alle Kategorien</option>
                        {categories.map(cat => <option key={cat as string} value={cat as string}>{cat}</option>)}
                    </select>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={fuelFilter}
                            onChange={(e) => setFuelFilter(e.target.value)}
                            className="px-3 py-1.5 bg-transparent border-none text-sm font-medium text-gray-600 dark:text-gray-400 focus:ring-0 outline-none cursor-pointer hover:text-gray-900 dark:hover:text-white"
                        >
                            <option value="all">Alle Kraftstoffe</option>
                            {fuelTypes.map(fuel => <option key={fuel} value={fuel}>{fuel}</option>)}
                        </select>

                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="px-3 py-1.5 bg-transparent border-none text-sm font-medium text-gray-600 dark:text-gray-400 focus:ring-0 outline-none cursor-pointer hover:text-gray-900 dark:hover:text-white"
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
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                        Filter zurücksetzen
                    </button>
                </div>
            </div>

            {/* List View (Clean Table) */}
            {viewMode === 'list' && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Fahrzeug</th>
                                    <th className="px-6 py-3 font-medium">Kennzeichen / VIN</th>
                                    <th className="px-6 py-3 font-medium">Kategorie & Status</th>
                                    <th className="px-6 py-3 font-medium">Standort</th>
                                    <th className="px-6 py-3 font-medium">Technische Daten</th>
                                    <th className="px-6 py-3 font-medium text-right">Tagespreis</th>
                                    <th className="px-6 py-3 font-medium text-right">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredCars.map((car) => (
                                    <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/fleet/${car.id}`} className="flex items-center gap-4 group">
                                                <div className="relative w-12 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0">
                                                    {car.imageUrl ? (
                                                        <Image src={car.imageUrl} alt={car.model} fill className="object-cover transition-transform group-hover:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <CarIcon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{car.brand} {car.model}</div>
                                                    <div className="text-xs text-gray-500">{car.year} • {car.color}</div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-700 dark:text-gray-300">{car.plate}</div>
                                            {car.vin && <div className="text-[10px] text-gray-400 font-mono mt-0.5" title={car.vin}>{car.vin.substring(0, 8)}...</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                {car.category && (
                                                    <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                                        {car.category}
                                                    </div>
                                                )}
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border ${getStatusColor(car.status)}`}>
                                                    <div className="w-1 h-1 rounded-full bg-current"></div>
                                                    {getStatusLabel(car.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{car.currentLocation?.name || car.homeLocation?.name || '–'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1 text-xs text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Fuel className="w-3 h-3 text-gray-400" /> {car.fuelType}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Settings2 className="w-3 h-3 text-gray-400" /> {car.transmission || '–'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                €{Number(car.dailyRate).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => { setFahrtenbuchCar(car); setFormError(null); setFormSuccess(null); }}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                    title="Fahrtenbuch"
                                                >
                                                    <BookOpen className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setWartungCar(car); setFormError(null); setFormSuccess(null); }}
                                                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                    title="Wartung"
                                                >
                                                    <Wrench className="w-4 h-4" />
                                                </button>
                                                <Link href={`/admin/fleet/${car.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
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
                            <div className="py-20 text-center text-gray-500">
                                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Keine Fahrzeuge gefunden</p>
                                <p className="text-xs text-gray-500 mt-1">Versuchen Sie es mit anderen Filter-Einstellungen.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Grid View (Clean Cards) */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCars.map((car) => (
                        <div key={car.id} className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all">
                            <Link href={`/admin/fleet/${car.id}`} className="aspect-[16/10] bg-gray-100 dark:bg-gray-800 relative block overflow-hidden">
                                {car.imageUrl ? (
                                    <Image
                                        src={car.imageUrl}
                                        alt={`${car.brand} ${car.model}`}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <CarIcon className="h-12 w-12" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border shadow-sm ${getStatusColor(car.status)}`}>
                                        {getStatusLabel(car.status)}
                                    </span>
                                </div>
                            </Link>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <Link href={`/admin/fleet/${car.id}`} className="group/title">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover/title:text-blue-600 transition-colors">{car.brand} {car.model}</h3>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{car.plate}</p>
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{car.year}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <Fuel className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{car.fuelType}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <Settings2 className="h-3.5 w-3.5 text-gray-400" />
                                        <span>{car.transmission || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                        <span className="truncate">{car.currentLocation?.name ?? car.homeLocation?.name ?? '–'}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Tagespreis</p>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            €{Number(car.dailyRate).toLocaleString('de-AT', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => { setFahrtenbuchCar(car); setFormError(null); setFormSuccess(null); }}
                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                            title="Fahrtenbuch"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { setWartungCar(car); setFormError(null); setFormSuccess(null); }}
                                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                            title="Wartung"
                                        >
                                            <Wrench className="w-4 h-4" />
                                        </button>
                                        <Link
                                            href={`/admin/fleet/${car.id}`}
                                            className="flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== FAHRTENBUCH MODAL (Professional Redesign) ===== */}
            {fahrtenbuchCar && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setFahrtenbuchCar(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Fahrtenbuch</h2>
                                    <p className="text-xs text-gray-500">{fahrtenbuchCar.brand} {fahrtenbuchCar.model} · {fahrtenbuchCar.plate}</p>
                                </div>
                            </div>
                            <button onClick={() => setFahrtenbuchCar(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleFahrtenbuchSubmit} className="p-6 space-y-5">
                            <input type="hidden" name="carId" value={fahrtenbuchCar.id} />

                            {formError && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30">{formError}</p>}
                            {formSuccess && <p className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">{formSuccess}</p>}

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Datum</label>
                                <input name="datum" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Start km</label>
                                    <input name="startKm" type="number" required min={0} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ende km</label>
                                    <input name="endKm" type="number" required min={0} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Zweck</label>
                                    <select name="zweck" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all">
                                        <option value="DIENSTFAHRT">Dienstfahrt</option>
                                        <option value="PRIVATFAHRT">Privatfahrt</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fahrtzweck</label>
                                    <input name="fahrtzweck" type="text" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" placeholder="z.B. Feldkirch – Wien" />
                                </div>
                            </div>

                            <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-all shadow-sm">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Speichern
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== WARTUNG MODAL (Professional Redesign) ===== */}
            {wartungCar && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setWartungCar(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg">
                                    <Wrench className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">Wartung eintragen</h2>
                                    <p className="text-xs text-gray-500">{wartungCar.brand} {wartungCar.model} · {wartungCar.plate}</p>
                                </div>
                            </div>
                            <button onClick={() => setWartungCar(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleWartungSubmit} className="p-6 space-y-5">
                            <input type="hidden" name="carId" value={wartungCar.id} />

                            {formError && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30">{formError}</p>}
                            {formSuccess && <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-900/30">{formSuccess}</p>}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Art der Wartung</label>
                                    <select name="maintenanceType" required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all">
                                        <option value="Oil Change">Ölwechsel</option>
                                        <option value="Tire Change">Reifenwechsel</option>
                                        <option value="Inspection">Inspektion</option>
                                        <option value="Repair">Reparatur</option>
                                        <option value="Service">Service</option>
                                        <option value="Other">Sonstiges</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Datum</label>
                                    <input name="performedDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Beschreibung</label>
                                <input name="description" type="text" required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all" placeholder="z.B. Bremsbeläge vorne gewechselt" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kosten (€)</label>
                                    <input name="cost" type="number" step="0.01" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kilometerstand</label>
                                    <input name="mileage" type="number" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Durchgeführt von</label>
                                <input name="performedBy" type="text" className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all" placeholder="Werkstatt / Person" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notizen</label>
                                <textarea name="notes" rows={2} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all resize-none"></textarea>
                            </div>

                            <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-all shadow-sm">
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

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
