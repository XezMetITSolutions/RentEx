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

export function FleetManager({ initialCars }: { initialCars: Car[] }) {
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
    const categories = useMemo(() => Array.from(new Set(initialCars.map(c => c.category).filter(Boolean))).sort(), [initialCars]);
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
            case 'Maintenance': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            case 'Rented': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'Reserved': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Active': return 'Verfügbar';
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
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CarIcon className="w-6 h-6 text-red-600" />
                        Fahrzeugflotte ({filteredCars.length})
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verwalten Sie Ihre Fahrzeuge, Status und Standorte.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    <Link href="/admin/fleet/new" className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95">
                        <PlusIcon className="w-4 h-4" />
                        Neues Fahrzeug
                    </Link>
                    <button
                        type="button"
                        onClick={() => setCategoriesModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    >
                        <Tag className="w-4 h-4" />
                        Kategorien
                    </button>
                </div>
            </div>

            <CategoriesModal isOpen={categoriesModalOpen} onClose={() => setCategoriesModalOpen(false)} />

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Suchen (Kennzeichen, Modell, VIN)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    >
                        <option value="all">Alle Status</option>
                        <option value="Active">Verfügbar</option>
                        <option value="Maintenance">Wartung</option>
                        <option value="Rented">Vermietet</option>
                        <option value="Reserved">Reserviert</option>
                        <option value="Inactive">Inaktiv</option>
                    </select>

                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    >
                        <option value="all">Alle Marken</option>
                        {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    >
                        <option value="all">Alle Kategorien</option>
                        {categories.map(cat => <option key={cat as string} value={cat as string}>{cat}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <select
                        value={fuelFilter}
                        onChange={(e) => setFuelFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                    >
                        <option value="all">Alle Kraftstoffarten</option>
                        {fuelTypes.map(fuel => <option key={fuel} value={fuel}>{fuel}</option>)}
                    </select>

                    <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                    >
                        <option value="all">Alle Standorte</option>
                        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>

                    <div className="flex justify-end items-center">
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                                setBrandFilter('all');
                                setCategoryFilter('all');
                                setFuelFilter('all');
                                setLocationFilter('all');
                            }}
                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                            Filters zurücksetzen
                        </button>
                    </div>
                </div>
            </div>

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fahrzeug</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kennzeichen / VIN</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategorie & Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Standort</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Technische Daten</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Tagespreis</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredCars.map((car) => (
                                    <tr key={car.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/fleet/${car.id}`} className="flex items-center gap-4 group/item">
                                                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                                                    {car.imageUrl ? (
                                                        <Image src={car.imageUrl} alt={car.model} fill className="object-cover transition-transform group-hover/item:scale-110" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <CarIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white group-hover/item:text-red-600 transition-colors">{car.brand} {car.model}</div>
                                                    <div className="text-xs text-gray-500">{car.year} • {car.color}</div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300">{car.plate}</div>
                                            {car.vin && <div className="text-[10px] text-gray-400 font-mono mt-0.5" title={car.vin}>{car.vin.substring(0, 8)}...</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                {car.category && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                        {car.category}
                                                    </span>
                                                )}
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(car.status)}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                                    {getStatusLabel(car.status)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{car.currentLocation?.name || car.homeLocation?.name || '–'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Fuel className="w-3 h-3" /> {car.fuelType}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Settings2 className="w-3 h-3" /> {car.transmission || '–'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(car.dailyRate))}
                                            </div>
                                            <div className="text-[10px] text-gray-400">pro Tag</div>
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
                                                <div className="scale-90 origin-right">
                                                    <DeleteCarButton carId={car.id} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCars.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center gap-3">
                                                <Search className="w-8 h-8 text-gray-300" />
                                                <p>Keine Fahrzeuge gefunden, die den Filtern entsprechen.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCars.map((car) => (
                        <div key={car.id} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 transition-all hover:shadow-md">
                            <Link href={`/admin/fleet/${car.id}`} className="aspect-video w-full bg-gray-100 dark:bg-gray-900 relative items-center justify-center text-gray-400 dark:text-gray-600 flex overflow-hidden">
                                {car.imageUrl ? (
                                    <Image
                                        src={car.imageUrl}
                                        alt={`${car.brand} ${car.model}`}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <CarIcon className="h-16 w-16 opacity-50" />
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm ${getStatusColor(car.status)}`}>
                                        {getStatusLabel(car.status)}
                                    </span>
                                </div>
                            </Link>

                            <div className="flex-1 p-5 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <Link href={`/admin/fleet/${car.id}`} className="group/title">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover/title:text-red-600 transition-colors">{car.brand} {car.model}</h3>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{car.plate}</p>
                                    </Link>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{car.year}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Fuel className="h-3.5 w-3.5" />
                                        <span>{car.fuelType}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Settings2 className="h-3.5 w-3.5" />
                                        <span>{car.transmission || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>{car.currentLocation?.name ?? car.homeLocation?.name ?? '–'}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Tagespreis</span>
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(car.dailyRate))}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => { setFahrtenbuchCar(car); setFormError(null); setFormSuccess(null); }}
                                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                            title="Fahrtenbuch"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { setWartungCar(car); setFormError(null); setFormSuccess(null); }}
                                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                            title="Wartung"
                                        >
                                            <Wrench className="w-4 h-4" />
                                        </button>
                                        <DeleteCarButton carId={car.id} />
                                        <Link
                                            href={`/admin/fleet/${car.id}`}
                                            className="rounded-lg bg-gray-900 dark:bg-white px-3 py-1.5 text-xs font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                        >
                                            Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== FAHRTENBUCH MODAL ===== */}
            {fahrtenbuchCar && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setFahrtenbuchCar(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-emerald-900/20 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Fahrtenbuch</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{fahrtenbuchCar.brand} {fahrtenbuchCar.model} · {fahrtenbuchCar.plate}</p>
                                </div>
                            </div>
                            <button onClick={() => setFahrtenbuchCar(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleFahrtenbuchSubmit} className="p-6 space-y-4">
                            <input type="hidden" name="carId" value={fahrtenbuchCar.id} />

                            {formError && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{formError}</p>}
                            {formSuccess && <p className="text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">{formSuccess}</p>}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum *</label>
                                <input name="datum" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start km *</label>
                                    <input name="startKm" type="number" required min={0} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ende km *</label>
                                    <input name="endKm" type="number" required min={0} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zweck *</label>
                                <select name="zweck" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white">
                                    <option value="DIENSTFAHRT">Dienstfahrt</option>
                                    <option value="PRIVATFAHRT">Privatfahrt</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fahrtzweck (z.B. Strecke)</label>
                                <input name="fahrtzweck" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white" placeholder="z.B. Feldkirch – Wien" />
                            </div>

                            <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-all">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Eintrag speichern
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== WARTUNG MODAL ===== */}
            {wartungCar && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setWartungCar(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/20 rounded-t-2xl sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                    <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Wartung eintragen</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{wartungCar.brand} {wartungCar.model} · {wartungCar.plate}</p>
                                </div>
                            </div>
                            <button onClick={() => setWartungCar(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleWartungSubmit} className="p-6 space-y-4">
                            <input type="hidden" name="carId" value={wartungCar.id} />

                            {formError && <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{formError}</p>}
                            {formSuccess && <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">{formSuccess}</p>}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Art der Wartung *</label>
                                <select name="maintenanceType" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white">
                                    <option value="Oil Change">Ölwechsel</option>
                                    <option value="Tire Change">Reifenwechsel</option>
                                    <option value="Inspection">Inspektion</option>
                                    <option value="Repair">Reparatur</option>
                                    <option value="Service">Service</option>
                                    <option value="Other">Sonstiges</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum der Durchführung *</label>
                                <input name="performedDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung *</label>
                                <input name="description" type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white" placeholder="z.B. Bremsbeläge vorne gewechselt" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kosten (€)</label>
                                    <input name="cost" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kilometerstand</label>
                                    <input name="mileage" type="number" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durchgeführt von</label>
                                <input name="performedBy" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white" placeholder="Werkstatt / Person" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notizen</label>
                                <textarea name="notes" rows={2} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-amber-500 dark:text-white resize-none"></textarea>
                            </div>

                            <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-60 transition-all">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Wartung speichern
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
