'use client';

import { useState, useMemo } from 'react';
import { 
    Mail, Phone, MapPin, Crown, Gift, Shield, 
    Calendar, TrendingUp, Star, Award, FileText,
    ToggleLeft, ToggleRight, Trash2, Loader2,
    Eye, History, Users, Search, Plus, Ban,
    CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    licenseNumber: string | null;
    licenseExpiryDate: string | null;
    licensePhotoUrl: string | null;
    idPhotoUrl: string | null;
    idAustriaVerified: boolean | null;
    isBlacklisted: boolean;
    blacklistReason: string | null;
    createdAt: Date | string;
    isActive: boolean;
    tier: string;
    totalRentals: number;
    totalRevenue: number;
    lastRental: any;
    daysSinceLastRental: number | null;
    benefits: {
        noDeposit: boolean;
        birthdayVoucher: boolean;
        loyaltyDiscount: number;
    };
}

export default function CustomerTable({ initialCustomers }: { initialCustomers: Customer[] }) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'vip' | 'stammkunde' | 'gesperrt' | 'check'>('all');
    const router = useRouter();

    async function toggleActive(customer: Customer) {
        setProcessingId(customer.id);
        try {
            const res = await fetch(`/api/admin/customers/${customer.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !customer.isActive })
            });

            if (res.ok) {
                setCustomers(prev => prev.map(c => 
                    c.id === customer.id ? { ...c, isActive: !c.isActive } : c
                ));
                router.refresh();
            }
        } catch (error) {
            console.error("Error toggling customer status:", error);
        } finally {
            setProcessingId(null);
        }
    }

    async function deleteCustomer(customer: Customer) {
        if (!confirm(`${customer.firstName} ${customer.lastName} wirklich löschen?`)) return;

        setProcessingId(customer.id);
        try {
            const res = await fetch(`/api/admin/customers/${customer.id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                setCustomers(prev => prev.filter(c => c.id !== customer.id));
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Fehler beim Löschen des Kunden.");
            }
        } catch (error) {
            console.error("Error deleting customer:", error);
            alert("Ein unerwarteter Fehler ist aufgetreten.");
        } finally {
            setProcessingId(null);
        }
    }

    const getTierStyles = (tier: string) => {
        switch (tier) {
            case 'VIP': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50';
            case 'Stammkunde': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50';
            default: return 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
        }
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case 'VIP': return Crown;
            case 'Stammkunde': return Star;
            default: return Award;
        }
    };

    // Filter and Search logic
    const filteredCustomers = useMemo(() => {
        return customers.filter(c => {
            // Search Query Filter
            const searchLower = searchQuery.toLowerCase();
            const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
            const matchesSearch = 
                fullName.includes(searchLower) ||
                c.email.toLowerCase().includes(searchLower) ||
                (c.phone && c.phone.includes(searchLower)) ||
                (c.licenseNumber && c.licenseNumber.toLowerCase().includes(searchLower));

            if (!matchesSearch) return false;

            // Tab Filter
            if (activeTab === 'vip') return c.tier === 'VIP';
            if (activeTab === 'stammkunde') return c.tier === 'Stammkunde';
            if (activeTab === 'gesperrt') return c.isBlacklisted;
            if (activeTab === 'check') {
                const isLicenseExpired = c.licenseExpiryDate ? new Date(c.licenseExpiryDate) < new Date() : false;
                const isLicenseMissing = !c.licenseNumber;
                return isLicenseExpired || isLicenseMissing;
            }

            return true;
        });
    }, [customers, searchQuery, activeTab]);

    return (
        <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="p-4 bg-gray-55/30 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Tabs */}
                <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                    {[
                        { id: 'all', label: 'Alle' },
                        { id: 'vip', label: 'VIP' },
                        { id: 'stammkunde', label: 'Stammkunden' },
                        { id: 'gesperrt', label: 'Gesperrt' },
                        { id: 'check', label: 'Dokumentencheck' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={clsx(
                                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider",
                                activeTab === tab.id 
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Kunden suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-xs text-gray-900 dark:text-white font-medium"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3 font-medium">Kunde</th>
                            <th className="px-6 py-3 font-medium">Kontakt</th>
                            <th className="px-6 py-3 font-medium">Ehliyet / Verifikation</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">Aktiv</th>
                            <th className="px-6 py-3 font-medium">Statistik</th>
                            <th className="px-6 py-3 font-medium">Letzte Miete</th>
                            <th className="px-6 py-3 font-medium text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredCustomers.map((customer) => {
                            const TierIcon = getTierIcon(customer.tier);
                            const isProcessing = processingId === customer.id;

                            const isLicenseExpired = customer.licenseExpiryDate ? new Date(customer.licenseExpiryDate) < new Date() : false;
                            const isLicenseMissing = !customer.licenseNumber;

                            return (
                                <tr key={customer.id} className={clsx(
                                    "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group",
                                    !customer.isActive && "opacity-60 grayscale-[0.3]",
                                    customer.isBlacklisted && "bg-red-500/5 hover:bg-red-500/10"
                                )}>
                                    {/* Customer Info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border",
                                                customer.isBlacklisted 
                                                    ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                                            )}>
                                                {customer.firstName[0]}{customer.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    {customer.firstName} {customer.lastName}
                                                    {customer.isBlacklisted && (
                                                        <span className="p-0.5 bg-red-100 dark:bg-red-900/35 text-red-700 dark:text-red-400 rounded-full" title="Gesperrt">
                                                            <Ban className="w-3 h-3" />
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                    Seit {format(new Date(customer.createdAt), 'MMM yyyy', { locale: de })}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                <Mail className="h-3 w-3 text-gray-400" />
                                                {customer.email}
                                            </div>
                                            {customer.phone && (
                                                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                                    <Phone className="h-3 w-3 text-gray-400" />
                                                    {customer.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Verification Status */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {/* Driving License */}
                                            {isLicenseMissing ? (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-bold border border-gray-200 dark:border-gray-700" title="Keine Ehliyet-Daten">
                                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                                    Ehliyet Eksik
                                                </span>
                                            ) : isLicenseExpired ? (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-[10px] font-bold border border-red-100 dark:border-red-900/30" title="Führerschein abgelaufen">
                                                    <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                                                    Abgelaufen
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/30" title="Führerschein OK">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Führerschein
                                                </span>
                                            )}

                                            {/* ID Austria */}
                                            {customer.idAustriaVerified ? (
                                                <span className="p-1 rounded bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-150 dark:border-green-900/30" title="ID Austria verifiziert">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </span>
                                            ) : (
                                                <span className="p-1 rounded bg-gray-50 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700" title="ID Austria ausstehend">
                                                    <Clock className="w-3.5 h-3.5" />
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Tier Status */}
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border',
                                            customer.isBlacklisted 
                                                ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-900/50'
                                                : getTierStyles(customer.tier)
                                        )}>
                                            {customer.isBlacklisted ? <Ban className="h-3 w-3" /> : <TierIcon className="h-3 w-3" />}
                                            {customer.isBlacklisted ? 'Gesperrt' : customer.tier}
                                        </span>
                                    </td>

                                    {/* Active Toggle */}
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => toggleActive(customer)}
                                            disabled={isProcessing}
                                            className="transition-opacity disabled:opacity-50"
                                            title={customer.isActive ? "Deaktivieren" : "Aktivieren"}
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                            ) : customer.isActive ? (
                                                <ToggleRight className="w-6 h-6 text-emerald-500" />
                                            ) : (
                                                <ToggleLeft className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                            )}
                                        </button>
                                    </td>

                                    {/* Statistics */}
                                    <td className="px-6 py-4">
                                        <div className="space-y-0.5">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {customer.totalRentals} Mieten
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                                €{customer.totalRevenue.toLocaleString('de-AT', { minimumFractionDigits: 0 })} Umsatz
                                            </p>
                                        </div>
                                    </td>

                                    {/* Last Rental */}
                                    <td className="px-6 py-4">
                                        {customer.lastRental ? (
                                            <div className="text-xs">
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {format(new Date(customer.lastRental.createdAt), 'dd.MM.yyyy', { locale: de })}
                                                </p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                    vor {customer.daysSinceLastRental} Tagen
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-[11px] text-gray-400 italic">Keine Miete</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* Quick Neue Reservierung */}
                                            <Link 
                                                href={`/admin/reservations/new?customerId=${customer.id}`} 
                                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                                title="Neue Reservierung erstellen"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Link>
                                            <Link href={`/admin/customers/${customer.id}`} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Profil">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link href={`/admin/customers/${customer.id}/rentals`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Historie">
                                                <History className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                onClick={() => deleteCustomer(customer)}
                                                disabled={isProcessing}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                                title="Löschen"
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

            {filteredCustomers.length === 0 && (
                <div className="py-20 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-b-xl border-t border-gray-200 dark:border-gray-800">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Keine Kunden gefunden</p>
                </div>
            )}
        </div>
    );
}
