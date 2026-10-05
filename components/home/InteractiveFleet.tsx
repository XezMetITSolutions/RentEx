"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import CarCard, { type CarCardData } from "@/components/fleet/CarCard";
import { carSlug } from "@/lib/carPhotos";

interface CategoryType {
  id: number;
  name: string;
  sortOrder: number;
}

interface InteractiveFleetProps {
  initialCars: CarCardData[];
  categories: CategoryType[];
}

type SortKey = "price-asc" | "price-desc";

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
        <h2 id="hm-fleet-heading" className="hm-display text-[length:var(--hm-text-display-s)] font-[750] leading-[0.95]">
          Die ganze Flotte.
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
              className="min-h-10 bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-pill)] py-2 pl-4 pr-9 text-sm text-hm-ink outline-none appearance-none cursor-pointer hover:border-hm-muted focus:border-hm-ink transition-[border-color] duration-[var(--hm-dur-short)] ease-hm-out"
            >
              <option value="price-asc">Preis aufsteigend</option>
              <option value="price-desc">Preis absteigend</option>
            </select>
            <ChevronDown aria-hidden className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category filter — text tabs with counts */}
      <div role="tablist" aria-label="Fahrzeugklasse" className="mt-8 flex gap-2 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const active = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setActiveTab(tab.name)}
              className={`shrink-0 min-h-10 whitespace-nowrap rounded-[var(--hm-radius-pill)] border px-4 text-sm font-semibold transition-[background-color,color,border-color] duration-[var(--hm-dur-short)] ease-hm-out ${
                active
                  ? "border-hm-ink bg-hm-ink text-hm-paper"
                  : "border-hm-rule text-hm-ink-2 hover:border-hm-ink hover:text-hm-ink"
              }`}
            >
              {tab.name}
              <span className={`hm-tnum ml-1.5 font-hm-mono text-[11px] ${active ? "opacity-70" : "text-hm-muted"}`}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {displayedCars.length > 0 ? (
        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))] 2xl:grid-cols-[repeat(4,minmax(0,1fr))] gap-4">
          {displayedCars.map((car) => (
            <li key={car.id}>
              <CarCard car={car} href={`/fleet/${car.id}/${carSlug(car.brand, car.model)}`} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 py-16 text-center text-sm text-hm-muted border border-hm-rule rounded-[var(--hm-radius-card)]">
          In dieser Klasse ist gerade kein Fahrzeug frei.
        </p>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          href="/fleet"
          title="Gesamte Fahrzeugflotte anzeigen"
          className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-[var(--hm-radius-pill)] border border-hm-ink px-5 text-sm font-semibold text-hm-ink hover:bg-hm-ink hover:text-hm-paper transition-[background-color,color] duration-[var(--hm-dur-short)] ease-hm-out"
        >
          Ganze Flotte mit Filtern <ArrowRight aria-hidden className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}
