'use client';

import { useState } from 'react';
import { X, Calendar, DollarSign, Car as CarIcon, User } from 'lucide-react';
import { clsx } from 'clsx';

interface FilterConfig {
    status?: string[];
    dateRange?: { start: Date | null; end: Date | null };
    priceRange?: { min: number; max: number };
    category?: string[];
    location?: string[];
    paymentStatus?: string[];
}

interface AdvancedFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterConfig) => void;
    type: 'rentals' | 'cars' | 'customers';
}

export default function AdvancedFilters({ isOpen, onClose, onApply, type }: AdvancedFiltersProps) {
    const [filters, setFilters] = useState<FilterConfig>({});

    if (!isOpen) return null;

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleReset = () => {
        setFilters({});
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Erweiterte Filter</h2>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Status Filter */}
                        {type === 'rentals' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Status
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Active', 'Pending', 'Completed', 'Cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                const current = filters.status || [];
                                                setFilters({
                                                    ...filters,
                                                    status: current.includes(status)
                                                        ? current.filter(s => s !== status)
                                                        : [...current, status]
                                                });
                                            }}
                                            className={clsx(
                                                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                                filters.status?.includes(status)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            )}
                                        >
                                            {status === 'Active' ? 'Aktiv' :
                                                status === 'Pending' ? 'Ausstehend' :
                                                    status === 'Completed' ? 'Abgeschlossen' : 'Storniert'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Date Range */}
                        {type === 'rentals' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    <Calendar className="inline h-4 w-4 mr-2" />
                                    Zeitraum
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Von</label>
                                        <input
                                            type="date"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            onChange={(e) => setFilters({
                                                ...filters,
                                                dateRange: { ...filters.dateRange, start: e.target.value ? new Date(e.target.value) : null, end: filters.dateRange?.end || null }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Bis</label>
                                        <input
                                            type="date"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            onChange={(e) => setFilters({
                                                ...filters,
                                                dateRange: { start: filters.dateRange?.start || null, end: e.target.value ? new Date(e.target.value) : null }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Price Range */}
                        {(type === 'rentals' || type === 'cars') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    <DollarSign className="inline h-4 w-4 mr-2" />
                                    Preisbereich (€)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Min</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            onChange={(e) => setFilters({
                                                ...filters,
                                                priceRange: { min: Number(e.target.value), max: filters.priceRange?.max || 10000 }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max</label>
                                        <input
                                            type="number"
                                            placeholder="10000"
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            onChange={(e) => setFilters({
                                                ...filters,
                                                priceRange: { min: filters.priceRange?.min || 0, max: Number(e.target.value) }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Category Filter */}
                        {type === 'cars' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    <CarIcon className="inline h-4 w-4 mr-2" />
                                    Kategorie
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Kleinwagen', 'Limousine', 'SUV', 'Van', 'Sportwagen', 'Cabrio'].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                const current = filters.category || [];
                                                setFilters({
                                                    ...filters,
                                                    category: current.includes(cat)
                                                        ? current.filter(c => c !== cat)
                                                        : [...current, cat]
                                                });
                                            }}
                                            className={clsx(
                                                'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                                                filters.category?.includes(cat)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Standort
                            </label>
                            <select
                                multiple
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                                    setFilters({ ...filters, location: selected });
                                }}
                            >
                                <option value="München">München</option>
                                <option value="Frankfurt">Frankfurt</option>
                                <option value="Berlin">Berlin</option>
                                <option value="Hamburg">Hamburg</option>
                                <option value="Köln">Köln</option>
                            </select>
                        </div>

                        {/* Payment Status */}
                        {type === 'rentals' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Zahlungsstatus
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Pending', 'Partial', 'Paid', 'Refunded'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                const current = filters.paymentStatus || [];
                                                setFilters({
                                                    ...filters,
                                                    paymentStatus: current.includes(status)
                                                        ? current.filter(s => s !== status)
                                                        : [...current, status]
                                                });
                                            }}
                                            className={clsx(
                                                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                                filters.paymentStatus?.includes(status)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            )}
                                        >
                                            {status === 'Pending' ? 'Ausstehend' :
                                                status === 'Partial' ? 'Teilweise' :
                                                    status === 'Paid' ? 'Bezahlt' : 'Erstattet'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-6 py-4">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Zurücksetzen
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleApply}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                Filter anwenden
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
