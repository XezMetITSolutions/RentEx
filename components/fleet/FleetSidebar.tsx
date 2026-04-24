'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, ChevronRight, Car, Truck, Fuel, Gauge, Users, Search, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';

interface FleetSidebarProps {
    categories: { category: string | null }[];
    brands: { brand: string | null }[];
    activeFilters: {
        type?: string;
        category?: string;
        brand?: string;
        transmission?: string;
        fuelType?: string;
    };
}

export default function FleetSidebar({ categories, brands, activeFilters }: FleetSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(activeFilters.brand || '');
    const [isPending, startTransition] = useTransition();

    const updateFilters = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        
        startTransition(() => {
            router.push(`/fleet?${params.toString()}`, { scroll: false });
        });
    };

    const clearFilters = () => {
        router.push('/fleet');
        setSearchTerm('');
    };

    return (
        <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
                {/* Search */}
                <div className="relative group">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Suche</span>
                        {isPending && <Loader2 className="w-3 h-3 text-red-500 animate-spin" />}
                    </div>
                    <Search className="absolute left-4 top-[42px] -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Marke suchen..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            updateFilters('brand', e.target.value);
                        }}
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none text-sm"
                    />
                </div>

                {/* Filter Groups */}
                <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-3xl p-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Filter className="w-24 h-24 rotate-12" />
                    </div>

                    <div className="relative space-y-8">
                        {/* Vehicle Type */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                <Car className="w-3 h-3" />
                                Fahrzeugtyp
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { id: 'all', label: 'Alle', icon: Filter },
                                    { id: 'pkw', label: 'PKW', icon: Car },
                                    { id: 'kastenwagen', label: 'LKW / Van', icon: Truck },
                                ].map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => updateFilters('type', type.id === 'all' ? null : type.id)}
                                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            (activeFilters.type || 'all') === type.id
                                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                                : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <type.icon className="w-4 h-4" />
                                            {type.label}
                                        </div>
                                        {(activeFilters.type || 'all') === type.id && <ChevronRight className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Kategorien</h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.filter(c => c.category).map((cat) => (
                                    <button
                                        key={cat.category}
                                        onClick={() => updateFilters('category', activeFilters.category === cat.category ? null : cat.category!)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                            activeFilters.category === cat.category
                                                ? 'bg-red-500 border-red-500 text-white'
                                                : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-white/5 text-gray-500 hover:border-red-500/50'
                                        }`}
                                    >
                                        {cat.category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Technical */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                                    <Gauge className="w-3 h-3" />
                                    Getriebe
                                </h3>
                                <div className="flex gap-2">
                                    {['Automatik', 'Manuell'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => updateFilters('transmission', activeFilters.transmission === t ? null : t)}
                                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                                activeFilters.transmission === t
                                                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                                                    : 'border-gray-200 dark:border-white/10 text-gray-500'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                                    <Fuel className="w-3 h-3" />
                                    Kraftstoff
                                </h3>
                                <select 
                                    value={activeFilters.fuelType || ''}
                                    onChange={(e) => updateFilters('fuelType', e.target.value || null)}
                                    className="w-full px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:border-red-500 transition-colors"
                                >
                                    <option value="">Alle Kraftstoffe</option>
                                    <option value="Benzin">Benzin</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Elektro">Elektro</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(activeFilters.type || activeFilters.category || activeFilters.brand || activeFilters.transmission || activeFilters.fuelType) && (
                            <button
                                onClick={clearFilters}
                                className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-red-500/20"
                            >
                                <X className="w-3 h-3" />
                                Filter zurücksetzen
                            </button>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="p-6 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-red-500/20">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Car className="w-32 h-32 rotate-12" />
                    </div>
                    <h4 className="font-bold mb-2">Hilfe benötigt?</h4>
                    <p className="text-xs text-red-100 mb-4 opacity-80 leading-relaxed">
                        Sie finden nicht das passende Fahrzeug? Kontaktieren Sie uns direkt.
                    </p>
                    <a href="tel:+43" className="inline-flex items-center gap-2 text-xs font-bold bg-white text-red-600 px-4 py-2 rounded-xl">
                        Jetzt anrufen
                    </a>
                </div>
            </div>
        </aside>
    );
}
