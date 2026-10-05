import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface CarCardData {
  id: number;
  brand: string;
  model: string;
  imageUrl: string | null;
  dailyRate: number;
  fuelType: string | null;
  transmission: string | null;
  seats: number | null;
  category: string | null;
  hasAirConditioning?: boolean;
}

const formatEuro = (value: number) =>
  value.toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CarCard({ car, href, priority = false }: { car: CarCardData; href: string; priority?: boolean }) {
  const specs = [
    car.transmission || "Automatik",
    car.fuelType || "Diesel",
    `${car.seats || 5} Sitze`,
    car.hasAirConditioning ? "Klima" : null,
  ].filter(Boolean);

  return (
    <Link
      href={href}
      title={`${car.brand} ${car.model} buchen`}
      className="group flex h-full flex-col rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper p-3 hover:border-hm-ink-2 transition-[border-color] duration-[var(--hm-dur-short)] ease-hm-out"
    >
      <div className="hm-stage relative aspect-[16/10] w-full overflow-hidden rounded-[calc(var(--hm-radius-card)-6px)]">
        <span className="absolute left-3 top-3 z-10 rounded-[var(--hm-radius-pill)] bg-hm-stage-2 px-2.5 py-1 font-hm-mono text-[10px] uppercase tracking-[0.08em] text-hm-stage-muted">
          {car.category || "Fahrzeug"}
        </span>
        {car.imageUrl ? (
          <Image
            src={car.imageUrl}
            alt={`${car.brand} ${car.model}`}
            fill
            priority={priority}
            sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-2 transition-transform duration-[var(--hm-dur-med)] ease-hm-out group-hover:scale-[1.04]"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-sm text-hm-stage-muted">Foto folgt</span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2">
        <h3 className="mt-4 text-base font-bold leading-snug text-hm-ink">
          {car.brand} {car.model}
        </h3>
        <p className="mt-1 text-xs text-hm-muted">{specs.join(" · ")}</p>

        <div className="mt-auto pt-5 flex items-center justify-between gap-3">
          <p className="hm-tnum">
            <span className="text-xs text-hm-muted">ab </span>
            <span className="text-xl font-bold text-hm-ink">€ {formatEuro(car.dailyRate)}</span>
            <span className="text-xs text-hm-muted"> / Tag</span>
          </p>
          <span className="inline-flex min-h-9 items-center gap-1 whitespace-nowrap rounded-[var(--hm-radius-pill)] bg-hm-paper-2 px-3.5 text-sm font-semibold text-hm-ink transition-[background-color,color] duration-[var(--hm-dur-short)] ease-hm-out group-hover:bg-hm-accent group-hover:text-hm-accent-ink">
            Buchen
            <ArrowRight aria-hidden className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
