'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

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
    competitors: CompetitorPrice[];
    marketAverage: number;
    recommendation: 'increase' | 'decrease' | 'maintain';
}

// Mock data - In production, this would come from API/scraping
const mockData: CarComparison[] = [
    {
        id: 1,
        brand: 'BMW',
        model: '320i',
        category: 'Limousine',
        ourPrice: 150,
        marketAverage: 165,
        recommendation: 'increase',
        competitors: [
            { competitor: 'Sixt', dailyRate: 175, weeklyRate: 1050, monthlyRate: 3800, lastUpdated: '2026-01-20' },
            { competitor: 'Europcar', dailyRate: 160, weeklyRate: 960, monthlyRate: 3500, lastUpdated: '2026-01-20' },
            { competitor: 'Hertz', dailyRate: 170, weeklyRate: 1020, monthlyRate: 3700, lastUpdated: '2026-01-19' },
            { competitor: 'Avis', dailyRate: 155, weeklyRate: 930, monthlyRate: 3400, lastUpdated: '2026-01-20' },
        ]
    },
    {
        id: 2,
        brand: 'Mercedes',
        model: 'C200',
        category: 'Limousine',
        ourPrice: 180,
        marketAverage: 175,
        recommendation: 'maintain',
        competitors: [
            { competitor: 'Sixt', dailyRate: 185, weeklyRate: 1110, monthlyRate: 4000, lastUpdated: '2026-01-20' },
            { competitor: 'Europcar', dailyRate: 170, weeklyRate: 1020, monthlyRate: 3700, lastUpdated: '2026-01-20' },
            { competitor: 'Hertz', dailyRate: 180, weeklyRate: 1080, monthlyRate: 3900, lastUpdated: '2026-01-19' },
            { competitor: 'Avis', dailyRate: 165, weeklyRate: 990, monthlyRate: 3600, lastUpdated: '2026-01-20' },
        ]
    },
    {
        id: 3,
        brand: 'VW',
        model: 'Golf',
        category: 'Kleinwagen',
        ourPrice: 70,
        marketAverage: 65,
        recommendation: 'decrease',
        competitors: [
            { competitor: 'Sixt', dailyRate: 68, weeklyRate: 408, monthlyRate: 1500, lastUpdated: '2026-01-20' },
            { competitor: 'Europcar', dailyRate: 62, weeklyRate: 372, monthlyRate: 1400, lastUpdated: '2026-01-20' },
            { competitor: 'Hertz', dailyRate: 65, weeklyRate: 390, monthlyRate: 1450, lastUpdated: '2026-01-19' },
            { competitor: 'Avis', dailyRate: 64, weeklyRate: 384, monthlyRate: 1420, lastUpdated: '2026-01-20' },
        ]
    },
    {
        id: 4,
        brand: 'Audi',
        model: 'A4',
        category: 'Limousine',
        ourPrice: 160,
        marketAverage: 168,
        recommendation: 'increase',
        competitors: [
            { competitor: 'Sixt', dailyRate: 175, weeklyRate: 1050, monthlyRate: 3800, lastUpdated: '2026-01-20' },
            { competitor: 'Europcar', dailyRate: 165, weeklyRate: 990, monthlyRate: 3600, lastUpdated: '2026-01-20' },
            { competitor: 'Hertz', dailyRate: 170, weeklyRate: 1020, monthlyRate: 3700, lastUpdated: '2026-01-19' },
            { competitor: 'Avis', dailyRate: 162, weeklyRate: 972, monthlyRate: 3550, lastUpdated: '2026-01-20' },
        ]
    },
];

export default function PricingAnalysisPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredData = mockData.filter(car => {
        const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.model.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || car.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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
        const percentage = ((diff / marketAverage) * 100).toFixed(1);
        return { diff, percentage };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wettbewerbsanalyse</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Vergleichen Sie Ihre Preise mit der Konkurrenz
                    </p>
                </div>
                <button
                    onClick={() => alert('Preisaktualisierung wird in Kürze verfügbar sein')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Preise aktualisieren
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
                        {mockData.filter(c => c.ourPrice < c.marketAverage).length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fahrzeuge</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Über Markt</span>
                        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockData.filter(c => c.ourPrice > c.marketAverage).length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fahrzeuge</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Marktgerecht</span>
                        <Minus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {mockData.filter(c => Math.abs(c.ourPrice - c.marketAverage) <= 5).length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fahrzeuge</p>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="space-y-4">
                {filteredData.map((car) => {
                    const { diff, percentage } = getPriceDifference(car.ourPrice, car.marketAverage);

                    return (
                        <div key={car.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
                            {/* Car Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {car.brand} {car.model}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{car.category}</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Unser Preis</p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">€{car.ourPrice}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Marktdurchschnitt</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">€{car.marketAverage}</p>
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
                                <div className="mt-4 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {diff > 0 ? (
                                            <span className="text-red-600 dark:text-red-400 font-medium">
                                                €{Math.abs(diff)} ({percentage}%) teurer als Markt
                                            </span>
                                        ) : diff < 0 ? (
                                            <span className="text-green-600 dark:text-green-400 font-medium">
                                                €{Math.abs(diff)} ({Math.abs(Number(percentage))}%) günstiger als Markt
                                            </span>
                                        ) : (
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                Genau im Marktdurchschnitt
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Competitors Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Anbieter</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tagespreis</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Wochenpreis</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Monatspreis</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aktualisiert</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {car.competitors.map((comp, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{comp.competitor}</td>
                                                <td className="px-6 py-4 text-sm text-right">
                                                    <span className={clsx(
                                                        'font-semibold',
                                                        comp.dailyRate < car.ourPrice ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                                    )}>
                                                        €{comp.dailyRate}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 text-right">€{comp.weeklyRate}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 text-right">€{comp.monthlyRate}</td>
                                                <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400 text-right">{comp.lastUpdated}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
