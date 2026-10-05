'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2, SlidersHorizontal, X, Phone } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';

interface FilterOption {
    value: string;
    count: number;
}

interface FleetSidebarProps {
    categories: FilterOption[];
    transmissions: FilterOption[];
    fuelTypes: FilterOption[];
    activeFilters: {
        type?: string;
        category?: string;
        brand?: string;
        transmission?: string;
        fuelType?: string;
    };
}

function OptionList({
    label,
    options,
    active,
    onSelect,
}: {
    label: string;
    options: FilterOption[];
    active?: string;
    onSelect: (value: string | null) => void;
}) {
    if (options.length === 0) return null;
    const all = options.reduce((sum, o) => sum + o.count, 0);
    const rows = [{ value: '', label: 'Alle', count: all }, ...options.map((o) => ({ ...o, label: o.value }))];

    return (
        <fieldset>
            <legend className="font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted">{label}</legend>
            <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {rows.map((row) => {
                    const selected = (active || '') === row.value;
                    return (
                        <button
                            key={row.value || 'all'}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onSelect(row.value || null)}
                            className={`flex min-h-10 items-center justify-between gap-3 whitespace-nowrap rounded-[var(--hm-radius-pill)] lg:rounded-[var(--hm-radius-input)] border px-4 lg:px-3 text-sm transition-[background-color,color,border-color] duration-[var(--hm-dur-short)] ease-hm-out ${
                                selected
                                    ? 'border-hm-ink bg-hm-ink text-hm-paper font-semibold'
                                    : 'border-hm-rule lg:border-transparent text-hm-ink-2 hover:border-hm-rule hover:text-hm-ink lg:hover:bg-hm-paper-2'
                            }`}
                        >
                            {row.label}
                            <span className={`hm-tnum font-hm-mono text-[11px] ${selected ? 'opacity-70' : 'text-hm-muted'}`}>{row.count}</span>
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}

export default function FleetSidebar({ categories, transmissions, fuelTypes, activeFilters }: FleetSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(activeFilters.brand || '');
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateFilters = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        const query = params.toString();
        startTransition(() => {
            router.push(query ? `/fleet?${query}` : '/fleet', { scroll: false });
        });
    };

    useEffect(() => () => {
        if (debounce.current) clearTimeout(debounce.current);
    }, []);

    const onSearch = (value: string) => {
        setSearchTerm(value);
        if (debounce.current) clearTimeout(debounce.current);
        debounce.current = setTimeout(() => updateFilters('brand', value.trim() || null), 300);
    };

    const activeCount = [activeFilters.category, activeFilters.brand, activeFilters.transmission, activeFilters.fuelType]
        .filter(Boolean).length + (activeFilters.type && activeFilters.type !== 'all' ? 1 : 0);

    const clearFilters = () => {
        // Keep the chosen rental period; drop everything else.
        const params = new URLSearchParams();
        const pickup = searchParams.get('pickup');
        const ret = searchParams.get('return');
        if (pickup) params.set('pickup', pickup);
        if (ret) params.set('return', ret);
        setSearchTerm('');
        const query = params.toString();
        startTransition(() => router.push(query ? `/fleet?${query}` : '/fleet', { scroll: false }));
    };

    return (
        <aside className="min-w-0">
            <button
                type="button"
                aria-expanded={open}
                aria-controls="fleet-filters"
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-[var(--hm-radius-pill)] border border-hm-rule px-5 text-sm font-semibold text-hm-ink"
            >
                <SlidersHorizontal aria-hidden className="w-4 h-4" />
                Filter{activeCount > 0 && <span className="hm-tnum rounded-full bg-hm-accent px-1.5 text-[11px] text-hm-accent-ink">{activeCount}</span>}
            </button>

            <div id="fleet-filters" className={`${open ? 'block' : 'hidden'} lg:block mt-4 lg:mt-0 lg:sticky lg:top-28 space-y-7`}>
                <div>
                    <label htmlFor="fleet-brand" className="flex items-center justify-between font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted">
                        Marke
                        {isPending && <Loader2 aria-label="Lädt" className="w-3.5 h-3.5 animate-spin text-hm-accent-text" />}
                    </label>
                    <div className="relative mt-3">
                        <Search aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted" />
                        <input
                            id="fleet-brand"
                            type="search"
                            placeholder="z. B. Skoda"
                            value={searchTerm}
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full min-h-11 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper pl-10 pr-3 text-sm text-hm-ink outline-none placeholder:text-hm-muted hover:border-hm-muted focus:border-hm-ink transition-[border-color] duration-[var(--hm-dur-short)] ease-hm-out"
                        />
                    </div>
                </div>

                <OptionList label="Klasse" options={categories} active={activeFilters.category} onSelect={(v) => updateFilters('category', v)} />
                <OptionList label="Getriebe" options={transmissions} active={activeFilters.transmission} onSelect={(v) => updateFilters('transmission', v)} />
                <OptionList label="Antrieb" options={fuelTypes} active={activeFilters.fuelType} onSelect={(v) => updateFilters('fuelType', v)} />

                {activeCount > 0 && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap text-sm font-semibold text-hm-accent-text hover:text-hm-ink transition-[color] duration-[var(--hm-dur-short)]"
                    >
                        <X aria-hidden className="w-4 h-4" />
                        Filter zurücksetzen
                    </button>
                )}

                <div className="rounded-[var(--hm-radius-card)] bg-hm-paper-2 p-5">
                    <p className="font-semibold text-hm-ink">Nicht das Richtige dabei?</p>
                    <p className="mt-1 text-sm text-hm-ink-2">Rufen Sie uns an — wir finden eine Lösung.</p>
                    <a
                        href="tel:+436609996800"
                        className="hm-tnum mt-4 inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-[var(--hm-radius-pill)] bg-hm-ink px-4 text-sm font-semibold text-hm-paper hover:bg-hm-accent hover:text-hm-accent-ink transition-[background-color,color] duration-[var(--hm-dur-short)] ease-hm-out"
                    >
                        <Phone aria-hidden className="w-4 h-4" />
                        +43 660 9996800
                    </a>
                </div>
            </div>
        </aside>
    );
}
