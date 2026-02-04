'use client';

import { useState, useTransition } from 'react';
import { TrendingUp, TrendingDown, Minus, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { updateCompetitorPrices } from '@/app/actions';

interface CompetitorPrice {
    competitor: string;
    dailyRate: number;
    weeklyRate: number;
    monthlyRate: number;
    lastUpdated: string;
}

interface CarComparison {
    id: number;
    brand: string;
    model: string;
    category: string;
    ourPrice: number;
    marketAverage: number;
    recommendation: 'increase' | 'decrease' | 'maintain';
    competitors: CompetitorPrice[];
}

interface PricingViewProps {
    data: CarComparison[];
}

export default function PricingView({ data }: PricingViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isUpdating, startTransition] = useTransition();

    const filteredData = data.filter(car => {
        const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.model.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || car.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleUpdatePrices = () => {
        startTransition(async () => {
            await updateCompetitorPrices();
        });
    };

    const getRecommendationIcon = (recommendation: string) => {
        switch (recommendation) {
            case 'increase': return <TrendingUp className="h-5 w-5" />;
            case 'decrease': return <TrendingDown className="h-5 w-5" />;
            default: return <Minus className="h-5 w-5" />;
        }
    };

    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation) {
            case 'increase': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'decrease': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
            default: return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        }
    };

    const getRecommendationText = (recommendation: string) => {
        switch (recommendation) {
            case 'increase': return 'Preis erhöhen';
            case 'decrease': return 'Preis senken';
            default: return 'Preis beibehalten';
        }
    };

    const getPriceDifference = (ourPrice: number, marketAverage: number) => {
        const diff = ourPrice - marketAverage;
        const percentage = marketAverage > 0 ? ((diff / marketAverage) * 100).toFixed(1) : '0.0';
        return { diff, percentage };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wettbewerbsanalyse</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Vergleichen Sie Ihre Preise mit der Konkurrenz (Live Daten)
                    </p>
                </div>
                <button
                    onClick={handleUpdatePrices}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
                    {isUpdating ? 'Wird aktualisiert...' : 'Preise aktualisieren'}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Marke oder Modell suchen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                    >
                        <option value="all">Alle Kategorien</option>
                        <option value="Kleinwagen">Kleinwagen</option>
                        <option value="Limousine">Limousine</option>
                        <option value="SUV">SUV</option>
                        <option value="Van">Van</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Durchschnitt unter Markt</span>
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {data.filter(c => c.ourPrice < c.marketAverage && c.marketAverage > 0).length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fahrzeuge</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Über Markt</span>
                        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {data.filter(c => c.ourPrice > c.marketAverage).length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fahrzeuge</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Marktgerecht</span>
                        <Minus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {data.filter(c => Math.abs(c.ourPrice - c.marketAverage) <= 5 || c.marketAverage === 0).length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fahrzeuge</p>
                </div>
            </div>

            {/* Comparison Table */}
            {filteredData.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Keine Daten verfügbar</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Klicken Sie auf "Preise aktualisieren", um die neuesten Marktdaten abzurufen.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredData.map((car) => {
                        const { diff, percentage } = getPriceDifference(car.ourPrice, car.marketAverage);

                        return (
                            <div key={car.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                                {/* Car Header */}
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {car.brand} {car.model}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{car.category}</p>
                                        </div>

                                        <div className="flex items-center gap-4 flex-wrap">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Unser Preis</p>
                                                <p className="text-2xl font-bold text-gray-900 dark:text-white">€{car.ourPrice}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Marktdurchschnitt</p>
                                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {car.marketAverage > 0 ? `€${car.marketAverage}` : '-'}
                                                </p>
                                            </div>
                                            <div className={clsx(
                                                'flex items-center gap-2 px-4 py-2 rounded-lg border font-medium',
                                                getRecommendationColor(car.recommendation)
                                            )}>
                                                {getRecommendationIcon(car.recommendation)}
                                                {getRecommendationText(car.recommendation)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price Difference */}
                                    {car.marketAverage > 0 && (
                                        <div className="mt-4 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {diff > 0 ? (
                                                    <span className="text-red-600 dark:text-red-400 font-medium">
                                                        €{Math.abs(diff).toFixed(2)} ({percentage}%) teurer als Markt
                                                    </span>
                                                ) : diff < 0 ? (
                                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                                        €{Math.abs(diff).toFixed(2)} ({Math.abs(Number(percentage))}%) günstiger als Markt
                                                    </span>
                                                ) : (
                                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                        Genau im Marktdurchschnitt
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Competitors Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Anbieter</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tagespreis</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Wochenpreis (Est.)</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Monatspreis (Est.)</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aktualisiert</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {car.competitors.length > 0 ? (
                                                car.competitors.map((comp, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{comp.competitor}</td>
                                                        <td className="px-6 py-4 text-sm text-right">
                                                            <span className={clsx(
                                                                'font-semibold',
                                                                comp.dailyRate < car.ourPrice ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                                            )}>
                                                                €{comp.dailyRate.toFixed(2)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 text-right">€{(comp.dailyRate * 7 * 0.85).toFixed(0)}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 text-right">€{(comp.dailyRate * 30 * 0.70).toFixed(0)}</td>
                                                        <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 text-right">{new Date(comp.lastUpdated).toLocaleDateString("de-DE")}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                        Keine Wettbewerberdaten gefunden. Aktualisieren Sie die Preise.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
