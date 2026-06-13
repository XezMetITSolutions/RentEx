'use client';

import { useState, useTransition } from 'react';
import { 
    TrendingUp, TrendingDown, Minus, Search, RefreshCw, 
    AlertCircle, Plus, Trash2, Building2, Tag, 
    Euro
} from 'lucide-react';
import { clsx } from 'clsx';
import { updateCompetitorPrices } from '@/app/actions';
import { toast } from 'sonner';

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

interface CompetitorCompany {
    id: number;
    name: string;
    website?: string | null;
    notes?: string | null;
    isActive: boolean;
}

interface PricingViewProps {
    data: CarComparison[];
    initialCompetitors: CompetitorCompany[];
    initialPrices: any[];
}

export default function PricingView({ data, initialCompetitors, initialPrices }: PricingViewProps) {
    const [activeTab, setActiveTab] = useState<'analysis' | 'companies' | 'prices'>('analysis');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isUpdating, startTransition] = useTransition();

    // Companies & Prices tab states
    const [competitors, setCompetitors] = useState<CompetitorCompany[]>(initialCompetitors);
    const [prices, setPrices] = useState<any[]>(initialPrices);
    const [newCompany, setNewCompany] = useState({ name: '', website: '', notes: '' });
    const [newPrice, setNewPrice] = useState({ competitorId: '', brand: '', model: '', dailyRate: '', weeklyRate: '', monthlyRate: '', notes: '' });
    const [saving, setSaving] = useState(false);

    // Filter analysis view
    const filteredData = data.filter(car => {
        const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.model.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || car.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleUpdatePrices = () => {
        startTransition(async () => {
            try {
                await updateCompetitorPrices();
                toast.success('Marktdaten erfolgreich aktualisiert!');
            } catch (err) {
                toast.error('Fehler beim Aktualisieren der Marktdaten');
            }
        });
    };

    // Competitor Company actions
    const handleAddCompany = async () => {
        if (!newCompany.name.trim()) {
            toast.error('Bitte geben Sie einen Firmennamen ein.');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/admin/competitor-pricing/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCompany),
            });
            const responseData = await res.json();
            if (res.ok) {
                setCompetitors(prev => [...prev, responseData].sort((a, b) => a.name.localeCompare(b.name)));
                setNewCompany({ name: '', website: '', notes: '' });
                toast.success('Mitbewerber erfolgreich hinzugefügt!');
            } else {
                toast.error(responseData.error || 'Fehler beim Speichern');
            }
        } catch (e) {
            toast.error('Netzwerkfehler beim Speichern des Mitbewerbers');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCompany = async (id: number) => {
        if (!confirm('Möchten Sie diesen Mitbewerber wirklich löschen? Alle zugehörigen Preisdaten gehen verloren.')) return;
        try {
            const res = await fetch(`/api/admin/competitor-pricing/companies/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCompetitors(prev => prev.filter(c => c.id !== id));
                setPrices(prev => prev.filter(p => p.competitorId !== id));
                toast.success('Mitbewerber gelöscht');
            } else {
                toast.error('Fehler beim Löschen des Mitbewerbers');
            }
        } catch (e) {
            toast.error('Netzwerkfehler');
        }
    };

    // Competitor Price actions
    const handleAddPrice = async () => {
        if (!newPrice.competitorId || !newPrice.brand || !newPrice.model || !newPrice.dailyRate) {
            toast.error('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                competitorId: parseInt(newPrice.competitorId),
                brand: newPrice.brand,
                model: newPrice.model,
                dailyRate: parseFloat(newPrice.dailyRate),
                weeklyRate: newPrice.weeklyRate ? parseFloat(newPrice.weeklyRate) : undefined,
                monthlyRate: newPrice.monthlyRate ? parseFloat(newPrice.monthlyRate) : undefined,
                notes: newPrice.notes || undefined,
            };

            const res = await fetch('/api/admin/competitor-pricing/prices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const responseData = await res.json();
            if (res.ok) {
                // Find competitor name to attach it locally
                const compObj = competitors.find(c => c.id === payload.competitorId);
                const completePriceObj = {
                    ...responseData,
                    competitor: compObj ? { name: compObj.name } : null
                };
                setPrices(prev => [completePriceObj, ...prev]);
                setNewPrice(p => ({ ...p, brand: '', model: '', dailyRate: '', weeklyRate: '', monthlyRate: '', notes: '' }));
                toast.success('Preis erfolgreich erfasst!');
            } else {
                toast.error(responseData.error || 'Fehler beim Erfassen des Preises');
            }
        } catch (e) {
            toast.error('Netzwerkfehler');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Preisgestaltung & Wettbewerb</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Preisanalyse, Mitbewerberverwaltung und manuelle Preiserfassung.
                    </p>
                </div>
                {activeTab === 'analysis' && (
                    <button
                        onClick={handleUpdatePrices}
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
                    >
                        <RefreshCw className={clsx('h-4 w-4', isUpdating && 'animate-spin')} />
                        {isUpdating ? 'Aktualisierung läuft...' : 'Marktdaten synchronisieren'}
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('analysis')}
                    className={clsx(
                        'px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-px',
                        activeTab === 'analysis'
                            ? 'border-red-650 text-red-650 font-bold border-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                    )}
                >
                    Analyse & Empfehlungen
                </button>
                <button
                    onClick={() => setActiveTab('companies')}
                    className={clsx(
                        'px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-px',
                        activeTab === 'companies'
                            ? 'border-red-650 text-red-650 font-bold border-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                    )}
                >
                    Mitbewerber verwalten ({competitors.length})
                </button>
                <button
                    onClick={() => setActiveTab('prices')}
                    className={clsx(
                        'px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-px',
                        activeTab === 'prices'
                            ? 'border-red-650 text-red-650 font-bold border-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                    )}
                >
                    Preise erfassen
                </button>
            </div>

            {/* TAB CONTENT: ANALYSIS */}
            {activeTab === 'analysis' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Fahrzeug suchen..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                />
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                            >
                                <option value="all">Alle Kategorien</option>
                                <option value="Kleinwagen">Kleinwagen</option>
                                <option value="Kombi">Kombi</option>
                                <option value="Limousine">Limousine</option>
                                <option value="SUV">SUV</option>
                                <option value="Van">Van</option>
                                <option value="Transporter">Transporter</option>
                            </select>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Günstiger als Markt</span>
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {data.filter(c => c.ourPrice < c.marketAverage && c.marketAverage > 0).length}
                                </p>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teurer als Markt</span>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                                    {data.filter(c => c.ourPrice > c.marketAverage).length}
                                </p>
                            </div>
                            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-600 dark:text-red-400">
                                <TrendingDown className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marktgerechter Preis</span>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                    {data.filter(c => Math.abs(c.ourPrice - c.marketAverage) <= 5 || c.marketAverage === 0).length}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-blue-600 dark:text-blue-400">
                                <Minus className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Comparison Grid */}
                    {filteredData.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Keine Daten verfügbar</h3>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredData.map((car) => {
                                const diff = car.ourPrice - car.marketAverage;
                                const percentage = car.marketAverage > 0 ? ((diff / car.marketAverage) * 100).toFixed(1) : '0.0';

                                return (
                                    <div key={car.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-all">
                                        <div className="p-6 border-b border-gray-100 dark:border-gray-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{car.brand} {car.model}</h3>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-850 text-gray-600 dark:text-gray-400 rounded">{car.category}</span>
                                            </div>
                                            <div className="flex gap-6 items-center">
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Unser Preis</p>
                                                    <p className="text-xl font-bold text-gray-900 dark:text-white">€{car.ourPrice.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Marktschnitt</p>
                                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                        {car.marketAverage > 0 ? `€${car.marketAverage.toFixed(2)}` : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className={clsx(
                                                    'px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5',
                                                    car.recommendation === 'increase' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                                    car.recommendation === 'decrease' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                                    'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                                )}>
                                                    {car.recommendation === 'increase' ? <TrendingUp className="w-4 h-4" /> :
                                                     car.recommendation === 'decrease' ? <TrendingDown className="w-4 h-4" /> :
                                                     <Minus className="w-4 h-4" />}
                                                    {car.recommendation === 'increase' ? 'Preisanpassung ↑' :
                                                     car.recommendation === 'decrease' ? 'Preisanpassung ↓' :
                                                     'Preis beibehalten'}
                                                </div>
                                            </div>
                                        </div>

                                        {car.marketAverage > 0 && (
                                            <div className="px-6 py-3 bg-gray-50/50 dark:bg-gray-950/20 border-b border-gray-100 dark:border-gray-850 text-xs flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {diff > 0 ? (
                                                        <span className="text-red-650 font-semibold text-red-600">€{Math.abs(diff).toFixed(2)} ({percentage}%) über Marktdurchschnitt</span>
                                                    ) : diff < 0 ? (
                                                        <span className="text-green-650 font-semibold text-green-600">€{Math.abs(diff).toFixed(2)} ({Math.abs(Number(percentage))}%) unter Marktdurchschnitt</span>
                                                    ) : (
                                                        <span className="text-blue-650 font-semibold text-blue-600">Genau auf Marktniveau</span>
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        {/* Competitors breakdown */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs text-left">
                                                <thead className="bg-gray-50/30 dark:bg-gray-900/10 text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                                    <tr>
                                                        <th className="px-6 py-2.5">Mitbewerber</th>
                                                        <th className="px-6 py-2.5 text-right">Tagespreis</th>
                                                        <th className="px-6 py-2.5 text-right">Wochenpreis (Est.)</th>
                                                        <th className="px-6 py-2.5 text-right">Monatspreis (Est.)</th>
                                                        <th className="px-6 py-2.5 text-right">Zuletzt aktualisiert</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                    {car.competitors.length > 0 ? (
                                                        car.competitors.map((comp, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/10">
                                                                <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{comp.competitor}</td>
                                                                <td className="px-6 py-3 text-right font-bold text-gray-900 dark:text-white">€{comp.dailyRate.toFixed(2)}</td>
                                                                <td className="px-6 py-3 text-right text-gray-500">€{(comp.dailyRate * 7 * 0.85).toFixed(0)}</td>
                                                                <td className="px-6 py-3 text-right text-gray-500">€{(comp.dailyRate * 30 * 0.70).toFixed(0)}</td>
                                                                <td className="px-6 py-3 text-right text-gray-400">{new Date(comp.lastUpdated).toLocaleDateString('de-AT')}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-450 italic">Keine expliziten Mitbewerber-Preise für diese Fahrzeugklasse erfasst.</td>
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
            )}

            {/* TAB CONTENT: MITBEWERBER */}
            {activeTab === 'companies' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-gray-400" />
                                Neuen Mitbewerber erfassen
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Firmenname *</label>
                                    <input 
                                        type="text" 
                                        value={newCompany.name}
                                        onChange={e => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="z.B. Avis, Enterprise" 
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Website URL</label>
                                    <input 
                                        type="text" 
                                        value={newCompany.website}
                                        onChange={e => setNewCompany(prev => ({ ...prev, website: e.target.value }))}
                                        placeholder="https://..." 
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Notizen</label>
                                    <textarea 
                                        value={newCompany.notes}
                                        onChange={e => setNewCompany(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Optionale Bemerkung..." 
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500 h-20 resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleAddCompany}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-650 hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                    Mitbewerber speichern
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase tracking-wider text-xs border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-3">Firmenname</th>
                                        <th className="px-6 py-3">Website</th>
                                        <th className="px-6 py-3">Notizen</th>
                                        <th className="px-6 py-3 text-right">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {competitors.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">Keine Mitbewerber erfasst. Legen Sie links einen neuen an.</td>
                                        </tr>
                                    ) : (
                                        competitors.map((comp) => (
                                            <tr key={comp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{comp.name}</td>
                                                <td className="px-6 py-4">
                                                    {comp.website ? (
                                                        <a href={comp.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{comp.website}</a>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{comp.notes || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteCompany(comp.id)}
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-650 hover:text-red-700"
                                                        title="Löschen"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: PRICES */}
            {activeTab === 'prices' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Tag className="w-5 h-5 text-gray-400" />
                                Preis manuell erfassen
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Mitbewerber *</label>
                                    <select 
                                        value={newPrice.competitorId}
                                        onChange={e => setNewPrice(prev => ({ ...prev, competitorId: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                    >
                                        <option value="">Firma wählen...</option>
                                        {competitors.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Marke *</label>
                                        <input 
                                            type="text" 
                                            value={newPrice.brand}
                                            onChange={e => setNewPrice(prev => ({ ...prev, brand: e.target.value }))}
                                            placeholder="z.B. BMW" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Modell *</label>
                                        <input 
                                            type="text" 
                                            value={newPrice.model}
                                            onChange={e => setNewPrice(prev => ({ ...prev, model: e.target.value }))}
                                            placeholder="z.B. 3er" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Tagesrate (€) *</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={newPrice.dailyRate}
                                        onChange={e => setNewPrice(prev => ({ ...prev, dailyRate: e.target.value }))}
                                        placeholder="0.00" 
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Wochenrate (€)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={newPrice.weeklyRate}
                                            onChange={e => setNewPrice(prev => ({ ...prev, weeklyRate: e.target.value }))}
                                            placeholder="optional" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Monatsrate (€)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={newPrice.monthlyRate}
                                            onChange={e => setNewPrice(prev => ({ ...prev, monthlyRate: e.target.value }))}
                                            placeholder="optional" 
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddPrice}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-650 hover:bg-red-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                    Preis erfassen
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase tracking-wider text-xs border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-3">Mitbewerber</th>
                                        <th className="px-6 py-3">Fahrzeug</th>
                                        <th className="px-6 py-3 text-right">Tagespreis</th>
                                        <th className="px-6 py-3 text-right">Erfasst am</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {prices.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">Keine Preisdaten vorhanden.</td>
                                        </tr>
                                    ) : (
                                        prices.slice(0, 100).map((pr) => (
                                            <tr key={pr.id} className="hover:bg-gray-50/40">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{pr.competitor?.name || 'Unbekannt'}</td>
                                                <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{pr.brand} {pr.model}</td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">€{Number(pr.dailyRate).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right text-gray-400 text-xs">{new Date(pr.recordedAt).toLocaleString('de-AT')}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
