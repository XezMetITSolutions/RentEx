"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

interface CarType {
  id: number;
  brand: string;
  model: string;
  imageUrl: string | null;
  dailyRate: number;
  fuelType: string;
  transmission: string | null;
  seats: number | null;
  category: string | null;
  hasAirConditioning?: boolean;
}

interface CategoryType {
  id: number;
  name: string;
  sortOrder: number;
}

interface InteractiveFleetProps {
  initialCars: CarType[];
  categories: CategoryType[];
}

type SortKey = "price-asc" | "price-desc";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const formatEuro = (value: number) =>
  value.toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InteractiveFleet({ initialCars, categories }: InteractiveFleetProps) {
  const [activeTab, setActiveTab] = useState<string>("Alle");
  const [sortBy, setSortBy] = useState<SortKey>("price-asc");

  const countFor = (name: string) =>
    initialCars.filter((car) => car.category?.toLowerCase() === name.toLowerCase()).length;

  const filtered = activeTab === "Alle"
    ? initialCars
    : initialCars.filter((car) => car.category?.toLowerCase() === activeTab.toLowerCase());

  const displayedCars = [...filtered].sort((a, b) =>
    sortBy === "price-asc" ? a.dailyRate - b.dailyRate : b.dailyRate - a.dailyRate
  );

  const tabs = [{ name: "Alle", count: initialCars.length }, ...categories.map((cat) => ({ name: cat.name, count: countFor(cat.name) }))];

  return (
    <>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 id="hm-fleet-heading" className="hm-display text-[length:var(--hm-text-display-s)] font-[700] leading-[0.95]">
          Die Flotte, heute.
        </h2>

        <div className="flex items-center gap-3">
          <label htmlFor="hm-sort" className="font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted whitespace-nowrap">
            Sortieren
          </label>
          <div className="relative">
            <select
              id="hm-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="min-h-10 bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-input)] py-2 pl-3 pr-9 text-sm text-hm-ink outline-none appearance-none cursor-pointer hover:border-hm-muted focus:border-hm-ink transition-[border-color] duration-[var(--hm-dur-short)] ease-hm-out"
            >
              <option value="price-asc">Preis aufsteigend</option>
              <option value="price-desc">Preis absteigend</option>
            </select>
            <ChevronDown aria-hidden className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category filter — text tabs with counts */}
      <div role="tablist" aria-label="Fahrzeugklasse" className="mt-8 flex gap-x-6 gap-y-2 overflow-x-auto hide-scrollbar border-b border-hm-rule">
        {tabs.map((tab) => {
          const active = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setActiveTab(tab.name)}
              className={`relative -mb-px shrink-0 whitespace-nowrap py-3 text-sm border-b-2 transition-[color,border-color] duration-[var(--hm-dur-short)] ease-hm-out ${
                active
                  ? "border-hm-accent text-hm-ink font-semibold"
                  : "border-transparent text-hm-muted hover:text-hm-ink hover:border-hm-rule"
              }`}
            >
              {tab.name}
              <span className="hm-tnum ml-1.5 font-hm-mono text-[11px] text-hm-muted">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {displayedCars.length > 0 ? (
        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))] 2xl:grid-cols-[repeat(4,minmax(0,1fr))] border-t border-l border-hm-rule">
          {displayedCars.map((car) => {
            const href = `/fleet/${car.id}/${slugify(`${car.brand}-${car.model}`)}`;
            const specs = [
              car.transmission || "Automatik",
              car.fuelType || "Diesel",
              `${car.seats || 5} Sitze`,
              car.hasAirConditioning ? "Klima" : null,
            ].filter(Boolean);

            return (
              <li key={car.id} className="bg-hm-paper border-r border-b border-hm-rule">
                <Link
                  href={href}
                  title={`${car.brand} ${car.model} buchen`}
                  className="group flex h-full flex-col p-5 outline-offset-[-2px] hover:bg-hm-paper-2 transition-[background-color] duration-[var(--hm-dur-short)] ease-hm-out"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted truncate">
                      {car.category || "Fahrzeug"}
                    </span>
                  </div>

                  <div className="relative mt-3 aspect-[16/10] w-full overflow-hidden rounded-[var(--hm-radius-input)] bg-hm-plate">
                    <Image
                      src={car.imageUrl || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800"}
                      alt={`${car.brand} ${car.model}`}
                      fill
                      sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-contain mix-blend-multiply transition-transform duration-[var(--hm-dur-med)] ease-hm-out group-hover:-translate-y-1"
                    />
                  </div>

                  <h3 className="mt-4 text-base font-bold leading-snug text-hm-ink">
                    {car.brand} {car.model}
                  </h3>
                  <p className="mt-1 text-xs text-hm-muted">{specs.join(" · ")}</p>

                  <div className="mt-auto pt-5 flex items-end justify-between gap-3 border-t border-transparent">
                    <p className="hm-tnum">
                      <span className="text-xs text-hm-muted">ab </span>
                      <span className="text-xl font-bold text-hm-ink">€ {formatEuro(car.dailyRate)}</span>
                      <span className="text-xs text-hm-muted"> / Tag</span>
                    </p>
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-hm-accent-text">
                      Buchen
                      <ArrowRight aria-hidden className="w-4 h-4 transition-transform duration-[var(--hm-dur-short)] ease-hm-out group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-10 py-16 text-center text-sm text-hm-muted border border-hm-rule rounded-[var(--hm-radius-card)]">
          In dieser Klasse ist gerade kein Fahrzeug frei.
        </p>
      )}

      <div className="mt-8 flex justify-end">
        <Link
          href="/fleet"
          title="Gesamte Fahrzeugflotte anzeigen"
          className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-hm-ink border-b border-hm-rule-strong pb-1 hover:text-hm-accent-text hover:border-hm-accent transition-[color,border-color] duration-[var(--hm-dur-short)] ease-hm-out"
        >
          Ganze Flotte mit Filtern <ArrowRight aria-hidden className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}
