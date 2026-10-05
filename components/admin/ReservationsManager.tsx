/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Calendar,
    List,
    ChevronRight,
    Plus,
    CalendarDays,
    Search,
    X,
    RotateCcw,
    Download,
    Phone,
    Mail,
    Car,
    Clock,
    CheckCircle,
    AlertCircle,
    PenTool,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react';
import { format, isToday, isThisWeek, isFuture } from 'date-fns';
import { de } from 'date-fns/locale';
import { clsx } from 'clsx';
import ReservationCalendar from './ReservationCalendar';

export interface RentalItem {
    id: number;
    startDate: Date | string;
    endDate: Date | string;
    status: string;
    totalAmount: any;
    createdAt: Date | string;
    pickupLocationId?: number | null;
    returnLocationId?: number | null;
    car: {
        id: number;
        brand: string;
        model: string;
        plate: string;
        imageUrl?: string | null;
    };
    customer: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string | null;
    };
    pickupLocation?: {
        id: number;
        name: string;
    } | null;
    returnLocation?: {
        id: number;
        name: string;
    } | null;
}

interface ReservationsManagerProps {
    initialRentals: RentalItem[];
    initialView?: string;
}

export default function ReservationsManager({
    initialRentals,
    initialView = 'list'
}: ReservationsManagerProps) {
    const [rentals] = useState<RentalItem[]>(initialRentals);
    const [view, setView] = useState<'list' | 'calendar'>(initialView === 'calendar' ? 'calendar' : 'list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'future'>('all');

    // Filter rentals
    const filteredRentals = useMemo(() => {
        return rentals.filter(rental => {
            const customerName = `${rental.customer.firstName} ${rental.customer.lastName}`.toLowerCase();
            const carName = `${rental.car.brand} ${rental.car.model}`.toLowerCase();
            const plate = rental.car.plate.toLowerCase();
            const idStr = rental.id.toString();
            const email = (rental.customer.email || '').toLowerCase();
            const phone = (rental.customer.phone || '').toLowerCase();
            const q = searchQuery.toLowerCase().trim();

            const matchesSearch =
                q === '' ||
                idStr.includes(q) ||
                customerName.includes(q) ||
                carName.includes(q) ||
                plate.includes(q) ||
                email.includes(q) ||
                phone.includes(q);

            const matchesStatus =
                statusFilter === 'all' || rental.status === statusFilter;

            const start = new Date(rental.startDate);
            const end = new Date(rental.endDate);
            const now = new Date();

            let matchesTime = true;
            if (timeFilter === 'today') {
                matchesTime = isToday(start) || isToday(end) || (start <= now && end >= now);
            } else if (timeFilter === 'week') {
                matchesTime = isThisWeek(start) || isThisWeek(end);
            } else if (timeFilter === 'future') {
                matchesTime = isFuture(start);
            }

            return matchesSearch && matchesStatus && matchesTime;
        });
    }, [rentals, searchQuery, statusFilter, timeFilter]);

    // KPI Aggregates
    const stats = useMemo(() => {
        const total = rentals.length;
        const active = rentals.filter(r => r.status === 'Active').length;
        const pending = rentals.filter(r => r.status === 'Pending').length;
        const completed = rentals.filter(r => r.status === 'Completed').length;
        const todayActions = rentals.filter(r => isToday(new Date(r.startDate)) || isToday(new Date(r.endDate))).length;
        const totalRevenue = rentals.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);

        return { total, active, pending, completed, todayActions, totalRevenue };
    }, [rentals]);

    // CSV Export
    const handleExportCSV = () => {
        const headers = ['ID', 'Fahrzeug', 'Kennzeichen', 'Kunde', 'E-Mail', 'Telefon', 'Abholung', 'Rückgabe', 'Status', 'Gesamtbetrag (EUR)'];
        const rows = filteredRentals.map(r => [
            r.id,
            `"${r.car.brand} ${r.car.model}"`,
            `"${r.car.plate}"`,
            `"${r.customer.firstName} ${r.customer.lastName}"`,
            `"${r.customer.email}"`,
            `"${r.customer.phone || ''}"`,
            format(new Date(r.startDate), 'yyyy-MM-dd HH:mm'),
            format(new Date(r.endDate), 'yyyy-MM-dd HH:mm'),
            r.status,
            Number(r.totalAmount).toFixed(2)
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `rent-ex-reservierungen-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || timeFilter !== 'all';

    return (
        <div className="max-w-[1440px] mx-auto space-y-6 pb-12 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-hm-rule">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent animate-pulse" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Operativ · Buchungsmanagement
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Reservierungen
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Übersicht aller aktiven und geplanten Vermietungen · {rentals.length} Buchungen gesamt
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* View Toggle */}
                    <div className="flex items-center bg-hm-paper-2 rounded-[var(--hm-radius-input)] p-1 border border-hm-rule">
                        <button
                            onClick={() => setView('list')}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider rounded-[calc(var(--hm-radius-input)-2px)] transition-all cursor-pointer",
                                view === 'list' 
                                    ? "bg-hm-paper text-hm-ink shadow-xs border border-hm-rule" 
                                    : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            <List className="h-3.5 w-3.5" />
                            Liste
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider rounded-[calc(var(--hm-radius-input)-2px)] transition-all cursor-pointer",
                                view === 'calendar' 
                                    ? "bg-hm-paper text-hm-ink shadow-xs border border-hm-rule" 
                                    : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            Kalender
                        </button>
                    </div>

                    {/* Export CSV Button */}
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1.5 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper hover:bg-hm-paper-2 px-3 py-2 font-mono text-xs font-semibold text-hm-ink transition-colors shadow-xs cursor-pointer"
                        title="Aktuelle Auswahl als CSV exportieren"
                    >
                        <Download className="h-3.5 w-3.5 text-hm-muted" />
                        <span>Export</span>
                    </button>

                    {/* New Reservation Button */}
                    <Link 
                        href="/admin/reservations/new"
                        className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-sm shadow-hm-accent/20"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Neue Reservierung</span>
                    </Link>
                </div>
            </div>

            {/* Top KPI Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 border border-hm-rule shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">Aktive Mieten</span>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Car className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-hm-ink mt-2 font-mono">{stats.active}</p>
                    <p className="text-xs text-hm-muted mt-1">
                        Fahrzeuge aktuell unterwegs
                    </p>
                </div>

                <div className={clsx(
                    "bg-hm-paper rounded-[var(--hm-radius-card)] p-4 border shadow-sm transition-all",
                    stats.pending > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-hm-rule"
                )}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">Ausstehend</span>
                        <div className={clsx(
                            "p-2 rounded-lg",
                            stats.pending > 0 ? "bg-amber-500/10 text-amber-600 animate-pulse" : "bg-hm-paper-2 text-hm-muted"
                        )}>
                            <AlertCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <p className={clsx(
                        "text-2xl font-bold mt-2 font-mono",
                        stats.pending > 0 ? "text-amber-600 dark:text-amber-400" : "text-hm-ink"
                    )}>
                        {stats.pending}
                    </p>
                    <p className="text-xs text-hm-muted mt-1">
                        {stats.pending > 0 ? "Warten auf Bestätigung/Check-In" : "Keine offenen Anfragen"}
                    </p>
                </div>

                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 border border-hm-rule shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">Heute Relevant</span>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-hm-ink mt-2 font-mono">{stats.todayActions}</p>
                    <p className="text-xs text-hm-muted mt-1">
                        Abholungen & Rückgaben heute
                    </p>
                </div>

                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 border border-hm-rule shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-hm-muted">Umsatzvolumen</span>
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-hm-ink mt-2 font-mono">
                        {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stats.totalRevenue)}
                    </p>
                    <p className="text-xs text-hm-muted mt-1">
                        Aus {stats.total} Buchungen
                    </p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] p-4 border border-hm-rule shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Reservierung suchen (ID, Kunde, Kennzeichen, E-Mail)..."
                            className="w-full h-10 pl-10 pr-4 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 text-hm-ink placeholder:text-hm-muted text-sm focus:outline-none focus:border-hm-accent focus:ring-1 focus:ring-hm-accent transition-all font-medium"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-hm-muted hover:text-hm-ink p-1 cursor-pointer"
                                title="Suche löschen"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Filter */}
                        <div className="inline-flex rounded-[var(--hm-radius-input)] p-1 bg-hm-paper-2 border border-hm-rule text-xs font-semibold">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={clsx(
                                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                                    statusFilter === 'all'
                                        ? "bg-hm-paper text-hm-ink shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Alle ({rentals.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('Active')}
                                className={clsx(
                                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                                    statusFilter === 'Active'
                                        ? "bg-hm-paper text-emerald-600 dark:text-emerald-400 shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Aktiv ({stats.active})
                            </button>
                            <button
                                onClick={() => setStatusFilter('Pending')}
                                className={clsx(
                                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                                    statusFilter === 'Pending'
                                        ? "bg-hm-paper text-amber-600 dark:text-amber-400 shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Ausstehend ({stats.pending})
                            </button>
                            <button
                                onClick={() => setStatusFilter('Completed')}
                                className={clsx(
                                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                                    statusFilter === 'Completed'
                                        ? "bg-hm-paper text-slate-600 dark:text-slate-300 shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Abgeschlossen
                            </button>
                        </div>

                        {/* Time Filter */}
                        <select
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value as any)}
                            className="h-9 px-3 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 text-hm-ink text-xs font-semibold focus:outline-none focus:border-hm-accent"
                        >
                            <option value="all">Gesamter Zeitraum</option>
                            <option value="today">Heute relevant</option>
                            <option value="week">Diese Woche</option>
                            <option value="future">Zukünftige</option>
                        </select>

                        {/* Reset Filter Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('all');
                                    setTimeFilter('all');
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--hm-radius-input)] text-xs text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 transition-all cursor-pointer"
                                title="Filter zurücksetzen"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content: Calendar View or Table View */}
            {view === 'calendar' ? (
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule p-5 sm:p-6 shadow-sm">
                    {/* Pass REAL filtered rentals into ReservationCalendar */}
                    <ReservationCalendar rentals={filteredRentals} />
                </div>
            ) : (
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] font-mono text-hm-muted bg-hm-paper-2 border-b border-hm-rule uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">ID</th>
                                    <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-6 py-3 font-semibold">Kunde</th>
                                    <th className="px-6 py-3 font-semibold">Zeitraum</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold text-right">Betrag</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {filteredRentals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm font-mono text-hm-muted">
                                            {hasActiveFilters ? (
                                                <div className="space-y-2">
                                                    <p>Keine Reservierungen entsprechen den ausgewählten Kriterien.</p>
                                                    <button
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setStatusFilter('all');
                                                            setTimeFilter('all');
                                                        }}
                                                        className="text-xs text-hm-accent font-semibold hover:underline"
                                                    >
                                                        Filter zurücksetzen
                                                    </button>
                                                </div>
                                            ) : (
                                                'Keine Reservierungen gefunden.'
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRentals.map((rental) => {
                                        const startDate = format(new Date(rental.startDate), 'dd.MM.yyyy', { locale: de });
                                        const endDate = format(new Date(rental.endDate), 'dd.MM.yyyy', { locale: de });

                                        return (
                                            <tr key={rental.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                                {/* ID */}
                                                <td className="px-6 py-4 font-mono text-xs text-hm-muted">
                                                    <Link 
                                                        href={`/admin/reservations/${rental.id}`}
                                                        className="font-bold text-hm-ink hover:text-hm-accent transition-colors"
                                                    >
                                                        #{rental.id.toString().padStart(4, '0')}
                                                    </Link>
                                                </td>

                                                {/* Car */}
                                                <td className="px-6 py-4">
                                                    <Link
                                                        href={`/admin/fleet/${rental.car.id}`}
                                                        className="font-semibold text-hm-ink hover:text-hm-accent flex items-center gap-1 group/car transition-colors"
                                                    >
                                                        <span>{rental.car.brand} {rental.car.model}</span>
                                                        <ArrowUpRight className="w-3 h-3 text-hm-muted opacity-0 group-hover/car:opacity-100 transition-opacity" />
                                                    </Link>
                                                    <div className="inline-block mt-1 font-mono text-[11px] px-2 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink-2">
                                                        {rental.car.plate}
                                                    </div>
                                                </td>

                                                {/* Customer */}
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-hm-ink">{rental.customer.firstName} {rental.customer.lastName}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {rental.customer.email && (
                                                            <a 
                                                                href={`mailto:${rental.customer.email}`}
                                                                className="text-hm-muted hover:text-hm-ink" 
                                                                title={`E-Mail senden: ${rental.customer.email}`}
                                                            >
                                                                <Mail className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                        {rental.customer.phone && (
                                                            <a 
                                                                href={`tel:${rental.customer.phone}`}
                                                                className="text-hm-muted hover:text-hm-ink"
                                                                title={`Anrufen: ${rental.customer.phone}`}
                                                            >
                                                                <Phone className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                        <span className="text-xs text-hm-muted font-mono truncate max-w-[160px]">
                                                            {rental.customer.email}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Date Period */}
                                                <td className="px-6 py-4 font-mono text-xs">
                                                    <div className="text-hm-ink font-semibold">{startDate}</div>
                                                    <div className="text-hm-muted text-[11px]">bis {endDate}</div>
                                                </td>

                                                {/* Status Badge */}
                                                <td className="px-6 py-4">
                                                    <span className={clsx(
                                                        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider border",
                                                        rental.status === 'Active' && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
                                                        rental.status === 'Completed' && "bg-hm-paper-2 text-hm-muted border-hm-rule",
                                                        rental.status === 'Pending' && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
                                                        rental.status === 'Cancelled' && "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                                                    )}>
                                                        {rental.status === 'Active' && 'Aktiv'}
                                                        {rental.status === 'Completed' && 'Abgeschlossen'}
                                                        {rental.status === 'Pending' && 'Ausstehend'}
                                                        {rental.status === 'Cancelled' && 'Storniert'}
                                                    </span>
                                                </td>

                                                {/* Amount */}
                                                <td className="px-6 py-4 font-mono font-bold text-hm-ink text-right hm-tnum">
                                                    {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {rental.status === 'Pending' && (
                                                            <Link
                                                                href={`/admin/reservations/${rental.id}/check-in`}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--hm-radius-input)] bg-zinc-900 dark:bg-zinc-800 text-white hover:bg-black text-[11px] font-semibold transition-all shadow-2xs"
                                                                title="Digitalen Check-In starten"
                                                            >
                                                                <PenTool className="w-3 h-3" />
                                                                <span>Check-In</span>
                                                            </Link>
                                                        )}
                                                        <Link 
                                                            href={`/admin/reservations/${rental.id}`} 
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper hover:bg-hm-paper-2 text-xs font-semibold text-hm-ink hover:text-hm-accent transition-colors"
                                                            title="Details anzeigen"
                                                        >
                                                            <span>Details</span>
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
