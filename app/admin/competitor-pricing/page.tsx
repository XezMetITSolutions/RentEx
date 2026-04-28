'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';

interface Competitor {
    id: number;
    name: string;
    website?: string;
    isActive: boolean;
}

interface CompetitorPrice {
    id: number;
    competitorId: number;
    brand: string;
    model: string;
    dailyRate: number;
    weeklyRate?: number;
    monthlyRate?: number;
    notes?: string;
    recordedAt: string;
}

interface OurCar {
    id: number;
    brand: string;
    model: string;
    dailyRate: number;
    weeklyRate?: number;
    monthlyRate?: number;
}

export default function CompetitorPricingPage() {
    const [tab, setTab] = useState<'companies' | 'prices' | 'comparison'>('companies');
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [prices, setPrices] = useState<CompetitorPrice[]>([]);
    const [ourCars, setOurCars] = useState<OurCar[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [compRes, pricesRes, carsRes] = await Promise.all([
                fetch('/api/admin/competitor-pricing/companies'),
                fetch('/api/admin/competitor-pricing/prices'),
                fetch('/api/cars'),
            ]);

            if (compRes.ok) setCompetitors(await compRes.json());
            if (pricesRes.ok) setPrices(await pricesRes.json());
            if (carsRes.ok) setOurCars(await carsRes.json());
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Fehler beim Laden der Daten');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-6">Laden...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Konkurrenzbewertung</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Überwachen und vergleichen Sie die Preise von Wettbewerbern</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setTab('companies')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        tab === 'companies'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                >
                    Unternehmen ({competitors.length})
                </button>
                <button
                    onClick={() => setTab('prices')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        tab === 'prices'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                >
                    Preise ({prices.length})
                </button>
                <button
                    onClick={() => setTab('comparison')}
                    className={`px-4 py-2 font-medium transition-colors ${
                        tab === 'comparison'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                >
                    Vergleich
                </button>
            </div>

            {/* Companies Tab */}
            {tab === 'companies' && <CompaniesSection competitors={competitors} onRefresh={loadData} />}

            {/* Prices Tab */}
            {tab === 'prices' && <PricesSection prices={prices} competitors={competitors} onRefresh={loadData} />}

            {/* Comparison Tab */}
            {tab === 'comparison' && <ComparisonSection prices={prices} competitors={competitors} ourCars={ourCars} />}
        </div>
    );
}

function CompaniesSection({ competitors, onRefresh }: { competitors: Competitor[]; onRefresh: () => void }) {
    const [newCompany, setNewCompany] = useState({ name: '', website: '' });
    const [saving, setSaving] = useState(false);

    const handleAddCompany = async () => {
        if (!newCompany.name) {
            alert('Firmennamen erforderlich');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/admin/competitor-pricing/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCompany),
            });

            if (res.ok) {
                setNewCompany({ name: '', website: '' });
                onRefresh();
                alert('Unternehmen hinzugefügt!');
            } else {
                alert('Fehler beim Hinzufügen');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Möchten Sie dieses Unternehmen löschen?')) return;

        try {
            const res = await fetch(`/api/admin/competitor-pricing/companies/${id}`, { method: 'DELETE' });
            if (res.ok) {
                onRefresh();
                alert('Gelöscht!');
            }
        } catch (error) {
            alert('Fehler beim Löschen');
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Firmenname</label>
                    <input
                        type="text"
                        value={newCompany.name}
                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                        placeholder="z.B. Enterprise, Hertz, Avis"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                    <input
                        type="text"
                        value={newCompany.website}
                        onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                        placeholder="https://..."
                    />
                </div>
                <button
                    onClick={handleAddCompany}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Unternehmen hinzufügen
                </button>
            </div>

            <div className="grid gap-4">
                {competitors.map((comp) => (
                    <div key={comp.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{comp.name}</h3>
                            {comp.website && <p className="text-sm text-gray-500">{comp.website}</p>}
                        </div>
                        <button
                            onClick={() => handleDelete(comp.id)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PricesSection({ prices, competitors, onRefresh }: { prices: CompetitorPrice[]; competitors: Competitor[]; onRefresh: () => void }) {
    const [selectedCompetitor, setSelectedCompetitor] = useState<number>(competitors[0]?.id || 0);
    const [formData, setFormData] = useState({ brand: '', model: '', dailyRate: '' });
    const [saving, setSaving] = useState(false);

    const handleAddPrice = async () => {
        if (!formData.brand || !formData.model || !formData.dailyRate) {
            alert('Alle Felder erforderlich');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/admin/competitor-pricing/prices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    competitorId: selectedCompetitor,
                    ...formData,
                    dailyRate: parseFloat(formData.dailyRate),
                }),
            });

            if (res.ok) {
                setFormData({ brand: '', model: '', dailyRate: '' });
                onRefresh();
                alert('Preis hinzugefügt!');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unternehmen</label>
                    <select
                        value={selectedCompetitor}
                        onChange={(e) => setSelectedCompetitor(Number(e.target.value))}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                    >
                        {competitors.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Marke</label>
                        <input
                            type="text"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                            placeholder="BMW"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Modell</label>
                        <input
                            type="text"
                            value={formData.model}
                            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                            placeholder="320i"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tagessatz (€)</label>
                    <input
                        type="number"
                        value={formData.dailyRate}
                        onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white"
                        placeholder="150.00"
                        step="0.01"
                    />
                </div>
                <button
                    onClick={handleAddPrice}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg"
                >
                    Preis hinzufügen
                </button>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium">Unternehmen</th>
                            <th className="px-4 py-2 text-left font-medium">Fahrzeug</th>
                            <th className="px-4 py-2 text-right font-medium">Tagessatz</th>
                            <th className="px-4 py-2 text-left font-medium">Datum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prices.map((price) => (
                            <tr key={price.id} className="border-t border-gray-200 dark:border-gray-700">
                                <td className="px-4 py-2">{competitors.find((c) => c.id === price.competitorId)?.name}</td>
                                <td className="px-4 py-2">{price.brand} {price.model}</td>
                                <td className="px-4 py-2 text-right font-semibold">€{Number(price.dailyRate).toFixed(2)}</td>
                                <td className="px-4 py-2 text-gray-500">{new Date(price.recordedAt).toLocaleDateString('de-AT')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ComparisonSection({ prices, competitors, ourCars }: { prices: CompetitorPrice[]; competitors: Competitor[]; ourCars: OurCar[] }) {
    return (
        <div className="grid gap-6">
            {ourCars.map((car) => {
                const competitorPrices = prices.filter(
                    (p) => p.brand.toLowerCase() === car.brand.toLowerCase() && p.model.toLowerCase() === car.model.toLowerCase()
                );

                const avgCompetitorPrice =
                    competitorPrices.length > 0
                        ? competitorPrices.reduce((sum, p) => sum + Number(p.dailyRate), 0) / competitorPrices.length
                        : null;

                const priceDiff = avgCompetitorPrice ? Number(car.dailyRate) - avgCompetitorPrice : 0;
                const priceDiffPercent = avgCompetitorPrice ? (priceDiff / avgCompetitorPrice) * 100 : 0;

                return (
                    <div key={car.id} className="bg-white dark:bg-gray-800 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {car.brand} {car.model}
                                </h3>
                                <p className="text-sm text-gray-500">Unser Preis: €{Number(car.dailyRate).toFixed(2)}</p>
                            </div>
                            {avgCompetitorPrice && (
                                <div className={`flex items-center gap-1 ${priceDiff <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {priceDiff <= 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                                    <span className="font-semibold">{priceDiffPercent > 0 ? '+' : ''}{priceDiffPercent.toFixed(1)}%</span>
                                </div>
                            )}
                        </div>

                        {competitorPrices.length > 0 ? (
                            <div className="space-y-2">
                                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Durchschnittlicher Wettbewerberpreis: <span className="font-semibold text-gray-900 dark:text-white">€{avgCompetitorPrice?.toFixed(2)}</span>
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    {competitorPrices.map((price) => (
                                        <div key={price.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{competitors.find((c) => c.id === price.competitorId)?.name}</span>
                                            <span className="font-medium">€{Number(price.dailyRate).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">Keine Wettbewerberdaten für dieses Modell</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
