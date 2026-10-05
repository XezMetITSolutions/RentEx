/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
"use client";

import { useState } from "react";
import { 
    Mail, Crown, Star, Award, FileText,
    ToggleLeft, ToggleRight, Trash2, Loader2,
    Eye, History, Users
} from "lucide-react";
import { clsx } from "clsx";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    licenseNumber: string | null;
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
    const [customers, setCustomers] = useState(initialCustomers);
    const [processingId, setProcessingId] = useState<number | null>(null);
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

    return (
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
                    {customers.map((customer) => {
                        const TierIcon = getTierIcon(customer.tier);
                        const isProcessing = processingId === customer.id;

                        return (
                            <tr key={customer.id} className={clsx(
                                "hover:bg-hm-paper-2/50 transition-colors",
                                !customer.isActive && "opacity-50"
                            )}>
                                {/* Customer Info */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-hm-paper-2 flex items-center justify-center text-hm-ink font-mono font-bold text-xs border border-hm-rule">
                                            {customer.firstName[0]}{customer.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-hm-ink">
                                                {customer.firstName} {customer.lastName}
                                            </p>
                                            <p className="text-[11px] font-mono text-hm-muted">
                                                Seit {format(new Date(customer.createdAt), 'MMM yyyy', { locale: de })}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Contact */}
                                <td className="px-6 py-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-hm-ink font-mono">
                                            <Mail className="h-3 w-3 text-hm-muted" />
                                            {customer.email}
                                        </div>
                                        {customer.licenseNumber && (
                                            <div className="text-[11px] text-hm-muted font-mono flex items-center gap-1">
                                                <FileText className="w-3 h-3 text-hm-muted" />
                                                {customer.licenseNumber}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* Tier Status */}
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] text-[10px] font-mono font-bold uppercase tracking-wider border',
                                        getTierBadge(customer.tier)
                                    )}>
                                        <TierIcon className="h-3 w-3" />
                                        {customer.tier}
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

                                {/* Last Rental */}
                                <td className="px-6 py-4 font-mono text-xs">
                                    {customer.lastRental ? (
                                        <div>
                                            <p className="text-hm-ink font-medium">
                                                {format(new Date(customer.lastRental.createdAt), 'dd.MM.yyyy', { locale: de })}
                                            </p>
                                            <p className="text-[11px] text-hm-muted">
                                                vor {customer.daysSinceLastRental} Tagen
                                            </p>
                                        </div>
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
                                            title="Profil"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link 
                                            href={`/admin/customers/${customer.id}/rentals`} 
                                            className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors" 
                                            title="Historie"
                                        >
                                            <History className="w-4 h-4" />
                                        </Link>
                                        <button 
                                            onClick={() => deleteCustomer(customer)}
                                            disabled={isProcessing}
                                            className="p-1.5 text-hm-muted hover:text-red-600 hover:bg-red-500/10 rounded-[var(--hm-radius-input)] transition-colors disabled:opacity-50"
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
            {customers.length === 0 && (
                <div className="py-20 text-center text-hm-muted">
                    <Users className="w-10 h-10 text-hm-muted/40 mx-auto mb-3" />
                    <p className="text-xs font-mono uppercase tracking-wider">Keine Kunden gefunden</p>
                </div>
            )}
        </div>
    );
}
