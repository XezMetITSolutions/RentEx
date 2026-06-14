'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Search, ChevronRight, Activity, Calendar, List, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReservationCalendar from '@/components/admin/ReservationCalendar';

interface Customer {
    firstName: string;
    lastName: string;
    email: string;
}

interface Car {
    brand: string;
    model: string;
    plate: string;
}

interface Rental {
    id: number;
    startDate: string | Date;
    endDate: string | Date;
    status: string;
    totalAmount: number | string;
    car: Car;
    customer: Customer;
}

interface ReservationsPanelProps {
    initialRentals: Rental[];
    initialView: string;
}

export default function ReservationsPanel({ initialRentals, initialView }: ReservationsPanelProps) {
    const router = useRouter();
    const [view, setView] = useState(initialView);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

    // Calculate metrics
    const stats = useMemo(() => {
        const counts = {
            ALL: initialRentals.length,
            Active: 0,
            Pending: 0,
            Completed: 0,
            Cancelled: 0,
        };

        initialRentals.forEach((rental) => {
            if (rental.status === 'Active') counts.Active++;
            else if (rental.status === 'Pending') counts.Pending++;
            else if (rental.status === 'Completed') counts.Completed++;
            else if (rental.status === 'Cancelled') counts.Cancelled++;
        });

        return counts;
    }, [initialRentals]);

    // Filter rentals
    const filteredRentals = useMemo(() => {
        return initialRentals.filter((rental) => {
            // Status filter
            if (selectedStatus !== 'ALL' && rental.status !== selectedStatus) {
                return false;
            }

            // Search query filter
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                const bookingId = `#${rental.id.toString().padStart(4, '0')}`;
                const customerName = `${rental.customer.firstName} ${rental.customer.lastName}`.toLowerCase();
                const customerEmail = rental.customer.email.toLowerCase();
                const carInfo = `${rental.car.brand} ${rental.car.model} ${rental.car.plate}`.toLowerCase();

                return (
                    bookingId.includes(query) ||
                    customerName.includes(query) ||
                    customerEmail.includes(query) ||
                    carInfo.includes(query)
                );
            }

            return true;
        });
    }, [initialRentals, selectedStatus, searchQuery]);

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-10 px-4 sm:px-6">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Activity className="w-6 h-6 text-gray-400" />
                        Reservierungen
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Übersicht aller aktiven und geplanten Vermietungen.
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200/50 dark:border-gray-700/50">
                        <button
                            onClick={() => setView('list')}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                                view === 'list' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            <List className="h-3.5 w-3.5" />
                            Liste
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                                view === 'calendar' ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            Kalender
                        </button>
                    </div>

                    <Link 
                        href="/admin/reservations/new"
                        className="flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Neue Reservierung
                    </Link>
                </div>
            </div>

            {view === 'calendar' ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm p-6">
                    <ReservationCalendar />
                </div>
            ) : (
                <>
                    {/* Stats Metric Cards (premium SaaS grid) */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { key: 'ALL', label: 'Gesamt', color: 'border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white' },
                            { key: 'Pending', label: 'Ausstehend', color: 'border-amber-100 dark:border-amber-900/20 text-amber-600 dark:text-amber-400' },
                            { key: 'Active', label: 'Aktiv', color: 'border-blue-100 dark:border-blue-900/20 text-blue-600 dark:text-blue-400' },
                            { key: 'Completed', label: 'Abgeschlossen', color: 'border-green-100 dark:border-green-900/20 text-green-600 dark:text-green-400' },
                            { key: 'Cancelled', label: 'Storniert', color: 'border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400' }
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setSelectedStatus(item.key)}
                                className={clsx(
                                    "flex flex-col items-start p-4 rounded-xl border bg-white dark:bg-gray-900 transition-all text-left relative overflow-hidden",
                                    selectedStatus === item.key 
                                        ? "ring-2 ring-gray-900 dark:ring-gray-100 shadow-md"
                                        : "hover:border-gray-300 dark:hover:border-gray-700 shadow-sm"
                                )}
                            >
                                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                                    {item.label}
                                </span>
                                <span className={clsx("text-2xl font-bold mt-2", item.color)}>
                                    {stats[item.key as keyof typeof stats]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Suche nach Name, Kennzeichen..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                            {[
                                { key: 'ALL', label: 'Alle' },
                                { key: 'Pending', label: 'Ausstehend' },
                                { key: 'Active', label: 'Aktiv' },
                                { key: 'Completed', label: 'Abgeschlossen' },
                                { key: 'Cancelled', label: 'Storniert' }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setSelectedStatus(tab.key)}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border",
                                        selectedStatus === tab.key
                                            ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                                            : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Redesigned Table / List */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200/50 dark:border-gray-800/50 uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">ID</th>
                                        <th className="px-6 py-4 font-semibold">Fahrzeug</th>
                                        <th className="px-6 py-4 font-semibold">Kunde</th>
                                        <th className="px-6 py-4 font-semibold">Zeitraum</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Betrag</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                    {filteredRentals.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                                                Keine Reservierungen gefunden.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRentals.map((rental) => {
                                            const startDate = format(new Date(rental.startDate), 'dd.MM.yyyy', { locale: de });
                                            const endDate = format(new Date(rental.endDate), 'dd.MM.yyyy', { locale: de });

                                            return (
                                                <tr 
                                                    key={rental.id} 
                                                    onClick={() => router.push(`/admin/reservations/${rental.id}`)}
                                                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all cursor-pointer group"
                                                >
                                                    <td className="px-6 py-5 font-mono text-[11px] text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                                        #{rental.id.toString().padStart(4, '0')}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {rental.car.brand} {rental.car.model}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 mt-1 font-mono">{rental.car.plate}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="font-medium text-gray-700 dark:text-gray-300">
                                                            {rental.customer.firstName} {rental.customer.lastName}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 mt-1">{rental.customer.email}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="font-medium text-gray-800 dark:text-gray-200">{startDate}</div>
                                                        <div className="text-[11px] text-gray-400 mt-1 font-medium">bis {endDate}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={clsx(
                                                            "inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border",
                                                            rental.status === 'Active' && "bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800/30",
                                                            rental.status === 'Completed' && "bg-gray-50/50 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700/50",
                                                            rental.status === 'Pending' && "bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800/30",
                                                            rental.status === 'Cancelled' && "bg-red-50/50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/30"
                                                        )}>
                                                            {rental.status === 'Active' && 'Aktiv'}
                                                            {rental.status === 'Completed' && 'Abgeschlossen'}
                                                            {rental.status === 'Pending' && 'Ausstehend'}
                                                            {rental.status === 'Cancelled' && 'Storniert'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 font-bold text-gray-900 dark:text-white text-right">
                                                        {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(rental.totalAmount))}
                                                    </td>
                                                    <td className="px-6 py-5 text-right w-10">
                                                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-gray-950 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
