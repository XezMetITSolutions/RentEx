/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css */
'use client';

import { useState, useMemo } from 'react';
import { 
    Mail, Phone, Crown, Star, Award, FileText,
    ToggleLeft, ToggleRight, Trash2, Loader2,
    Eye, History, Users, Search, X, RotateCcw,
    Download, LayoutGrid, List, ArrowUpRight,
    TrendingUp, Gift, Car, AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    licenseNumber: string | null;
    createdAt: Date | string;
    isActive: boolean;
    tier: 'VIP' | 'Stammkunde' | 'Neukunde';
    totalRentals: number;
    totalRevenue: number;
    lastRental: any;
    daysSinceLastRental: number | null;
    benefits: {
        noDeposit: boolean;
        birthdayVoucher: boolean;
        prioritySupport?: boolean;
        freeUpgrade?: boolean;
        loyaltyDiscount: number;
    };
}

interface CustomerTableProps {
    initialCustomers: Customer[];
}

export default function CustomerTable({ initialCustomers }: CustomerTableProps) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [searchQuery, setSearchQuery] = useState('');
    const [tierFilter, setTierFilter] = useState<'all' | 'VIP' | 'Stammkunde' | 'Neukunde'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [voucherOnly, setVoucherOnly] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // Action states
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [deleteModalCustomer, setDeleteModalCustomer] = useState<Customer | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();

    // Filter customers
    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
            const email = customer.email.toLowerCase();
            const phone = (customer.phone || '').toLowerCase();
            const license = (customer.licenseNumber || '').toLowerCase();
            const idStr = customer.id.toString();
            const q = searchQuery.toLowerCase().trim();

            const matchesSearch =
                q === '' ||
                idStr.includes(q) ||
                fullName.includes(q) ||
                email.includes(q) ||
                phone.includes(q) ||
                license.includes(q);

            const matchesTier =
                tierFilter === 'all' || customer.tier === tierFilter;

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && customer.isActive) ||
                (statusFilter === 'inactive' && !customer.isActive);

            const matchesVoucher =
                !voucherOnly || customer.benefits.birthdayVoucher;

            return matchesSearch && matchesTier && matchesStatus && matchesVoucher;
        });
    }, [customers, searchQuery, tierFilter, statusFilter, voucherOnly]);

    // Top Stats Aggregates
    const stats = useMemo(() => {
        const total = customers.length;
        const vips = customers.filter(c => c.tier === 'VIP').length;
        const regulars = customers.filter(c => c.tier === 'Stammkunde').length;
        const newComers = customers.filter(c => c.tier === 'Neukunde').length;
        const totalRevenue = customers.reduce((sum, c) => sum + c.totalRevenue, 0);
        const voucherEligible = customers.filter(c => c.benefits.birthdayVoucher).length;

        return { total, vips, regulars, newComers, totalRevenue, voucherEligible };
    }, [customers]);

    // Active status toggle
    async function toggleActive(customer: Customer) {
        setProcessingId(customer.id);
        const nextStatus = !customer.isActive;

        try {
            const res = await fetch(`/api/admin/customers/${customer.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: nextStatus })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Fehler beim Aktualisieren des Status');
            }

            setCustomers(prev =>
                prev.map(c => (c.id === customer.id ? { ...c, isActive: nextStatus } : c))
            );
            toast.success(`Kunde "${customer.firstName} ${customer.lastName}" ist nun ${nextStatus ? 'Aktiv' : 'Inaktiv'}.`);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Status konnte nicht geändert werden');
        } finally {
            setProcessingId(null);
        }
    }

    // Delete customer
    async function confirmDeleteCustomer() {
        if (!deleteModalCustomer) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/admin/customers/${deleteModalCustomer.id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Fehler beim Löschen des Kunden');
            }

            setCustomers(prev => prev.filter(c => c.id !== deleteModalCustomer.id));
            toast.success(`Kunde "${deleteModalCustomer.firstName} ${deleteModalCustomer.lastName}" wurde erfolgreich gelöscht.`);
            setDeleteModalCustomer(null);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Fehler beim Löschen des Kunden');
        } finally {
            setIsDeleting(false);
        }
    }

    // Export to CSV
    const handleExportCSV = () => {
        const headers = ['ID', 'Vorname', 'Nachname', 'E-Mail', 'Telefon', 'Führerschein', 'Treuestufe', 'Status', 'Mieten', 'Gesamtumsatz (EUR)', 'Kunde seit'];
        const rows = filteredCustomers.map(c => [
            c.id,
            `"${c.firstName}"`,
            `"${c.lastName}"`,
            `"${c.email}"`,
            `"${c.phone || ''}"`,
            `"${c.licenseNumber || ''}"`,
            c.tier,
            c.isActive ? 'Aktiv' : 'Inaktiv',
            c.totalRentals,
            c.totalRevenue.toFixed(2),
            format(new Date(c.createdAt), 'yyyy-MM-dd')
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `rent-ex-kunden-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getTierBadge = (tier: string) => {
        switch (tier) {
            case 'VIP': 
                return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
            case 'Stammkunde': 
                return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
            default: 
                return 'bg-hm-paper-2 text-hm-muted border-hm-rule';
        }
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case 'VIP': return Crown;
            case 'Stammkunde': return Star;
            default: return Award;
        }
    };

    const hasActiveFilters = searchQuery !== '' || tierFilter !== 'all' || statusFilter !== 'all' || voucherOnly;

    return (
        <div className="space-y-6">
            {/* Interactive Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* VIP Customers */}
                <button
                    onClick={() => {
                        setTierFilter(tierFilter === 'VIP' ? 'all' : 'VIP');
                        setVoucherOnly(false);
                    }}
                    className={clsx(
                        "bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border transition-all text-left flex flex-col justify-between cursor-pointer",
                        tierFilter === 'VIP'
                            ? "border-amber-500 ring-2 ring-amber-500/20 shadow-sm"
                            : "border-hm-rule hover:border-hm-muted"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="rounded-[var(--hm-radius-input)] p-2 bg-amber-500/10 text-amber-600">
                            <Crown className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-hm-paper-2 text-hm-muted border border-hm-rule">
                            ≥ 10 Mieten
                        </span>
                    </div>
                    <div className="mt-3">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">VIP Kunden</p>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink mt-0.5 font-mono">
                            {stats.vips}
                        </p>
                    </div>
                </button>

                {/* Stammkunden */}
                <button
                    onClick={() => {
                        setTierFilter(tierFilter === 'Stammkunde' ? 'all' : 'Stammkunde');
                        setVoucherOnly(false);
                    }}
                    className={clsx(
                        "bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border transition-all text-left flex flex-col justify-between cursor-pointer",
                        tierFilter === 'Stammkunde'
                            ? "border-blue-500 ring-2 ring-blue-500/20 shadow-sm"
                            : "border-hm-rule hover:border-hm-muted"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="rounded-[var(--hm-radius-input)] p-2 bg-blue-500/10 text-blue-600">
                            <Star className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-hm-paper-2 text-hm-muted border border-hm-rule">
                            3-9 Mieten
                        </span>
                    </div>
                    <div className="mt-3">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Stammkunden</p>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink mt-0.5 font-mono">
                            {stats.regulars}
                        </p>
                    </div>
                </button>

                {/* Lifetime Revenue */}
                <div className="bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col justify-between shadow-xs">
                    <div className="flex items-center justify-between">
                        <div className="rounded-[var(--hm-radius-input)] p-2 bg-emerald-500/10 text-emerald-600">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-hm-paper-2 text-hm-muted border border-hm-rule">
                            Gesamtwert
                        </span>
                    </div>
                    <div className="mt-3">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Kundenumsatz</p>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink mt-0.5 font-mono">
                            €{stats.totalRevenue.toLocaleString('de-AT', { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                </div>

                {/* Voucher Eligible */}
                <button
                    onClick={() => {
                        setVoucherOnly(!voucherOnly);
                        setTierFilter('all');
                    }}
                    className={clsx(
                        "bg-hm-paper p-5 rounded-[var(--hm-radius-card)] border transition-all text-left flex flex-col justify-between cursor-pointer",
                        voucherOnly
                            ? "border-purple-500 ring-2 ring-purple-500/20 shadow-sm"
                            : "border-hm-rule hover:border-hm-muted"
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="rounded-[var(--hm-radius-input)] p-2 bg-purple-500/10 text-purple-600">
                            <Gift className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-hm-paper-2 text-hm-muted border border-hm-rule">
                            Treuebonus
                        </span>
                    </div>
                    <div className="mt-3">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">Gutschein-berechtigt</p>
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink mt-0.5 font-mono">
                            {stats.voucherEligible}
                        </p>
                    </div>
                </button>
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
                            placeholder="Kunden suchen (Name, E-Mail, Telefon, Führerschein, ID)..."
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
                        {/* Tier Filters */}
                        <div className="inline-flex rounded-[var(--hm-radius-input)] p-1 bg-hm-paper-2 border border-hm-rule text-xs font-semibold">
                            <button
                                onClick={() => { setTierFilter('all'); setVoucherOnly(false); }}
                                className={clsx(
                                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                                    tierFilter === 'all' && !voucherOnly
                                        ? "bg-hm-paper text-hm-ink shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Alle ({customers.length})
                            </button>
                            <button
                                onClick={() => { setTierFilter('VIP'); setVoucherOnly(false); }}
                                className={clsx(
                                    "px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1",
                                    tierFilter === 'VIP'
                                        ? "bg-hm-paper text-amber-600 dark:text-amber-400 shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                <Crown className="w-3 h-3" />
                                VIP ({stats.vips})
                            </button>
                            <button
                                onClick={() => { setTierFilter('Stammkunde'); setVoucherOnly(false); }}
                                className={clsx(
                                    "px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1",
                                    tierFilter === 'Stammkunde'
                                        ? "bg-hm-paper text-blue-600 dark:text-blue-400 shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                <Star className="w-3 h-3" />
                                Stamm ({stats.regulars})
                            </button>
                            <button
                                onClick={() => { setTierFilter('Neukunde'); setVoucherOnly(false); }}
                                className={clsx(
                                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                                    tierFilter === 'Neukunde'
                                        ? "bg-hm-paper text-hm-ink shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                Neu ({stats.newComers})
                            </button>
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="h-9 px-3 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 text-hm-ink text-xs font-semibold focus:outline-none focus:border-hm-accent"
                        >
                            <option value="all">Alle Status</option>
                            <option value="active">Nur Aktive</option>
                            <option value="inactive">Nur Inaktive</option>
                        </select>

                        {/* Export CSV Button */}
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 h-9 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper hover:bg-hm-paper-2 px-3 font-mono text-xs font-semibold text-hm-ink transition-colors shadow-xs cursor-pointer"
                            title="Kundenliste als CSV exportieren"
                        >
                            <Download className="h-3.5 w-3.5 text-hm-muted" />
                            <span>Export</span>
                        </button>

                        {/* View Mode Toggle */}
                        <div className="inline-flex rounded-[var(--hm-radius-input)] p-1 bg-hm-paper-2 border border-hm-rule">
                            <button
                                onClick={() => setViewMode('table')}
                                className={clsx(
                                    "p-1.5 rounded-md transition-all cursor-pointer",
                                    viewMode === 'table'
                                        ? "bg-hm-paper text-hm-ink shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                                title="Tabellenansicht"
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={clsx(
                                    "p-1.5 rounded-md transition-all cursor-pointer",
                                    viewMode === 'grid'
                                        ? "bg-hm-paper text-hm-ink shadow-xs"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                                title="Kartenansicht"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Reset Filter Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setTierFilter('all');
                                    setStatusFilter('all');
                                    setVoucherOnly(false);
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

            {/* Customers Display: Table or Grid */}
            {viewMode === 'table' ? (
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-[11px] font-mono text-hm-muted bg-hm-paper-2 border-b border-hm-rule uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Kunde</th>
                                    <th className="px-6 py-3 font-semibold">Kontakt & Führerschein</th>
                                    <th className="px-6 py-3 font-semibold">Treuestufe</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Historie</th>
                                    <th className="px-6 py-3 font-semibold">Letzte Miete</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm font-mono text-hm-muted">
                                            {hasActiveFilters ? (
                                                <div className="space-y-2">
                                                    <p>Keine Kunden entsprechen den Suchkriterien.</p>
                                                    <button
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setTierFilter('all');
                                                            setStatusFilter('all');
                                                            setVoucherOnly(false);
                                                        }}
                                                        className="text-xs text-hm-accent font-semibold hover:underline"
                                                    >
                                                        Filter zurücksetzen
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="py-6">
                                                    <Users className="w-10 h-10 text-hm-muted/40 mx-auto mb-2" />
                                                    <p>Keine Kunden registriert.</p>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((customer) => {
                                        const TierIcon = getTierIcon(customer.tier);
                                        const isProcessing = processingId === customer.id;

                                        return (
                                            <tr key={customer.id} className={clsx(
                                                "hover:bg-hm-paper-2/50 transition-colors",
                                                !customer.isActive && "opacity-60 bg-hm-paper-2/20"
                                            )}>
                                                {/* Customer Info */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-hm-paper-2 flex items-center justify-center text-hm-ink font-mono font-bold text-xs border border-hm-rule">
                                                            {customer.firstName[0]}{customer.lastName[0]}
                                                        </div>
                                                        <div>
                                                            <Link 
                                                                href={`/admin/customers/${customer.id}`}
                                                                className="font-semibold text-hm-ink hover:text-hm-accent transition-colors flex items-center gap-1 group/name"
                                                            >
                                                                <span>{customer.firstName} {customer.lastName}</span>
                                                                <ArrowUpRight className="w-3 h-3 text-hm-muted opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                                            </Link>
                                                            <p className="text-[11px] font-mono text-hm-muted">
                                                                Seit {format(new Date(customer.createdAt), 'MMM yyyy', { locale: de })} · ID #{customer.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact & Phone & License */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <a 
                                                                href={`mailto:${customer.email}`}
                                                                className="flex items-center gap-1.5 text-hm-ink hover:text-hm-accent font-mono transition-colors"
                                                                title={`E-Mail senden: ${customer.email}`}
                                                            >
                                                                <Mail className="h-3.5 w-3.5 text-hm-muted" />
                                                                <span>{customer.email}</span>
                                                            </a>
                                                        </div>

                                                        {customer.phone && (
                                                            <div className="flex items-center gap-1.5 text-xs">
                                                                <a 
                                                                    href={`tel:${customer.phone}`}
                                                                    className="flex items-center gap-1.5 text-hm-ink hover:text-hm-accent font-mono transition-colors"
                                                                    title={`Anrufen: ${customer.phone}`}
                                                                >
                                                                    <Phone className="h-3.5 w-3.5 text-hm-muted" />
                                                                    <span>{customer.phone}</span>
                                                                </a>
                                                            </div>
                                                        )}

                                                        {customer.licenseNumber && (
                                                            <div className="text-[11px] text-hm-muted font-mono flex items-center gap-1">
                                                                <FileText className="w-3 h-3 text-hm-muted" />
                                                                <span>FS: {customer.licenseNumber}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Tier Status */}
                                                <td className="px-6 py-4">
                                                    <span className={clsx(
                                                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border',
                                                        getTierBadge(customer.tier)
                                                    )}>
                                                        <TierIcon className="h-3 w-3" />
                                                        <span>{customer.tier}</span>
                                                    </span>
                                                    {customer.benefits.birthdayVoucher && (
                                                        <div className="mt-1">
                                                            <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded">
                                                                Bonus aktiv
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Active Toggle */}
                                                <td className="px-6 py-4">
                                                    <button 
                                                        onClick={() => toggleActive(customer)}
                                                        disabled={isProcessing}
                                                        className="transition-opacity disabled:opacity-50 cursor-pointer"
                                                        title={customer.isActive ? "Klicken zum Deaktivieren" : "Klicken zum Aktivieren"}
                                                    >
                                                        {isProcessing ? (
                                                            <Loader2 className="w-5 h-5 animate-spin text-hm-muted" />
                                                        ) : customer.isActive ? (
                                                            <ToggleRight className="w-6 h-6 text-emerald-600" />
                                                        ) : (
                                                            <ToggleLeft className="w-6 h-6 text-hm-muted" />
                                                        )}
                                                    </button>
                                                </td>

                                                {/* Statistics */}
                                                <td className="px-6 py-4">
                                                    <div className="font-mono text-xs">
                                                        <p className="font-semibold text-hm-ink hm-tnum">
                                                            {customer.totalRentals} Mieten
                                                        </p>
                                                        <p className="text-[11px] text-hm-muted hm-tnum">
                                                            €{customer.totalRevenue.toLocaleString('de-AT', { minimumFractionDigits: 0 })}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Last Rental (with direct link) */}
                                                <td className="px-6 py-4 font-mono text-xs">
                                                    {customer.lastRental ? (
                                                        <Link
                                                            href={`/admin/reservations/${customer.lastRental.id}`}
                                                            className="block hover:text-hm-accent transition-colors group/rental"
                                                            title="Buchung aufrufen"
                                                        >
                                                            <div className="text-hm-ink font-semibold flex items-center gap-1">
                                                                <span>{format(new Date(customer.lastRental.createdAt), 'dd.MM.yyyy', { locale: de })}</span>
                                                                <ArrowUpRight className="w-3 h-3 text-hm-muted opacity-0 group-hover/rental:opacity-100 transition-opacity" />
                                                            </div>
                                                            <div className="text-[11px] text-hm-muted">
                                                                vor {customer.daysSinceLastRental} Tagen
                                                            </div>
                                                        </Link>
                                                    ) : (
                                                        <span className="text-[11px] text-hm-muted italic">Keine Miete</span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link 
                                                            href={`/admin/customers/${customer.id}`} 
                                                            className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors" 
                                                            title="Kundenprofil & Dokumente"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link 
                                                            href={`/admin/customers/${customer.id}/rentals`} 
                                                            className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors" 
                                                            title="Miet-Historie"
                                                        >
                                                            <History className="w-4 h-4" />
                                                        </Link>
                                                        <button 
                                                            onClick={() => setDeleteModalCustomer(customer)}
                                                            className="p-1.5 text-hm-muted hover:text-red-600 hover:bg-red-500/10 rounded-[var(--hm-radius-input)] transition-colors cursor-pointer"
                                                            title="Kunde löschen"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
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
            ) : (
                /* Grid / Card View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCustomers.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-hm-muted bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule">
                            <Users className="w-10 h-10 text-hm-muted/40 mx-auto mb-2" />
                            <p className="text-xs font-mono uppercase tracking-wider">Keine Kunden gefunden</p>
                        </div>
                    ) : (
                        filteredCustomers.map(customer => {
                            const TierIcon = getTierIcon(customer.tier);
                            const isProcessing = processingId === customer.id;

                            return (
                                <div
                                    key={customer.id}
                                    className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule shadow-sm p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-hm-paper-2 flex items-center justify-center text-hm-ink font-mono font-bold text-sm border border-hm-rule">
                                                    {customer.firstName[0]}{customer.lastName[0]}
                                                </div>
                                                <div>
                                                    <Link 
                                                        href={`/admin/customers/${customer.id}`}
                                                        className="font-bold text-hm-ink hover:text-hm-accent transition-colors flex items-center gap-1"
                                                    >
                                                        <span>{customer.firstName} {customer.lastName}</span>
                                                        <ArrowUpRight className="w-3.5 h-3.5 text-hm-muted" />
                                                    </Link>
                                                    <p className="text-xs text-hm-muted font-mono">
                                                        ID #{customer.id}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className={clsx(
                                                'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border',
                                                getTierBadge(customer.tier)
                                            )}>
                                                <TierIcon className="h-3 w-3" />
                                                <span>{customer.tier}</span>
                                            </span>
                                        </div>

                                        {/* Contact Badges */}
                                        <div className="space-y-1.5 pt-1 text-xs">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-hm-muted" />
                                                <a href={`mailto:${customer.email}`} className="text-hm-ink hover:text-hm-accent font-mono truncate">
                                                    {customer.email}
                                                </a>
                                            </div>
                                            {customer.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-hm-muted" />
                                                    <a href={`tel:${customer.phone}`} className="text-hm-ink hover:text-hm-accent font-mono">
                                                        {customer.phone}
                                                    </a>
                                                </div>
                                            )}
                                            {customer.licenseNumber && (
                                                <div className="flex items-center gap-2 text-hm-muted font-mono text-[11px]">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    <span>FS: {customer.licenseNumber}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rental Metrics Pill */}
                                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-hm-rule text-xs font-mono">
                                            <div className="bg-hm-paper-2 p-2 rounded-[var(--hm-radius-input)]">
                                                <span className="text-[10px] text-hm-muted uppercase">Mieten</span>
                                                <p className="font-bold text-hm-ink text-sm mt-0.5">{customer.totalRentals}</p>
                                            </div>
                                            <div className="bg-hm-paper-2 p-2 rounded-[var(--hm-radius-input)]">
                                                <span className="text-[10px] text-hm-muted uppercase">Umsatz</span>
                                                <p className="font-bold text-hm-ink text-sm mt-0.5">€{customer.totalRevenue.toLocaleString('de-AT')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-hm-rule">
                                        <button 
                                            onClick={() => toggleActive(customer)}
                                            disabled={isProcessing}
                                            className="text-xs font-medium text-hm-muted hover:text-hm-ink flex items-center gap-1 cursor-pointer"
                                        >
                                            {customer.isActive ? (
                                                <span className="text-emerald-600 font-semibold">● Aktiv</span>
                                            ) : (
                                                <span className="text-hm-muted">○ Inaktiv</span>
                                            )}
                                        </button>

                                        <div className="flex items-center gap-1">
                                            <Link 
                                                href={`/admin/customers/${customer.id}`} 
                                                className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-md"
                                                title="Profil"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link 
                                                href={`/admin/customers/${customer.id}/rentals`} 
                                                className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-md"
                                                title="Historie"
                                            >
                                                <History className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                onClick={() => setDeleteModalCustomer(customer)}
                                                className="p-1.5 text-hm-muted hover:text-red-600 hover:bg-red-500/10 rounded-md cursor-pointer"
                                                title="Löschen"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div 
                        className="bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-card)] max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-red-500/10 text-red-600 flex-shrink-0">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-hm-ink">
                                    Kunden löschen
                                </h3>
                                <p className="text-sm text-hm-muted">
                                    Möchten Sie den Kunden <strong className="text-hm-ink font-semibold">"{deleteModalCustomer.firstName} {deleteModalCustomer.lastName}"</strong> ({deleteModalCustomer.email}) wirklich löschen?
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-[var(--hm-radius-input)] bg-red-500/10 border border-red-500/20 text-xs text-red-800 dark:text-red-300">
                            Hinweis: Kunden mit aktiven oder ausstehenden Buchungen können zum Schutz der Buchungshistorie nicht gelöscht werden.
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setDeleteModalCustomer(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper text-hm-ink hover:bg-hm-paper-2 text-sm font-medium transition-all disabled:opacity-50 cursor-pointer"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={confirmDeleteCustomer}
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
                                        <span>Ja, Kunde löschen</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
