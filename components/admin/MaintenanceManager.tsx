/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
    Wrench,
    Plus,
    Car as CarIcon,
    AlertTriangle,
    Search,
    Download,
    Eye,
    Edit2,
    Trash2,
    CheckCircle2,
    Clock,
    DollarSign,
    X,
    Save,
    Loader2,
    FileText,
    ExternalLink,
    ChevronRight,
    Gauge,
    Calendar
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import {
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    releaseCarFromMaintenance,
    MaintenanceInput
} from '@/app/actions/maintenance';
import { useRouter } from 'next/navigation';

export interface MaintenanceRecordItem {
    id: number;
    carId: number;
    maintenanceType: string;
    description: string;
    cost: number | null;
    mileage: number | null;
    performedBy: string | null;
    performedDate: string;
    nextDueDate: string | null;
    nextDueMileage: number | null;
    invoiceNumber: string | null;
    invoiceUrl: string | null;
    notes: string | null;
    createdAt: string;
    car: {
        id: number;
        brand: string;
        model: string;
        plate: string;
        status: string;
        currentMileage: number | null;
        imageUrl?: string | null;
    };
}

export interface CarAlertItem {
    id: number;
    brand: string;
    model: string;
    plate: string;
    status: string;
    currentMileage: number | null;
    nextInspection: string | null;
    nextOilChange: string | null;
    nextServiceDate: string | null;
}

export interface SimpleCarOption {
    id: number;
    brand: string;
    model: string;
    plate: string;
    currentMileage: number | null;
    status: string;
}

interface Props {
    records: MaintenanceRecordItem[];
    carsNeedingMaintenance: CarAlertItem[];
    allCars: SimpleCarOption[];
}

const MAINTENANCE_TYPES = [
    { value: 'all', label: 'Alle Arten' },
    { value: 'Oil Change', label: 'Ölwechsel' },
    { value: 'Tire Change', label: 'Reifenwechsel' },
    { value: 'Inspection', label: 'Inspektion / TÜV (§57a)' },
    { value: 'Repair', label: 'Reparatur' },
    { value: 'Service', label: 'Service' },
    { value: 'Other', label: 'Sonstiges' },
];

export default function MaintenanceManager({
    records: initialRecords,
    carsNeedingMaintenance,
    allCars
}: Props) {
    const router = useRouter();
    const [records, setRecords] = useState<MaintenanceRecordItem[]>(initialRecords);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    // Modal state for Add/Edit
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MaintenanceRecordItem | null>(null);
    const [formCarId, setFormCarId] = useState<number | ''>('');
    const [formType, setFormType] = useState('Service');
    const [formDescription, setFormDescription] = useState('');
    const [formCost, setFormCost] = useState('');
    const [formMileage, setFormMileage] = useState('');
    const [formPerformedBy, setFormPerformedBy] = useState('');
    const [formPerformedDate, setFormPerformedDate] = useState(new Date().toISOString().split('T')[0]);
    const [formNextDueDate, setFormNextDueDate] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formInvoiceUrl, setFormInvoiceUrl] = useState('');
    const [formSetCarToMaintenance, setFormSetCarToMaintenance] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete modal state
    const [recordToDelete, setRecordToDelete] = useState<MaintenanceRecordItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Invoice Lightbox state
    const [viewingInvoice, setViewingInvoice] = useState<{ url: string; title: string } | null>(null);

    // Car search inside modal
    const [modalCarSearch, setModalCarSearch] = useState('');

    // Keep records synced with props
    React.useEffect(() => {
        setRecords(initialRecords);
    }, [initialRecords]);

    // KPI Calculations
    const kpis = useMemo(() => {
        const totalCost = records.reduce((sum, r) => sum + (r.cost ? Number(r.cost) : 0), 0);
        const inShopCount = allCars.filter(c => c.status === 'Maintenance' || c.status === 'NeedsRepair').length;
        const dueSoonCount = carsNeedingMaintenance.length;
        const totalRecords = records.length;

        return {
            totalCost,
            inShopCount,
            dueSoonCount,
            totalRecords
        };
    }, [records, allCars, carsNeedingMaintenance]);

    // Filtered Records
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesType = selectedType === 'all' || r.maintenanceType === selectedType;
            if (!matchesType) return false;

            if (!searchQuery.trim()) return true;

            const q = searchQuery.toLowerCase();
            return (
                r.car.plate.toLowerCase().includes(q) ||
                `${r.car.brand} ${r.car.model}`.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q) ||
                (r.performedBy && r.performedBy.toLowerCase().includes(q)) ||
                (r.notes && r.notes.toLowerCase().includes(q)) ||
                (r.invoiceNumber && r.invoiceNumber.toLowerCase().includes(q))
            );
        });
    }, [records, selectedType, searchQuery]);

    // Filtered cars for modal dropdown
    const filteredModalCars = useMemo(() => {
        if (!modalCarSearch.trim()) return allCars;
        const q = modalCarSearch.toLowerCase();
        return allCars.filter(c =>
            c.plate.toLowerCase().includes(q) ||
            `${c.brand} ${c.model}`.toLowerCase().includes(q)
        );
    }, [allCars, modalCarSearch]);

    const getMaintenanceBadge = (type: string) => {
        switch (type) {
            case 'Oil Change':
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            case 'Tire Change':
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            case 'Inspection':
                return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
            case 'Repair':
                return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
            default:
                return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
        }
    };

    const getMaintenanceLabel = (type: string) => {
        const found = MAINTENANCE_TYPES.find(t => t.value === type);
        return found ? found.label : type;
    };

    // Open Modal for New Record
    const handleOpenAddModal = (presetCar?: CarAlertItem | SimpleCarOption) => {
        setEditingRecord(null);
        if (presetCar) {
            setFormCarId(presetCar.id);
            setFormMileage(presetCar.currentMileage ? presetCar.currentMileage.toString() : '');
        } else {
            setFormCarId('');
            setFormMileage('');
        }
        setFormType('Service');
        setFormDescription('');
        setFormCost('');
        setFormPerformedBy('');
        setFormPerformedDate(new Date().toISOString().split('T')[0]);
        setFormNextDueDate('');
        setFormNotes('');
        setFormInvoiceUrl('');
        setFormSetCarToMaintenance(false);
        setModalCarSearch('');
        setIsFormModalOpen(true);
    };

    // Open Modal for Editing Record
    const handleOpenEditModal = (rec: MaintenanceRecordItem) => {
        setEditingRecord(rec);
        setFormCarId(rec.carId);
        setFormType(rec.maintenanceType);
        setFormDescription(rec.description);
        setFormCost(rec.cost ? rec.cost.toString() : '');
        setFormMileage(rec.mileage ? rec.mileage.toString() : '');
        setFormPerformedBy(rec.performedBy || '');
        setFormPerformedDate(rec.performedDate ? rec.performedDate.split('T')[0] : '');
        setFormNextDueDate(rec.nextDueDate ? rec.nextDueDate.split('T')[0] : '');
        setFormNotes(rec.notes || '');
        setFormInvoiceUrl(rec.invoiceUrl || '');
        setFormSetCarToMaintenance(false);
        setModalCarSearch('');
        setIsFormModalOpen(true);
    };

    // Handle Form Submit (Add or Edit)
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formCarId || !formDescription.trim()) {
            toast.error('Bitte Fahrzeug und Beschreibung angeben.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingRecord) {
                // Update
                const res = await updateMaintenanceRecord(editingRecord.id, {
                    maintenanceType: formType,
                    description: formDescription.trim(),
                    cost: formCost ? parseFloat(formCost) : null,
                    mileage: formMileage ? parseInt(formMileage, 10) : null,
                    performedBy: formPerformedBy.trim() || null,
                    performedDate: formPerformedDate,
                    nextDueDate: formNextDueDate || null,
                    notes: formNotes.trim() || null,
                    invoiceUrl: formInvoiceUrl.trim() || null,
                });

                if (res.success) {
                    toast.success('Wartungseintrag erfolgreich aktualisiert!');
                    setIsFormModalOpen(false);
                    router.refresh();
                } else {
                    toast.error(res.error || 'Fehler beim Speichern');
                }
            } else {
                // Create
                const input: MaintenanceInput = {
                    carId: Number(formCarId),
                    maintenanceType: formType,
                    description: formDescription.trim(),
                    cost: formCost ? parseFloat(formCost) : null,
                    mileage: formMileage ? parseInt(formMileage, 10) : null,
                    performedBy: formPerformedBy.trim() || null,
                    performedDate: formPerformedDate,
                    nextDueDate: formNextDueDate || null,
                    notes: formNotes.trim() || null,
                    invoiceUrl: formInvoiceUrl.trim() || null,
                    setCarToMaintenance: formSetCarToMaintenance,
                };

                const res = await addMaintenanceRecord(input);
                if (res.success) {
                    toast.success('Wartungseintrag erfolgreich erstellt!');
                    setIsFormModalOpen(false);
                    router.refresh();
                } else {
                    toast.error(res.error || 'Fehler beim Erstellen');
                }
            }
        } catch {
            toast.error('Netzwerkfehler');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete Confirm
    const handleConfirmDelete = async () => {
        if (!recordToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteMaintenanceRecord(recordToDelete.id);
            if (res.success) {
                toast.success('Wartungseintrag gelöscht.');
                setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
                setRecordToDelete(null);
            } else {
                toast.error(res.error || 'Fehler beim Löschen');
            }
        } catch {
            toast.error('Netzwerkfehler beim Löschen');
        } finally {
            setIsDeleting(false);
        }
    };

    // Quick release car back to Active
    const handleReleaseCar = async (carId: number, plate: string) => {
        try {
            const res = await releaseCarFromMaintenance(carId);
            if (res.success) {
                toast.success(`Fahrzeug ${plate} wieder als "Verfügbar" freigegeben.`);
                router.refresh();
            } else {
                toast.error(res.error || 'Fehler beim Freigeben');
            }
        } catch {
            toast.error('Netzwerkfehler');
        }
    };

    // CSV Export
    const handleExportCSV = () => {
        if (filteredRecords.length === 0) {
            toast.error('Keine Datensätze zum Exportieren vorhanden.');
            return;
        }

        const headers = [
            'ID',
            'Datum',
            'Kennzeichen',
            'Fahrzeug',
            'Wartungsart',
            'Beschreibung',
            'Kilometerstand',
            'Kosten (EUR)',
            'Werkstatt/Dienstleister',
            'Notizen'
        ];

        const rows = filteredRecords.map(r => [
            r.id,
            r.performedDate ? r.performedDate.split('T')[0] : '',
            `"${r.car.plate}"`,
            `"${r.car.brand} ${r.car.model}"`,
            `"${getMainMaintenanceLabel(r.maintenanceType)}"`,
            `"${r.description.replace(/"/g, '""')}"`,
            r.mileage || '',
            r.cost ? Number(r.cost).toFixed(2) : '0.00',
            `"${(r.performedBy || '').replace(/"/g, '""')}"`,
            `"${(r.notes || '').replace(/"/g, '""')}"`
        ]);

        function getMainMaintenanceLabel(type: string) {
            const found = MAINTENANCE_TYPES.find(t => t.value === type);
            return found ? found.label : type;
        }

        const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rentex-wartungen-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${filteredRecords.length} Wartungseinträge als CSV exportiert.`);
    };

    return (
        <div className="space-y-8">
            {/* KPI Summary Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gesamtkosten */}
                <div className="p-4 rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper">
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-hm-muted">Gesamtkosten</span>
                        <DollarSign className="w-4 h-4 text-hm-accent" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-hm-ink hm-tnum">
                            €{kpis.totalCost.toLocaleString('de-AT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {/* In Werkstatt / Wartung */}
                <div
                    onClick={() => router.push('/admin/fleet?status=Maintenance')}
                    className="p-4 rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper hover:border-hm-rule-strong cursor-pointer transition-all"
                >
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
                            In Werkstatt / Service
                        </span>
                        <Wrench className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-amber-700 dark:text-amber-400">{kpis.inShopCount}</span>
                        <span className="text-xs font-mono text-amber-600/70">Fahrzeuge</span>
                    </div>
                </div>

                {/* Service fällig (30 Tage) */}
                <div className="p-4 rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs uppercase tracking-wider text-red-600 dark:text-red-400 font-semibold">
                                Service fällig
                            </span>
                            {kpis.dueSoonCount > 0 && <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />}
                        </div>
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-red-600 dark:text-red-400">{kpis.dueSoonCount}</span>
                        <span className="text-xs font-mono text-red-600/70">innerhalb 30d</span>
                    </div>
                </div>

                {/* Einträge gesamt */}
                <div
                    onClick={() => { setSelectedType('all'); setSearchQuery(''); }}
                    className="p-4 rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper hover:border-hm-rule-strong cursor-pointer transition-all"
                >
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-wider text-hm-muted">Wartungen gesamt</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="hm-display text-2xl font-bold text-hm-ink">{kpis.totalRecords}</span>
                        <span className="text-xs font-mono text-hm-muted">Einträge</span>
                    </div>
                </div>
            </div>

            {/* Alerts for upcoming maintenance */}
            {carsNeedingMaintenance.length > 0 && (
                <div className="bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-card)] p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-hm-rule">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-[var(--hm-radius-input)] text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                    {carsNeedingMaintenance.length} Fahrzeuge benötigen zeitnah Service
                                </h3>
                                <p className="font-mono text-[10px] text-hm-muted uppercase tracking-wider mt-0.5">
                                    TÜV (§57a), Ölwechsel oder Inspektion innerhalb der nächsten 30 Tage
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {carsNeedingMaintenance.map((car) => {
                            const hasInspection = !!car.nextInspection;
                            const hasOil = !!car.nextOilChange;
                            const hasService = !!car.nextServiceDate;

                            return (
                                <div
                                    key={car.id}
                                    className="p-3 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] flex flex-col justify-between gap-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="p-2 bg-hm-paper rounded border border-hm-rule text-hm-muted shrink-0">
                                                <CarIcon className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-hm-ink truncate">
                                                    {car.brand} {car.model}
                                                </p>
                                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-hm-paper border border-hm-rule text-hm-ink-2 font-bold">
                                                    {car.plate}
                                                </span>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/admin/fleet/${car.id}`}
                                            className="p-1 rounded text-hm-muted hover:text-hm-accent"
                                            title="Fahrzeugdetails anzeigen"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>

                                    {/* Due items badge list */}
                                    <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                                        {hasInspection && (
                                            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                                                §57a: {new Date(car.nextInspection!).toLocaleDateString('de-DE')}
                                            </span>
                                        )}
                                        {hasOil && (
                                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                                Öl: {new Date(car.nextOilChange!).toLocaleDateString('de-DE')}
                                            </span>
                                        )}
                                        {hasService && (
                                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                                                Service: {new Date(car.nextServiceDate!).toLocaleDateString('de-DE')}
                                            </span>
                                        )}
                                    </div>

                                    {/* Action button: prefilled maintenance */}
                                    <button
                                        type="button"
                                        onClick={() => handleOpenAddModal(car)}
                                        className="w-full py-1.5 px-2 bg-hm-paper hover:bg-hm-paper-3 border border-hm-rule rounded text-xs font-mono font-semibold text-hm-ink flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Wrench className="w-3 h-3 text-hm-accent" />
                                        <span>Wartung erfassen</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filter & Actions Bar */}
            <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Type Filter Tabs */}
                    <div className="inline-flex rounded-[var(--hm-radius-input)] bg-hm-paper-2 p-1 border border-hm-rule text-xs font-mono overflow-x-auto">
                        {MAINTENANCE_TYPES.map(t => {
                            const isSelected = selectedType === t.value;
                            const count = t.value === 'all'
                                ? records.length
                                : records.filter(r => r.maintenanceType === t.value).length;

                            return (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setSelectedType(t.value)}
                                    className={clsx(
                                        "px-2.5 py-1.5 rounded-[calc(var(--hm-radius-input)-2px)] font-medium transition-colors shrink-0 flex items-center gap-1.5",
                                        isSelected
                                            ? "bg-hm-paper text-hm-ink shadow-xs font-semibold"
                                            : "text-hm-muted hover:text-hm-ink"
                                    )}
                                >
                                    <span>{t.label}</span>
                                    <span className="text-[10px] px-1 rounded bg-hm-paper-2 border border-hm-rule text-hm-muted font-bold">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2.5">
                        {/* Search input */}
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted" />
                            <input
                                type="text"
                                placeholder="Kennzeichen, Werkstatt, Text..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors"
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

                        {/* CSV Export */}
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                            title="Als CSV exportieren"
                        >
                            <Download className="w-3.5 h-3.5 text-hm-muted" />
                            <span>Export</span>
                        </button>

                        {/* Add Maintenance Button */}
                        <button
                            type="button"
                            onClick={() => handleOpenAddModal()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Wartung erfassen</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Maintenance Records Table */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                <div className="px-6 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper">
                    <div className="flex items-center gap-2.5">
                        <Wrench className="w-4 h-4 text-hm-accent" />
                        <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">Wartungshistorie</h2>
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-paper-2 border border-hm-rule text-hm-muted">
                        {filteredRecords.length} Einträge
                    </span>
                </div>

                {filteredRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Wrench className="h-10 w-10 text-hm-muted/40 mb-3" />
                        <p className="text-xs font-mono uppercase tracking-wider text-hm-muted">
                            Keine Wartungseinträge für diesen Filter gefunden
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-hm-paper-2 text-[11px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Datum</th>
                                    <th className="px-6 py-3 font-semibold">Fahrzeug</th>
                                    <th className="px-6 py-3 font-semibold">Wartungsart</th>
                                    <th className="px-6 py-3 font-semibold">Beschreibung</th>
                                    <th className="px-6 py-3 font-semibold">Kilometer</th>
                                    <th className="px-6 py-3 font-semibold text-right">Kosten</th>
                                    <th className="px-6 py-3 font-semibold">Dienstleister</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {filteredRecords.map((record) => {
                                    const isCarInMaintenance =
                                        record.car.status === 'Maintenance' || record.car.status === 'NeedsRepair';

                                    return (
                                        <tr key={record.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                            {/* Date */}
                                            <td className="px-6 py-4 font-mono text-xs text-hm-ink">
                                                {format(new Date(record.performedDate), 'dd.MM.yyyy', { locale: de })}
                                            </td>

                                            {/* Vehicle */}
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/fleet/${record.car.id}`}
                                                    className="font-semibold text-hm-ink hover:text-hm-accent transition-colors block"
                                                >
                                                    {record.car.brand} {record.car.model}
                                                </Link>
                                                <div className="inline-block mt-0.5 font-mono text-[10px] px-1.5 py-0.5 rounded bg-hm-paper-2 border border-hm-rule text-hm-ink-2">
                                                    {record.car.plate}
                                                </div>
                                            </td>

                                            {/* Type Badge */}
                                            <td className="px-6 py-4">
                                                <span className={clsx(
                                                    'inline-flex items-center rounded-[var(--hm-radius-pill)] px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border',
                                                    getMaintenanceBadge(record.maintenanceType)
                                                )}>
                                                    {getMaintenanceLabel(record.maintenanceType)}
                                                </span>
                                            </td>

                                            {/* Description */}
                                            <td className="px-6 py-4 text-xs text-hm-ink-2 max-w-xs">
                                                <div className="font-medium text-hm-ink truncate">{record.description}</div>
                                                {record.notes && (
                                                    <div className="text-[11px] font-mono text-hm-muted truncate mt-0.5">
                                                        {record.notes}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Mileage */}
                                            <td className="px-6 py-4 font-mono text-xs text-hm-ink hm-tnum">
                                                {record.mileage ? `${record.mileage.toLocaleString('de-AT')} km` : '—'}
                                            </td>

                                            {/* Cost */}
                                            <td className="px-6 py-4 font-mono font-bold text-hm-ink text-right hm-tnum">
                                                {record.cost ? `€${Number(record.cost).toFixed(2)}` : '—'}
                                            </td>

                                            {/* Performed By */}
                                            <td className="px-6 py-4 text-xs text-hm-muted font-mono">
                                                {record.performedBy || '—'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Release car back to available shortcut */}
                                                    {isCarInMaintenance && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReleaseCar(record.car.id, record.car.plate)}
                                                            className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded transition-colors"
                                                            title="Auto repariert? Jetzt als 'Verfügbar' freigeben"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Invoice view */}
                                                    {record.invoiceUrl && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewingInvoice({
                                                                url: record.invoiceUrl!,
                                                                title: `Rechnung · ${record.car.plate} · ${record.description}`
                                                            })}
                                                            className="p-1.5 text-hm-muted hover:text-hm-accent hover:bg-hm-paper-2 rounded transition-colors"
                                                            title="Rechnung / Beleg ansehen"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Edit */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditModal(record)}
                                                        className="p-1.5 text-hm-muted hover:text-hm-accent hover:bg-hm-paper-2 rounded transition-colors"
                                                        title="Eintrag bearbeiten"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setRecordToDelete(record)}
                                                        className="p-1.5 text-hm-muted hover:text-red-600 hover:bg-red-500/10 rounded transition-colors"
                                                        title="Eintrag löschen"
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
                    </div>
                )}
            </div>

            {/* ===== ADD / EDIT MAINTENANCE MODAL ===== */}
            {isFormModalOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => !isSubmitting && setIsFormModalOpen(false)}
                >
                    <div
                        className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-2xl w-full max-w-lg border border-hm-rule text-hm-ink overflow-hidden max-h-[90vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper-2">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-hm-paper border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)]">
                                    <Wrench className="w-4 h-4 text-hm-accent" />
                                </div>
                                <div>
                                    <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                        {editingRecord ? 'Wartungseintrag bearbeiten' : 'Neuen Wartungseintrag erfassen'}
                                    </h2>
                                    <p className="text-[11px] font-mono text-hm-muted">
                                        Werkstattdokumentation, Reparaturen & Service
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !isSubmitting && setIsFormModalOpen(false)}
                                className="p-1 text-hm-muted hover:text-hm-ink transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleFormSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                            {/* Vehicle Picker */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                    Fahrzeug auswählen *
                                </label>
                                {!editingRecord && (
                                    <input
                                        type="text"
                                        placeholder="Nach Kennzeichen oder Modell filtern..."
                                        value={modalCarSearch}
                                        onChange={(e) => setModalCarSearch(e.target.value)}
                                        className="w-full mb-1.5 px-3 py-1.5 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden"
                                    />
                                )}
                                <select
                                    required
                                    value={formCarId}
                                    onChange={(e) => {
                                        const id = Number(e.target.value);
                                        setFormCarId(id);
                                        const c = allCars.find(car => car.id === id);
                                        if (c && c.currentMileage && !formMileage) {
                                            setFormMileage(c.currentMileage.toString());
                                        }
                                    }}
                                    disabled={!!editingRecord}
                                    className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden disabled:opacity-60"
                                >
                                    <option value="">Bitte Fahrzeug wählen...</option>
                                    {filteredModalCars.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.brand} {c.model} ({c.plate}) · {c.currentMileage ? `${c.currentMileage} km` : 'Kein km'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Type & Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                        Wartungsart *
                                    </label>
                                    <select
                                        required
                                        value={formType}
                                        onChange={(e) => setFormType(e.target.value)}
                                        className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden"
                                    >
                                        <option value="Oil Change">Ölwechsel</option>
                                        <option value="Tire Change">Reifenwechsel</option>
                                        <option value="Inspection">Inspektion / TÜV (§57a)</option>
                                        <option value="Repair">Reparatur</option>
                                        <option value="Service">Service</option>
                                        <option value="Other">Sonstiges</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                        Durchführungsdatum *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formPerformedDate}
                                        onChange={(e) => setFormPerformedDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                    Beschreibung der Arbeiten *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="z.B. Bremsbeläge und Scheiben vorne erneuert"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden"
                                />
                            </div>

                            {/* Cost & Mileage */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                        Kosten (€)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="z.B. 450.00"
                                        value={formCost}
                                        onChange={(e) => setFormCost(e.target.value)}
                                        className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                        Kilometerstand (km)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="z.B. 74500"
                                        value={formMileage}
                                        onChange={(e) => setFormMileage(e.target.value)}
                                        className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Workshop / Performed By */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                    Werkstatt / Durchgeführt von
                                </label>
                                <input
                                    type="text"
                                    placeholder="z.B. ÖAMTC Feldkirch / Autohaus Maier"
                                    value={formPerformedBy}
                                    onChange={(e) => setFormPerformedBy(e.target.value)}
                                    className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden"
                                />
                            </div>

                            {/* Next Due Date & Invoice URL */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                        Nächster Termin (optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formNextDueDate}
                                        onChange={(e) => setFormNextDueDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                        Rechnungs-URL / Beleg
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="https://... oder /uploads/..."
                                        value={formInvoiceUrl}
                                        onChange={(e) => setFormInvoiceUrl(e.target.value)}
                                        className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-hm-ink">
                                    Interne Notizen / Bemerkungen
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Details zu Ersatzteilen, Garantie, etc..."
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    className="w-full px-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink focus:outline-hidden resize-none"
                                />
                            </div>

                            {/* Set status to Maintenance checkbox (if new) */}
                            {!editingRecord && (
                                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-mono pt-1 text-hm-muted hover:text-hm-ink">
                                    <input
                                        type="checkbox"
                                        checked={formSetCarToMaintenance}
                                        onChange={(e) => setFormSetCarToMaintenance(e.target.checked)}
                                        className="rounded border-hm-rule text-hm-accent"
                                    />
                                    <span>Fahrzeugstatus in der Flotte sofort auf "Wartung" setzen</span>
                                </label>
                            )}

                            {/* Submit Buttons */}
                            <div className="pt-3 border-t border-hm-rule flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
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
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Speichern...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-3.5 h-3.5" />
                                            <span>{editingRecord ? 'Änderungen speichern' : 'Eintrag erstellen'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== DELETE CONFIRMATION MODAL ===== */}
            {recordToDelete && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => !isDeleting && setRecordToDelete(null)}
                >
                    <div
                        className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-2xl w-full max-w-md border border-hm-rule text-hm-ink overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-5 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper-2">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-[var(--hm-radius-input)]">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                        Wartungseintrag löschen
                                    </h2>
                                    <p className="text-[11px] font-mono text-hm-muted">
                                        {recordToDelete.car.brand} {recordToDelete.car.model} · {recordToDelete.car.plate}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => !isDeleting && setRecordToDelete(null)}
                                className="p-1 text-hm-muted hover:text-hm-ink transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <p className="text-xs text-hm-muted">
                                Möchten Sie diesen Wartungseintrag (<strong>{recordToDelete.description}</strong> vom{' '}
                                {format(new Date(recordToDelete.performedDate), 'dd.MM.yyyy')}) wirklich unwiderruflich löschen?
                            </p>

                            <div className="pt-3 border-t border-hm-rule flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setRecordToDelete(null)}
                                    disabled={isDeleting}
                                    className="px-3.5 py-2 rounded-[var(--hm-radius-input)] font-mono text-xs uppercase tracking-wider text-hm-muted hover:text-hm-ink transition-colors"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--hm-radius-input)] bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-xs transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    <span>Endgültig löschen</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== INVOICE LIGHTBOX MODAL ===== */}
            {viewingInvoice && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setViewingInvoice(null)}
                >
                    <div
                        className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-2xl w-full max-w-3xl border border-hm-rule text-hm-ink overflow-hidden max-h-[85vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-5 py-3 border-b border-hm-rule flex items-center justify-between bg-hm-paper-2">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-hm-ink truncate">
                                {viewingInvoice.title}
                            </span>
                            <div className="flex items-center gap-2">
                                <a
                                    href={viewingInvoice.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded text-hm-muted hover:text-hm-ink"
                                    title="In neuem Tab öffnen"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setViewingInvoice(null)}
                                    className="p-1 rounded text-hm-muted hover:text-hm-ink"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-black/5 flex items-center justify-center flex-1 overflow-auto">
                            {viewingInvoice.url.endsWith('.pdf') ? (
                                <iframe
                                    src={viewingInvoice.url}
                                    className="w-full h-[65vh] rounded border border-hm-rule"
                                    title="PDF Beleg"
                                />
                            ) : (
                                <img
                                    src={viewingInvoice.url}
                                    alt="Rechnungsbeleg"
                                    className="max-h-[65vh] w-auto object-contain rounded"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
