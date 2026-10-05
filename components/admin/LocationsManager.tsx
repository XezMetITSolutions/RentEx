/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Car,
    Plus,
    Edit2,
    Trash2,
    Eye,
    Search,
    ExternalLink,
    ArrowUpRight,
    SlidersHorizontal,
    LayoutGrid,
    List,
    AlertCircle,
    CheckCircle2,
    Loader2,
    X,
    CalendarCheck,
    Navigation,
    ShieldAlert,
    RotateCcw
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

export interface LocationItem {
    id: number;
    name: string;
    code: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    latitude: number | null;
    longitude: number | null;
    openingTime: string | null;
    closingTime: string | null;
    isOpenSundays: boolean;
    status: string;
    totalVehicles: number;
    availableVehicles: number;
    rentedVehicles: number;
    pickupsCount: number;
    returnsCount: number;
    staff?: { id: number; name: string; role: string }[];
}

interface LocationsManagerProps {
    initialLocations: LocationItem[];
    isSup: boolean;
    isRestricted?: boolean;
}

export function LocationsManager({
    initialLocations,
    isSup,
    isRestricted = false
}: LocationsManagerProps) {
    const [locations, setLocations] = useState<LocationItem[]>(initialLocations);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [cityFilter, setCityFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // Delete modal states
    const [deleteModalLocation, setDeleteModalLocation] = useState<LocationItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Status toggle loading state
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    // Unique cities for filter
    const cities = useMemo(() => {
        const unique = new Set<string>();
        locations.forEach(loc => {
            if (loc.city) unique.add(loc.city);
        });
        return Array.from(unique).sort();
    }, [locations]);

    // Filtered locations
    const filteredLocations = useMemo(() => {
        return locations.filter(loc => {
            const matchesSearch =
                loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (loc.code && loc.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (loc.city && loc.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (loc.address && loc.address.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus =
                statusFilter === 'all' || loc.status === statusFilter;

            const matchesCity =
                cityFilter === 'all' || loc.city === cityFilter;

            return matchesSearch && matchesStatus && matchesCity;
        });
    }, [locations, searchQuery, statusFilter, cityFilter]);

    // Aggregates for top stats
    const stats = useMemo(() => {
        const total = locations.length;
        const totalVehicles = locations.reduce((sum, l) => sum + l.totalVehicles, 0);
        const availableVehicles = locations.reduce((sum, l) => sum + l.availableVehicles, 0);
        const rentedVehicles = locations.reduce((sum, l) => sum + l.rentedVehicles, 0);
        const activeLocations = locations.filter(l => l.status === 'active').length;
        const totalPickups = locations.reduce((sum, l) => sum + l.pickupsCount, 0);
        const totalReturns = locations.reduce((sum, l) => sum + l.returnsCount, 0);

        return {
            total,
            totalVehicles,
            availableVehicles,
            rentedVehicles,
            activeLocations,
            totalPickups,
            totalReturns
        };
    }, [locations]);

    // Google Maps link generator
    const getGoogleMapsUrl = (location: LocationItem) => {
        if (location.latitude && location.longitude) {
            return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
        }
        const query = [location.address, location.city, location.country].filter(Boolean).join(', ');
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || location.name)}`;
    };

    // Quick status toggle
    const handleToggleStatus = async (location: LocationItem) => {
        if (!isSup) return;
        const nextStatus = location.status === 'active' ? 'inactive' : 'active';
        setUpdatingStatusId(location.id);

        try {
            const res = await fetch(`/api/locations/${location.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: location.name,
                    code: location.code,
                    address: location.address,
                    city: location.city,
                    country: location.country,
                    phone: location.phone,
                    email: location.email,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    openingTime: location.openingTime,
                    closingTime: location.closingTime,
                    isOpenSundays: location.isOpenSundays,
                    status: nextStatus
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Status konnte nicht aktualisiert werden');
            }

            setLocations(prev =>
                prev.map(l => (l.id === location.id ? { ...l, status: nextStatus } : l))
            );
            toast.success(`Standort "${location.name}" ist nun ${nextStatus === 'active' ? 'Aktiv' : 'Inaktiv'}.`);
        } catch (err: any) {
            toast.error(err.message || 'Fehler beim Aktualisieren des Status');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // Execute deletion after modal confirmation
    const handleConfirmDelete = async () => {
        if (!deleteModalLocation) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/locations/${deleteModalLocation.id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Fehler beim Löschen des Standorts');
            }

            toast.success(`Standort "${deleteModalLocation.name}" wurde erfolgreich gelöscht.`);
            setLocations(prev => prev.filter(l => l.id !== deleteModalLocation.id));
            setDeleteModalLocation(null);
        } catch (err: any) {
            toast.error(err.message || 'Fehler beim Löschen des Standorts');
        } finally {
            setIsDeleting(false);
        }
    };

    const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || cityFilter !== 'all';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-hm-ink tracking-tight">Standorte</h1>
                    <p className="mt-1 text-sm text-hm-muted">
                        Verwalten Sie Ihre Vermietungsfilialen, Fuhrparkzuweisungen und Öffnungszeiten.
                    </p>
                </div>
                {isSup && (
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/locations/assign-cars"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper text-hm-ink hover:bg-hm-paper-2 hover:border-hm-muted text-sm font-medium transition-all shadow-sm"
                            title="Fahrzeuge Standorten zuweisen"
                        >
                            <Car className="w-4 h-4 text-hm-muted" />
                            <span>Fahrzeuge zuweisen</span>
                        </Link>
                        <Link
                            href="/admin/locations/new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--hm-radius-input)] bg-hm-accent text-white font-medium text-sm hover:bg-hm-accent-hover transition-all shadow-sm shadow-hm-accent/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Neuer Standort</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* Top Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 sm:p-5 border border-hm-rule shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">Standorte</span>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <MapPin className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-hm-ink mt-2 font-mono">{stats.total}</p>
                    <p className="text-xs text-hm-muted mt-1">
                        {stats.activeLocations} aktiv · {stats.total - stats.activeLocations} inaktiv
                    </p>
                </div>

                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 sm:p-5 border border-hm-rule shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">Fuhrpark Vor Ort</span>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Car className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-hm-ink mt-2 font-mono">{stats.totalVehicles}</p>
                    <p className="text-xs text-hm-muted mt-1">
                        {stats.availableVehicles} verfügbar · {stats.rentedVehicles} vermietet
                    </p>
                </div>

                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 sm:p-5 border border-hm-rule shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">Geöffnete Filialen</span>
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-hm-ink mt-2 font-mono">{stats.activeLocations}</p>
                    <p className="text-xs text-hm-muted mt-1">
                        Betriebsbereite Standorte
                    </p>
                </div>

                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 sm:p-5 border border-hm-rule shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">Buchungen</span>
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <CalendarCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-hm-ink mt-2 font-mono">
                        {stats.totalPickups + stats.totalReturns}
                    </p>
                    <p className="text-xs text-hm-muted mt-1">
                        {stats.totalPickups} Abholungen · {stats.totalReturns} Rückgaben
                    </p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 border border-hm-rule shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Standort suchen (Name, Stadt, Code, Adresse)..."
                            className="w-full h-10 pl-10 pr-4 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 text-hm-ink placeholder:text-hm-muted text-sm focus:outline-none focus:border-hm-accent focus:ring-1 focus:ring-hm-accent transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-hm-muted hover:text-hm-ink p-1"
                                title="Suche löschen"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Filters */}
                        <div className="inline-flex rounded-[var(--hm-radius-input)] p-1 bg-hm-paper-2 border border-hm-rule text-xs font-medium">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={clsx(
                                    "px-3 py-1.5 rounded-md transition-all",
                                    statusFilter === 'all'
                                        ? "bg-hm-paper text-hm-ink font-semibold shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Alle ({locations.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('active')}
                                className={clsx(
                                    "px-3 py-1.5 rounded-md transition-all",
                                    statusFilter === 'active'
                                        ? "bg-hm-paper text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Aktiv ({locations.filter(l => l.status === 'active').length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('inactive')}
                                className={clsx(
                                    "px-3 py-1.5 rounded-md transition-all",
                                    statusFilter === 'inactive'
                                        ? "bg-hm-paper text-amber-600 dark:text-amber-400 font-semibold shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Inaktiv ({locations.filter(l => l.status === 'inactive').length})
                            </button>
                        </div>

                        {/* City Filter */}
                        {cities.length > 1 && (
                            <select
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                className="h-9 px-3 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 text-hm-ink text-xs font-medium focus:outline-none focus:border-hm-accent"
                            >
                                <option value="all">Alle Städte</option>
                                {cities.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        )}

                        {/* View Mode Toggle */}
                        <div className="hidden sm:inline-flex rounded-[var(--hm-radius-input)] p-1 bg-hm-paper-2 border border-hm-rule">
                            <button
                                onClick={() => setViewMode('list')}
                                className={clsx(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'list'
                                        ? "bg-hm-paper text-hm-ink shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                                title="Listenansicht"
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={clsx(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === 'grid'
                                        ? "bg-hm-paper text-hm-ink shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                                title="Kartenansicht"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Reset Filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                    setCityFilter('all');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--hm-radius-input)] text-xs text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 transition-all"
                                title="Filter zurücksetzen"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {filteredLocations.length === 0 ? (
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-12 text-center border border-hm-rule shadow-sm">
                    <MapPin className="mx-auto h-12 w-12 text-hm-muted/50" />
                    <h3 className="mt-3 text-base font-semibold text-hm-ink">Keine Standorte gefunden</h3>
                    <p className="mt-1 text-sm text-hm-muted max-w-sm mx-auto">
                        {hasActiveFilters
                            ? "Keine Standorte stimmen mit Ihren aktuellen Such- und Filterkriterien überein."
                            : (isRestricted
                                ? "Ihrem Konto ist derzeit kein Standort zugewiesen."
                                : "Erstellen Sie Ihren ersten Standort, um loszulegen.")
                        }
                    </p>
                    {hasActiveFilters ? (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                                setCityFilter('all');
                            }}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink text-sm font-medium hover:bg-hm-paper-3 transition-colors border border-hm-rule"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Filter zurücksetzen
                        </button>
                    ) : isSup ? (
                        <div className="mt-5">
                            <Link
                                href="/admin/locations/new"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--hm-radius-input)] bg-hm-accent text-white font-medium text-sm hover:bg-hm-accent-hover transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Neuer Standort
                            </Link>
                        </div>
                    ) : null}
                </div>
            ) : viewMode === 'list' ? (
                /* List View */
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule shadow-sm overflow-hidden divide-y divide-hm-rule">
                    <div className="px-6 py-3.5 bg-hm-paper-2/60 border-b border-hm-rule flex items-center justify-between text-xs font-mono uppercase tracking-wider text-hm-muted">
                        <span>{isRestricted ? "Mein Standort" : `Alle Standorte (${filteredLocations.length})`}</span>
                        <span className="hidden md:inline">Fuhrpark & Schnellaktionen</span>
                    </div>

                    {filteredLocations.map((location) => {
                        const isUpdatingStatus = updatingStatusId === location.id;

                        return (
                            <div
                                key={location.id}
                                className="p-5 sm:p-6 hover:bg-hm-paper-2/40 transition-colors"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                                    {/* Left Details */}
                                    <div className="flex-1 space-y-3">
                                        {/* Title & Status */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Link
                                                href={`/admin/locations/${location.id}`}
                                                className="text-lg font-bold text-hm-ink hover:text-hm-accent transition-colors flex items-center gap-2 group"
                                            >
                                                <span>{location.name}</span>
                                                <ArrowUpRight className="w-4 h-4 text-hm-muted group-hover:text-hm-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </Link>

                                            {/* Status Badge with toggle for admin */}
                                            {isSup ? (
                                                <button
                                                    onClick={() => handleToggleStatus(location)}
                                                    disabled={isUpdatingStatus}
                                                    className={clsx(
                                                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:shadow-xs',
                                                        location.status === 'active'
                                                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
                                                        isUpdatingStatus && 'opacity-60 cursor-wait'
                                                    )}
                                                    title={`Klicken, um auf ${location.status === 'active' ? 'Inaktiv' : 'Aktiv'} umzuschalten`}
                                                >
                                                    {isUpdatingStatus ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <span className={clsx(
                                                            'w-1.5 h-1.5 rounded-full',
                                                            location.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                                                        )} />
                                                    )}
                                                    <span>{location.status === 'active' ? 'Aktiv' : 'Inaktiv'}</span>
                                                </button>
                                            ) : (
                                                <span className={clsx(
                                                    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                                                    location.status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                                                )}>
                                                    <span className={clsx(
                                                        'w-1.5 h-1.5 rounded-full',
                                                        location.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                                                    )} />
                                                    {location.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                                                </span>
                                            )}

                                            {location.code && (
                                                <span className="text-xs text-hm-muted font-mono bg-hm-paper-2 px-2 py-0.5 rounded-md border border-hm-rule">
                                                    #{location.code}
                                                </span>
                                            )}
                                        </div>

                                        {/* Metadata row */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                            {/* Address & Google Maps */}
                                            {location.address && (
                                                <a
                                                    href={getGoogleMapsUrl(location)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-start gap-2 text-hm-ink hover:text-hm-accent group transition-colors"
                                                    title="In Google Maps öffnen"
                                                >
                                                    <MapPin className="w-4 h-4 text-hm-muted group-hover:text-hm-accent mt-0.5 flex-shrink-0 transition-colors" />
                                                    <div className="text-xs">
                                                        <div className="font-medium flex items-center gap-1">
                                                            <span>{location.address}</span>
                                                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        {location.city && (
                                                            <div className="text-hm-muted">
                                                                {location.city}, {location.country}
                                                            </div>
                                                        )}
                                                    </div>
                                                </a>
                                            )}

                                            {/* Phone & Email */}
                                            <div className="space-y-1 text-xs">
                                                {location.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3.5 h-3.5 text-hm-muted flex-shrink-0" />
                                                        <a
                                                            href={`tel:${location.phone}`}
                                                            className="text-hm-ink hover:text-hm-accent font-medium hover:underline transition-colors"
                                                        >
                                                            {location.phone}
                                                        </a>
                                                    </div>
                                                )}
                                                {location.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3.5 h-3.5 text-hm-muted flex-shrink-0" />
                                                        <a
                                                            href={`mailto:${location.email}`}
                                                            className="text-hm-muted hover:text-hm-ink hover:underline transition-colors"
                                                        >
                                                            {location.email}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Hours */}
                                            {location.openingTime && location.closingTime && (
                                                <div className="flex items-start gap-2 text-xs">
                                                    <Clock className="w-3.5 h-3.5 text-hm-muted mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <div className="text-hm-ink font-medium">
                                                            {location.openingTime} - {location.closingTime}
                                                        </div>
                                                        <div className="text-hm-muted">
                                                            {location.isOpenSundays ? 'So geöffnet' : 'So geschlossen'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Actions & Badges */}
                                    <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-hm-rule">
                                        {/* Direct Fleet Link */}
                                        <Link
                                            href={`/admin/fleet?location=${encodeURIComponent(location.name)}`}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper-2 hover:bg-hm-paper-3 border border-hm-rule text-hm-ink hover:text-hm-accent text-xs font-semibold transition-all group shadow-2xs"
                                            title="Alle Fahrzeuge dieses Standorts in der Flotte anzeigen"
                                        >
                                            <Car className="w-3.5 h-3.5 text-hm-muted group-hover:text-hm-accent transition-colors" />
                                            <span>{location.totalVehicles} Fahrzeug{location.totalVehicles !== 1 ? 'e' : ''}</span>
                                            <ArrowUpRight className="w-3 h-3 text-hm-muted group-hover:text-hm-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </Link>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-1.5">
                                            <Link
                                                href={`/admin/locations/${location.id}`}
                                                className="p-2 text-hm-muted hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-[var(--hm-radius-input)] transition-colors"
                                                title="Details ansehen"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>

                                            {isSup && (
                                                <>
                                                    <Link
                                                        href={`/admin/locations/${location.id}/edit`}
                                                        className="p-2 text-hm-muted hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-[var(--hm-radius-input)] transition-colors"
                                                        title="Standort bearbeiten"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>

                                                    <button
                                                        onClick={() => setDeleteModalLocation(location)}
                                                        className="p-2 text-hm-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-[var(--hm-radius-input)] transition-colors cursor-pointer"
                                                        title="Standort löschen"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredLocations.map((location) => {
                        const isUpdatingStatus = updatingStatusId === location.id;

                        return (
                            <div
                                key={location.id}
                                className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-5 space-y-4"
                            >
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <Link
                                                href={`/admin/locations/${location.id}`}
                                                className="text-base font-bold text-hm-ink hover:text-hm-accent transition-colors flex items-center gap-1.5"
                                            >
                                                <span>{location.name}</span>
                                                <ArrowUpRight className="w-4 h-4 text-hm-muted" />
                                            </Link>
                                            {location.code && (
                                                <span className="text-xs text-hm-muted font-mono">
                                                    Code #{location.code}
                                                </span>
                                            )}
                                        </div>

                                        {isSup ? (
                                            <button
                                                onClick={() => handleToggleStatus(location)}
                                                disabled={isUpdatingStatus}
                                                className={clsx(
                                                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer',
                                                    location.status === 'active'
                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
                                                    isUpdatingStatus && 'opacity-60 cursor-wait'
                                                )}
                                                title="Status umschalten"
                                            >
                                                <span className={clsx(
                                                    'w-1.5 h-1.5 rounded-full',
                                                    location.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                                                )} />
                                                <span>{location.status === 'active' ? 'Aktiv' : 'Inaktiv'}</span>
                                            </button>
                                        ) : (
                                            <span className={clsx(
                                                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                                                location.status === 'active'
                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                                            )}>
                                                <span className={clsx(
                                                    'w-1.5 h-1.5 rounded-full',
                                                    location.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                                                )} />
                                                {location.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info Grid */}
                                    <div className="space-y-2 text-xs">
                                        {location.address && (
                                            <a
                                                href={getGoogleMapsUrl(location)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-start gap-2 text-hm-ink hover:text-hm-accent group"
                                            >
                                                <MapPin className="w-3.5 h-3.5 text-hm-muted group-hover:text-hm-accent mt-0.5 flex-shrink-0" />
                                                <span className="underline decoration-dotted underline-offset-2">
                                                    {location.address}{location.city ? `, ${location.city}` : ''}
                                                </span>
                                            </a>
                                        )}

                                        {location.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5 text-hm-muted flex-shrink-0" />
                                                <a href={`tel:${location.phone}`} className="text-hm-ink hover:text-hm-accent hover:underline">
                                                    {location.phone}
                                                </a>
                                            </div>
                                        )}

                                        {location.openingTime && location.closingTime && (
                                            <div className="flex items-center gap-2 text-hm-muted">
                                                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                                <span>{location.openingTime} - {location.closingTime}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vehicle Count Pill */}
                                    <div className="pt-2">
                                        <Link
                                            href={`/admin/fleet?location=${encodeURIComponent(location.name)}`}
                                            className="w-full flex items-center justify-between p-2.5 rounded-[var(--hm-radius-input)] bg-hm-paper-2 hover:bg-hm-paper-3 border border-hm-rule text-xs font-semibold text-hm-ink hover:text-hm-accent transition-all group"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Car className="w-4 h-4 text-hm-accent" />
                                                <span>{location.totalVehicles} Fahrzeuge</span>
                                            </span>
                                            <span className="text-[11px] font-normal text-hm-muted group-hover:text-hm-accent">
                                                Flotte ansehen →
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-between pt-3 border-t border-hm-rule">
                                    <Link
                                        href={`/admin/locations/${location.id}`}
                                        className="text-xs font-medium text-hm-ink hover:text-hm-accent flex items-center gap-1"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Details</span>
                                    </Link>

                                    {isSup && (
                                        <div className="flex items-center gap-1">
                                            <Link
                                                href={`/admin/locations/${location.id}/edit`}
                                                className="p-1.5 text-hm-muted hover:text-amber-600 hover:bg-amber-500/10 rounded-md transition-colors"
                                                title="Bearbeiten"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteModalLocation(location)}
                                                className="p-1.5 text-hm-muted hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
                                                title="Löschen"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation & Protection Modal */}
            {deleteModalLocation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div
                        className="bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-card)] max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200"
                        role="dialog"
                        aria-modal="true"
                    >
                        {deleteModalLocation.totalVehicles > 0 ? (
                            /* Blocked Delete state (Vehicles assigned) */
                            <>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 flex-shrink-0">
                                        <ShieldAlert className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-hm-ink">
                                            Standort kann nicht gelöscht werden
                                        </h3>
                                        <p className="text-sm text-hm-muted">
                                            Dem Standort <strong className="text-hm-ink font-semibold">"{deleteModalLocation.name}"</strong> sind derzeit noch <strong className="text-hm-ink font-semibold">{deleteModalLocation.totalVehicles} Fahrzeug(e)</strong> zugewiesen.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-[var(--hm-radius-input)] bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                                    Zum Schutz vor Datenverlust müssen Sie diese Fahrzeuge zunächst einem anderen Standort zuweisen, bevor der Standort gelöscht werden kann.
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => setDeleteModalLocation(null)}
                                        className="px-4 py-2 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper text-hm-ink hover:bg-hm-paper-2 text-sm font-medium transition-all"
                                    >
                                        Schließen
                                    </button>
                                    <Link
                                        href="/admin/locations/assign-cars"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--hm-radius-input)] bg-hm-accent text-white text-sm font-medium hover:bg-hm-accent-hover transition-all"
                                    >
                                        <Car className="w-4 h-4" />
                                        <span>Fahrzeuge umverteilen</span>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            /* Safe Delete Confirmation state */
                            <>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-red-500/10 text-red-600 flex-shrink-0">
                                        <Trash2 className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-hm-ink">
                                            Standort löschen
                                        </h3>
                                        <p className="text-sm text-hm-muted">
                                            Möchten Sie den Standort <strong className="text-hm-ink font-semibold">"{deleteModalLocation.name}"</strong> wirklich unwiderruflich löschen?
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3.5 rounded-[var(--hm-radius-input)] bg-red-500/10 border border-red-500/20 text-xs text-red-800 dark:text-red-300">
                                    Diese Aktion kann nicht rückgängig gemacht werden. Alle Standortdaten werden dauerhaft aus der Datenbank entfernt.
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => setDeleteModalLocation(null)}
                                        disabled={isDeleting}
                                        className="px-4 py-2 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper text-hm-ink hover:bg-hm-paper-2 text-sm font-medium transition-all disabled:opacity-50"
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        disabled={isDeleting}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--hm-radius-input)] bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-red-600/30"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Wird gelöscht...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                <span>Ja, Standort löschen</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
