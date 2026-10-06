/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, isPast, isToday, differenceInDays, differenceInHours } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import {
    PackageCheck,
    Search,
    Car,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Phone,
    Mail,
    ChevronRight,
    X,
    RefreshCw,
    Gauge,
    Fuel,
    AlertCircle,
    ArrowUpRight,
    ShieldAlert,
    CalendarCheck,
    CheckSquare
} from 'lucide-react';
import { clsx } from 'clsx';
import { performCheckOut, CheckOutInput } from '@/app/actions/checkout';
import { useRouter } from 'next/navigation';

export interface CheckOutRentalItem {
    id: number;
    status: string;
    startDate: string;
    endDate: string;
    actualReturnDate: string | null;
    pickupMileage: number | null;
    returnMileage: number | null;
    includedKm: number | null;
    fuelLevelPickup: string | null;
    fuelLevelReturn: string | null;
    fuelCharge: number | null;
    damageReport: string | null;
    notes: string | null;
    contractNumber: string | null;
    totalAmount: number;
    car: {
        id: number;
        brand: string;
        model: string;
        plate: string;
        currentMileage: number;
        fuelType?: string | null;
        imageUrl?: string | null;
    };
    customer: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
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

interface Props {
    rentals: CheckOutRentalItem[];
    completedToday: CheckOutRentalItem[];
}

export default function CheckOutManager({ rentals: initialRentals, completedToday: initialCompletedToday }: Props) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'dueToday' | 'overdue' | 'completed'>('all');
    const [showUpcoming, setShowUpcoming] = useState(false);

    // Modal state for quick return
    const [selectedRentalForReturn, setSelectedRentalForReturn] = useState<CheckOutRentalItem | null>(null);
    const [returnMileage, setReturnMileage] = useState<string>('');
    const [fuelLevel, setFuelLevel] = useState<string>('100%');
    const [fuelCharge, setFuelCharge] = useState<string>('');
    const [damageNotes, setDamageNotes] = useState<string>('');
    const [generalNotes, setGeneralNotes] = useState<string>('');
    const [extraCharges, setExtraCharges] = useState<string>('');
    const [extraChargesNote, setExtraChargesNote] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Categorization
    const now = new Date();

    const categorizedRentals = useMemo(() => {
        const dueTodayList: CheckOutRentalItem[] = [];
        const overdueList: CheckOutRentalItem[] = [];
        const upcomingList: CheckOutRentalItem[] = [];

        for (const r of initialRentals) {
            const end = new Date(r.endDate);
            if (isToday(end)) {
                dueTodayList.push(r);
            } else if (isPast(end)) {
                overdueList.push(r);
            } else {
                upcomingList.push(r);
            }
        }

        return {
            dueToday: dueTodayList,
            overdue: overdueList,
            upcoming: upcomingList
        };
    }, [initialRentals]);

    // Filtered list
    const displayedRentals = useMemo(() => {
        let baseList: CheckOutRentalItem[] = [];

        if (statusFilter === 'completed') {
            baseList = initialCompletedToday;
        } else if (statusFilter === 'dueToday') {
            baseList = categorizedRentals.dueToday;
        } else if (statusFilter === 'overdue') {
            baseList = categorizedRentals.overdue;
        } else {
            // 'all'
            baseList = [
                ...categorizedRentals.overdue,
                ...categorizedRentals.dueToday,
                ...(showUpcoming ? categorizedRentals.upcoming : [])
            ];
        }

        if (!searchQuery.trim()) return baseList;

        const q = searchQuery.toLowerCase();
        return baseList.filter(r =>
            `${r.car.brand} ${r.car.model}`.toLowerCase().includes(q) ||
            r.car.plate.toLowerCase().includes(q) ||
            `${r.customer.firstName} ${r.customer.lastName}`.toLowerCase().includes(q) ||
            r.customer.email.toLowerCase().includes(q) ||
            (r.customer.phone && r.customer.phone.toLowerCase().includes(q)) ||
            (r.contractNumber && r.contractNumber.toLowerCase().includes(q)) ||
            r.id.toString().includes(q)
        );
    }, [statusFilter, categorizedRentals, initialCompletedToday, showUpcoming, searchQuery]);

    // Open Return Modal
    const handleOpenReturnModal = (rental: CheckOutRentalItem) => {
        setSelectedRentalForReturn(rental);
        const baselineKm = rental.pickupMileage || rental.car.currentMileage || 0;
        setReturnMileage(baselineKm ? baselineKm.toString() : '');
        setFuelLevel(rental.fuelLevelPickup || '100%');
        setFuelCharge('');
        setDamageNotes('');
        setGeneralNotes('');
        setExtraCharges('');
        setExtraChargesNote('');
    };

    const handleCloseReturnModal = () => {
        setSelectedRentalForReturn(null);
        setIsSubmitting(false);
    };

    const handleSubmitReturn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRentalForReturn) return;

        const km = parseInt(returnMileage, 10);
        const baselineKm = selectedRentalForReturn.pickupMileage || selectedRentalForReturn.car.currentMileage || 0;

        if (isNaN(km) || km < baselineKm) {
            toast.error(`Kilometerstand muss mindestens ${baselineKm.toLocaleString('de-DE')} km betragen.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: CheckOutInput = {
                returnMileage: km,
                fuelLevelReturn: fuelLevel,
                fuelCharge: fuelCharge ? parseFloat(fuelCharge) : undefined,
                damageNotes: damageNotes.trim() || undefined,
                extraCharges: extraCharges ? parseFloat(extraCharges) : undefined,
                extraChargesNote: extraChargesNote.trim() || undefined,
                notes: generalNotes.trim() || undefined
            };

            const result = await performCheckOut(selectedRentalForReturn.id, payload);

            if (result.success) {
                toast.success(
                    `Fahrzeug ${selectedRentalForReturn.car.brand} ${selectedRentalForReturn.car.model} (${selectedRentalForReturn.car.plate}) erfolgreich zurückgenommen!`
                );
                if (result.surplusKm && result.surplusKm > 0) {
                    toast.info(`${result.surplusKm} km wurden dem Kundenkonto automatisch gutgeschrieben.`);
                }
                if (result.kmCharge && result.kmCharge > 0) {
                    toast.info(`Mehrkilometer: €${result.kmCharge.toFixed(2)} (Guthaben verrechnet: ${result.balanceUsed ?? 0} km).`);
                }
                if (result.fuelCharge && result.fuelCharge > 0 && !fuelCharge) {
                    toast.info(`Tankgebühr €${result.fuelCharge.toFixed(2)} wurde angesetzt.`);
                }
                handleCloseReturnModal();
                router.refresh();
            }
        } catch (error: any) {
            toast.error(error.message || 'Fehler beim Abschließen der Rückgabe');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculation helpers for modal
    const selectedBaselineKm = selectedRentalForReturn
        ? selectedRentalForReturn.pickupMileage || selectedRentalForReturn.car.currentMileage || 0
        : 0;
    const currentEnteredKm = parseInt(returnMileage, 10);
    const drivenKm = !isNaN(currentEnteredKm) && currentEnteredKm >= selectedBaselineKm
        ? currentEnteredKm - selectedBaselineKm
        : 0;

    return (
        <div className="space-y-8">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Heute fällig */}
                <div
                    onClick={() => setStatusFilter('dueToday')}
                    className={clsx(
                        "p-4 rounded-[var(--hm-radius-card)] border transition-all cursor-pointer select-none",
                        statusFilter === 'dueToday'
                            ? "bg-amber-500/10 border-amber-500/40 shadow-xs"
                            : "bg-hm-paper border-hm-rule hover:border-hm-rule-strong"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-hm-muted">Heute fällig</span>
                        <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-hm-ink">
                            {categorizedRentals.dueToday.length}
                        </span>
                        <span className="text-xs font-mono text-hm-muted">Fahrzeuge</span>
                    </div>
                </div>

                {/* Überfällig */}
                <div
                    onClick={() => setStatusFilter('overdue')}
                    className={clsx(
                        "p-4 rounded-[var(--hm-radius-card)] border transition-all cursor-pointer select-none",
                        statusFilter === 'overdue'
                            ? "bg-red-500/10 border-red-500/40 shadow-xs"
                            : "bg-hm-paper border-hm-rule hover:border-hm-rule-strong"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs uppercase tracking-wider text-red-600 dark:text-red-400 font-bold">
                                Überfällig
                            </span>
                            {categorizedRentals.overdue.length > 0 && (
                                <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                            )}
                        </div>
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-red-600 dark:text-red-400">
                            {categorizedRentals.overdue.length}
                        </span>
                        <span className="text-xs font-mono text-red-600/80">Sofort klären</span>
                    </div>
                </div>

                {/* Heute abgeschlossen */}
                <div
                    onClick={() => setStatusFilter('completed')}
                    className={clsx(
                        "p-4 rounded-[var(--hm-radius-card)] border transition-all cursor-pointer select-none",
                        statusFilter === 'completed'
                            ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs"
                            : "bg-hm-paper border-hm-rule hover:border-hm-rule-strong"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-hm-muted">Heute retourniert</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {initialCompletedToday.length}
                        </span>
                        <span className="text-xs font-mono text-hm-muted">Abgeschlossen</span>
                    </div>
                </div>

                {/* Gesamt Ausstehend */}
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
                        <span className="font-mono text-xs uppercase tracking-wider text-hm-muted">Gesamt ausstehend</span>
                        <PackageCheck className="w-4 h-4 text-hm-accent" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-hm-ink">
                            {categorizedRentals.dueToday.length + categorizedRentals.overdue.length}
                        </span>
                        <span className="text-xs font-mono text-hm-muted">In Vermietung</span>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule p-4 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="inline-flex rounded-[var(--hm-radius-input)] bg-hm-paper-2 p-1 border border-hm-rule text-xs font-mono overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={clsx(
                                "px-3 py-1.5 rounded-[calc(var(--hm-radius-input)-2px)] font-medium transition-colors shrink-0",
                                statusFilter === 'all'
                                    ? "bg-hm-paper text-hm-ink shadow-xs font-semibold"
                                    : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            Alle Ausstehenden ({categorizedRentals.dueToday.length + categorizedRentals.overdue.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('dueToday')}
                            className={clsx(
                                "px-3 py-1.5 rounded-[calc(var(--hm-radius-input)-2px)] font-medium transition-colors shrink-0 flex items-center gap-1.5",
                                statusFilter === 'dueToday'
                                    ? "bg-hm-paper text-amber-700 dark:text-amber-400 shadow-xs font-semibold"
                                    : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            <span>Heute fällig</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 text-[10px] font-bold">
                                {categorizedRentals.dueToday.length}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('overdue')}
                            className={clsx(
                                "px-3 py-1.5 rounded-[calc(var(--hm-radius-input)-2px)] font-medium transition-colors shrink-0 flex items-center gap-1.5",
                                statusFilter === 'overdue'
                                    ? "bg-hm-paper text-red-600 dark:text-red-400 shadow-xs font-semibold"
                                    : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            <span>Überfällig</span>
                            {categorizedRentals.overdue.length > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold">
                                    {categorizedRentals.overdue.length}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('completed')}
                            className={clsx(
                                "px-3 py-1.5 rounded-[calc(var(--hm-radius-input)-2px)] font-medium transition-colors shrink-0 flex items-center gap-1.5",
                                statusFilter === 'completed'
                                    ? "bg-hm-paper text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold"
                                    : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            <span>Heute abgeschlossen</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-[10px] font-bold">
                                {initialCompletedToday.length}
                            </span>
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted" />
                        <input
                            type="text"
                            placeholder="Plaka, Marke, Kunde, Buchungs-Nr..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] w-full text-xs font-mono text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-hm-muted hover:text-hm-ink"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Option to show upcoming rentals for early return */}
                {statusFilter === 'all' && (
                    <div className="flex items-center justify-between pt-2 border-t border-hm-rule/60 text-xs font-mono">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-hm-muted hover:text-hm-ink transition-colors">
                            <input
                                type="checkbox"
                                checked={showUpcoming}
                                onChange={(e) => setShowUpcoming(e.target.checked)}
                                className="rounded border-hm-rule text-hm-accent focus:ring-0"
                            />
                            <span>Auch spätere aktive Vermietungen einblenden (z.B. für vorzeitige Fahrzeugrückgabe)</span>
                        </label>
                        <span className="text-[11px] text-hm-muted">
                            {displayedRentals.length} {displayedRentals.length === 1 ? 'Eintrag' : 'Einträge'} angezeigt
                        </span>
                    </div>
                )}
            </div>

            {/* Returns Table */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] font-mono text-hm-muted bg-hm-paper-2 border-b border-hm-rule uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                <th className="px-6 py-3 font-semibold">Kunde & Kontakt</th>
                                <th className="px-6 py-3 font-semibold">Rückgabetermin</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-hm-rule">
                            {displayedRentals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="space-y-2">
                                            <PackageCheck className="w-8 h-8 text-hm-muted mx-auto opacity-50" />
                                            <p className="text-xs font-mono uppercase tracking-wider text-hm-muted">
                                                Keine Rückgaben für diesen Filter gefunden.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayedRentals.map((rental) => {
                                    const endDate = new Date(rental.endDate);
                                    const isOverdue = statusFilter !== 'completed' && isPast(endDate) && !isToday(endDate);
                                    const isDueToday = isToday(endDate);
                                    const isCompleted = rental.status === 'Completed';

                                    // Overdue duration calculation
                                    const overdueDays = isOverdue ? differenceInDays(now, endDate) : 0;
                                    const overdueHours = isOverdue ? differenceInHours(now, endDate) % 24 : 0;

                                    return (
                                        <tr key={rental.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                            {/* Vehicle */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink shrink-0">
                                                        <Car className="w-5 h-5 text-hm-accent" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-hm-ink">
                                                            {rental.car.brand} {rental.car.model}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink">
                                                                {rental.car.plate}
                                                            </span>
                                                            <span className="font-mono text-[10px] text-hm-muted">
                                                                Start: {(rental.pickupMileage || rental.car.currentMileage || 0).toLocaleString('de-DE')} km
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Customer */}
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-hm-ink">
                                                    {rental.customer.firstName} {rental.customer.lastName}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs font-mono">
                                                    {rental.customer.phone && (
                                                        <a
                                                            href={`tel:${rental.customer.phone}`}
                                                            className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline"
                                                            title="Kunden anrufen"
                                                        >
                                                            <Phone className="w-3 h-3" />
                                                            <span>{rental.customer.phone}</span>
                                                        </a>
                                                    )}
                                                    <a
                                                        href={`mailto:${rental.customer.email}`}
                                                        className="inline-flex items-center gap-1 text-hm-muted hover:text-hm-ink"
                                                        title="E-Mail senden"
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </td>

                                            {/* Scheduled Date */}
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-xs text-hm-ink font-semibold">
                                                    {format(endDate, 'dd.MM.yyyy · HH:mm', { locale: de })} Uhr
                                                </div>
                                                {isOverdue && (
                                                    <div className="text-[11px] font-mono text-red-600 font-bold mt-0.5">
                                                        +{overdueDays > 0 ? `${overdueDays}d ` : ''}{overdueHours}h überfällig
                                                    </div>
                                                )}
                                                {isCompleted && rental.actualReturnDate && (
                                                    <div className="text-[11px] font-mono text-emerald-600 mt-0.5">
                                                        Retour: {format(new Date(rental.actualReturnDate), 'HH:mm', { locale: de })} Uhr
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-4">
                                                {isCompleted ? (
                                                    <span className="inline-flex items-center gap-1 rounded-[var(--hm-radius-pill)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Zurückgegeben</span>
                                                    </span>
                                                ) : isOverdue ? (
                                                    <span className="inline-flex items-center gap-1 rounded-[var(--hm-radius-pill)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 animate-pulse">
                                                        <AlertTriangle className="w-3 h-3 text-red-600" />
                                                        <span>Überfällig</span>
                                                    </span>
                                                ) : isDueToday ? (
                                                    <span className="inline-flex items-center gap-1 rounded-[var(--hm-radius-pill)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Heute fällig</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-[var(--hm-radius-pill)] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                                                        <span>Zukünftig</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    {!isCompleted && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenReturnModal(rental)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink font-mono text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                                                        >
                                                            <CheckSquare className="w-3.5 h-3.5" />
                                                            <span>Zurücknehmen</span>
                                                        </button>
                                                    )}

                                                    <Link
                                                        href={`/admin/reservations/${rental.id}`}
                                                        className="inline-flex items-center gap-1 p-1.5 rounded-[var(--hm-radius-input)] text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 border border-transparent hover:border-hm-rule transition-colors font-mono text-xs uppercase"
                                                        title="Buchungsdetails ansehen"
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

            {/* Quick Check-Out / Return Modal */}
            {selectedRentalForReturn && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
                    onClick={handleCloseReturnModal}
                >
                    <div
                        className="relative max-w-xl w-full bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-5 border-b border-hm-rule flex items-center justify-between bg-hm-paper-2">
                            <div>
                                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-accent">
                                    Check-Out Station · Protokoll
                                </span>
                                <h3 className="hm-display text-lg font-bold text-hm-ink">
                                    Fahrzeugrücknahme abschließen
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseReturnModal}
                                className="p-1 rounded text-hm-muted hover:text-hm-ink transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmitReturn} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            {/* Vehicle & Customer Overview Box */}
                            <div className="p-3.5 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule flex items-center justify-between text-xs font-mono">
                                <div>
                                    <div className="font-bold text-hm-ink text-sm">
                                        {selectedRentalForReturn.car.brand} {selectedRentalForReturn.car.model}
                                    </div>
                                    <div className="text-hm-muted mt-0.5">
                                        Kennzeichen: <span className="font-bold text-hm-ink">{selectedRentalForReturn.car.plate}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-hm-ink">
                                        {selectedRentalForReturn.customer.firstName} {selectedRentalForReturn.customer.lastName}
                                    </div>
                                    <div className="text-hm-muted mt-0.5">
                                        Vertrag #{selectedRentalForReturn.contractNumber || selectedRentalForReturn.id}
                                    </div>
                                </div>
                            </div>

                            {/* Mileage section */}
                            <div className="space-y-2">
                                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-hm-ink flex items-center gap-1.5">
                                    <Gauge className="w-4 h-4 text-hm-accent" />
                                    <span>Rückgabe-Kilometerstand (km) *</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <span className="text-[11px] font-mono text-hm-muted block mb-1">
                                            Start-Kilometerstand:
                                        </span>
                                        <div className="p-2.5 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule font-mono text-xs text-hm-ink font-bold">
                                            {selectedBaselineKm.toLocaleString('de-DE')} km
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-mono text-hm-muted block mb-1">
                                            Aktueller Tacho:
                                        </span>
                                        <input
                                            type="number"
                                            required
                                            min={selectedBaselineKm}
                                            value={returnMileage}
                                            onChange={(e) => setReturnMileage(e.target.value)}
                                            placeholder="z.B. 46500"
                                            className="w-full p-2.5 rounded-[var(--hm-radius-input)] bg-hm-paper border border-hm-rule font-mono text-xs text-hm-ink font-bold focus:border-hm-rule-strong focus:outline-hidden"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {drivenKm > 0 && (
                                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                                        <span>Gefahrene Strecke:</span>
                                        <span className="font-bold">+{drivenKm.toLocaleString('de-DE')} km</span>
                                    </div>
                                )}
                            </div>

                            {/* Fuel / Battery Level */}
                            <div className="space-y-2">
                                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-hm-ink flex items-center gap-1.5">
                                    <Fuel className="w-4 h-4 text-hm-accent" />
                                    <span>Tank- / Batteriestand bei Rückgabe</span>
                                </label>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {['100%', '75%', '50%', '25%', 'Reserve'].map((lvl) => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            onClick={() => setFuelLevel(lvl)}
                                            className={clsx(
                                                "py-2 text-xs font-mono font-bold rounded-[var(--hm-radius-input)] border transition-all text-center",
                                                fuelLevel === lvl
                                                    ? "bg-hm-accent text-hm-accent-ink border-hm-accent shadow-xs"
                                                    : "bg-hm-paper-2 border-hm-rule text-hm-muted hover:text-hm-ink"
                                            )}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Fuel Charge & Extra charges */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-mono font-semibold text-hm-ink">
                                        Tanknachbelastung (€)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={fuelCharge}
                                        onChange={(e) => setFuelCharge(e.target.value)}
                                        className="w-full p-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-mono font-semibold text-hm-ink">
                                        Zusatzgebühren (€)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={extraCharges}
                                        onChange={(e) => setExtraCharges(e.target.value)}
                                        className="w-full p-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Damage Notes */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-hm-ink flex items-center gap-1.5">
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                    <span>Neuer Schaden / Zustand (Optional)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="z.B. Kratzer an der Stoßstange hinten rechts ca. 5cm..."
                                    value={damageNotes}
                                    onChange={(e) => setDamageNotes(e.target.value)}
                                    className="w-full p-2.5 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink placeholder:text-hm-muted focus:outline-hidden"
                                />
                                <span className="text-[10px] font-mono text-hm-muted">
                                    Wird automatisch in das Schadensregister aufgenommen und dem Kunden zugeordnet.
                                </span>
                            </div>

                            {/* General Notes */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                    Rückgabevermerk / Bemerkung
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Interne Notizen zur Rücknahme..."
                                    value={generalNotes}
                                    onChange={(e) => setGeneralNotes(e.target.value)}
                                    className="w-full p-2.5 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink placeholder:text-hm-muted focus:outline-hidden"
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-3 border-t border-hm-rule flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseReturnModal}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-[var(--hm-radius-input)] font-mono text-xs uppercase tracking-wider text-hm-muted hover:text-hm-ink transition-colors"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink font-mono text-xs font-bold uppercase tracking-wider shadow-xs transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            <span>Wird abgeschlossen...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Rückgabe bestätigen & abschließen</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
