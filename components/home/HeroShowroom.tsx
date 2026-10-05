"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface ShowcaseItem {
  category: string;
  count: number;
  minRate: number;
  car: {
    name: string;
    imageUrl: string;
    href: string;
    specs: string;
    rate: number;
  };
}

const formatEuro = (value: number) =>
  value.toLocaleString("de-AT", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function HeroShowroom({
  items,
  modelCount,
  lowestRate,
}: {
  items: ShowcaseItem[];
  modelCount: number;
  lowestRate: number | null;
}) {
  const [active, setActive] = useState(0);
  const current = items[active];

  return (
    <div className="hm-stage relative overflow-hidden rounded-[var(--hm-radius-stage)] ring-1 ring-inset ring-hm-rule dark:ring-0 text-hm-stage-ink">
      <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-h-[560px] lg:min-h-[620px]">
        {/* Copy */}
        <div className="relative z-10 flex flex-col px-6 pt-10 sm:px-10 sm:pt-14 lg:pl-14 lg:pt-16 lg:pb-32">
          <p className="hm-tnum inline-flex w-fit items-center gap-2 rounded-[var(--hm-radius-pill)] bg-hm-stage-2 px-3 py-1.5 font-hm-mono text-[11px] text-hm-stage-muted">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-hm-accent" />
            {modelCount} Modelle{lowestRate !== null && <> · ab € {formatEuro(lowestRate)} / Tag</>}
          </p>

          <h1 className="hm-display mt-6 text-[length:var(--hm-text-display)] font-[800] leading-[0.9] text-hm-stage-ink">
            Mietwagen
            <br />
            in Feldkirch<span className="text-hm-accent">.</span>
          </h1>

          <p className="mt-6 max-w-[26rem] text-base sm:text-lg leading-relaxed text-hm-stage-muted">
            Vom Stadtflitzer bis zum Transporter — online gebucht, in der Illstraße abgeholt.
          </p>

          {items.length > 1 && (
            <div role="tablist" aria-label="Fahrzeugklasse wählen" className="mt-8 flex flex-wrap gap-2">
              {items.map((item, i) => {
                const selected = i === active;
                return (
                  <button
                    key={item.category}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    onClick={() => setActive(i)}
                    className={`min-h-10 whitespace-nowrap rounded-[var(--hm-radius-pill)] px-4 text-sm font-semibold transition-[background-color,color,box-shadow] duration-[var(--hm-dur-short)] ease-hm-out ${
                      selected
                        ? "bg-hm-stage-ink text-hm-stage shadow-sm"
                        : "bg-hm-stage-2 text-hm-stage-ink hover:bg-hm-stage-ink/15"
                    }`}
                  >
                    {item.category}
                    <span className={`hm-tnum ml-2 font-hm-mono text-[11px] ${selected ? "opacity-70" : "text-hm-stage-muted"}`}>{item.count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Car */}
        {current && (
          <div className="relative flex min-h-[320px] flex-col justify-end pb-16 sm:min-h-[420px] lg:block lg:min-h-0 lg:pb-0">
            <div
              key={current.car.imageUrl}
              className="hm-car-in absolute inset-x-[-4%] top-0 bottom-[132px] lg:inset-x-auto lg:left-[-6%] lg:right-[-4%] lg:top-[6%] lg:bottom-[24%]"
            >
              <Image
                src={current.car.imageUrl}
                alt={current.car.name}
                fill
                priority
                sizes="(min-width: 1024px) 62vw, 100vw"
                className="object-contain object-center"
              />
            </div>
            {/* floor shadow */}
            <div
              aria-hidden
              className="hidden lg:block absolute left-[14%] right-[10%] bottom-[25%] h-5 rounded-[50%] bg-hm-stage-ink/10 blur-xl"
            />

            {/* Caption */}
            <div className="relative mx-6 sm:mx-10 lg:absolute lg:mx-0 lg:left-10 lg:right-14 lg:bottom-28 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-stage-muted">{current.category}</p>
                <p className="mt-1 text-lg sm:text-xl font-bold leading-tight lg:truncate">{current.car.name}</p>
                <p className="mt-0.5 text-xs text-hm-stage-muted lg:truncate">{current.car.specs}</p>
              </div>
              <Link
                href={current.car.href}
                className="group shrink-0 inline-flex items-center gap-2 whitespace-nowrap rounded-[var(--hm-radius-pill)] bg-hm-stage-2 pl-4 pr-3 py-2.5 text-sm font-semibold text-hm-stage-ink hover:bg-hm-stage-ink hover:text-hm-stage transition-[background-color,color] duration-[var(--hm-dur-short)] ease-hm-out"
              >
                <span className="hm-tnum">€ {formatEuro(current.car.rate)}</span>
                <span className="text-hm-stage-muted group-hover:text-hm-stage/70 font-normal">/ Tag</span>
                <ArrowRight aria-hidden className="w-4 h-4 transition-transform duration-[var(--hm-dur-short)] ease-hm-out group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
