"use client";

import { useState } from "react";
import { 
    Mail, Phone, MapPin, Crown, Gift, Shield, 
    Calendar, TrendingUp, Star, Award, FileText,
    ToggleLeft, ToggleRight, Trash2, Loader2,
    Eye, History
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

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'VIP': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
            case 'Stammkunde': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kunde</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kontakt</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aktiv</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statistik</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Letzte Miete</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {customers.map((customer) => {
                            const TierIcon = getTierIcon(customer.tier);
                            const isProcessing = processingId === customer.id;

                            return (
                                <tr key={customer.id} className={clsx(
                                    "hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors",
                                    !customer.isActive && "opacity-60 grayscale-[0.5]"
                                )}>
                                    {/* Customer Info */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                {customer.firstName[0]}{customer.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {customer.firstName} {customer.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Kunde seit {format(new Date(customer.createdAt), 'MMM yyyy', { locale: de })}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Contact */}
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                <Mail className="h-3 w-3" />
                                                {customer.email}
                                            </div>
                                            {customer.licenseNumber && (
                                                <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />
                                                    {customer.licenseNumber}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Tier Status */}
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm',
                                            getTierColor(customer.tier)
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
                                            className="hover:scale-110 transition-transform disabled:opacity-50"
                                            title={customer.isActive ? "Deaktivieren" : "Aktivieren"}
                                        >
                                            {isProcessing ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                            ) : customer.isActive ? (
                                                <ToggleRight className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="w-6 h-6 text-gray-400" />
                                            )}
                                        </button>
                                    </td>

                                    {/* Statistics */}
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {customer.totalRentals} Vermietungen
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                €{customer.totalRevenue.toLocaleString('de-AT')} Umsatz
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
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    vor {customer.daysSinceLastRental} Tagen
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">Keine Miete</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/customers/${customer.id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white" title="Profil">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link href={`/admin/customers/${customer.id}/rentals`} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-blue-600" title="Historie">
                                                <History className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                onClick={() => deleteCustomer(customer)}
                                                disabled={isProcessing}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-500 disabled:opacity-50"
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
                    <div className="py-20 text-center text-gray-500">
                        Keine Kunden gefunden.
                    </div>
                )}
            </div>
        </div>
    );
}
