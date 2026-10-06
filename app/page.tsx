/* Hallmark · genre: modern-minimal · macrostructure: Photographic (showroom stage) · theme: custom (brand red) · enrichment: real fleet photography · nav: shared Navbar · footer: shared Footer
 * replaces: Catalogue (2026-10-05) · tokens: /tokens.css · pre-emit critique: P4 H5 E4 S5 R4 V5
 */
import Navbar from "@/components/home/Navbar";
import InteractiveFleet from "@/components/home/InteractiveFleet";
import HeroShowroom, { type ShowcaseItem } from "@/components/home/HeroShowroom";
import HowItWorks from "@/components/home/HowItWorks";
import FaqAccordion from "@/components/home/FaqAccordion";
import NewsletterCta from "@/components/home/NewsletterCta";
import Footer from "@/components/home/Footer";
import { getFeaturedCars, getCarCategories } from "@/app/actions";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronDown, Phone, ShieldCheck, CalendarRange, MapPin } from "lucide-react";
import { SITE_URL } from '@/lib/config';
import { hmFontVariables } from "@/lib/hmFonts";
import { BRANDED_PHOTOS, carPhoto, carSlug } from "@/lib/carPhotos";

// Live fleet + availability: render per request, never prerender at build (CI has no DB).
export const dynamic = "force-dynamic";

const formatEuro = (value: number) =>
  value.toLocaleString("de-AT", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default async function Home() {
  const featuredCarsRaw = await getFeaturedCars();
  const categories = await getCarCategories();

  // Plain objects only: Prisma Decimal can't cross into client components.
  const featuredCars = featuredCarsRaw.map((car) => ({
    id: car.id,
    brand: car.brand,
    model: car.model,
    imageUrl: carPhoto(car.brand, car.model, car.imageUrl),
    dailyRate: Number(car.dailyRate),
    fuelType: car.fuelType,
    transmission: car.transmission,
    seats: car.seats,
    category: car.category,
    hasAirConditioning: car.hasAirConditioning,
  }));

  const availableCategories = categories
    .filter((cat) => featuredCars.some((car) => car.category?.toLowerCase() === cat.name.toLowerCase()))
    .map((cat) => ({ id: cat.id, name: cat.name, sortOrder: cat.sortOrder }));

  const lowestRate = featuredCars.length > 0 ? Math.min(...featuredCars.map((car) => car.dailyRate)) : null;

  // One hero car per class: the priciest model with a branded studio photo,
  // falling back to any .png, then any photo.
  const showcase: ShowcaseItem[] = [...availableCategories].sort((a, b) =>
    featuredCars.filter((car) => car.category === b.name).length - featuredCars.filter((car) => car.category === a.name).length
  ).flatMap((cat) => {
    const inClass = featuredCars.filter((car) => car.category?.toLowerCase() === cat.name.toLowerCase());
    const branded = inClass.filter((car) => car.imageUrl && BRANDED_PHOTOS.has(car.imageUrl));
    const png = inClass.filter((car) => car.imageUrl?.toLowerCase().endsWith(".png"));
    const pool = branded.length ? branded : png.length ? png : inClass.filter((car) => car.imageUrl);
    const pick = [...pool].sort((a, b) => b.dailyRate - a.dailyRate)[0];
    if (!pick?.imageUrl) return [];
    return [{
      category: cat.name,
      count: inClass.length,
      minRate: Math.min(...inClass.map((car) => car.dailyRate)),
      car: {
        name: `${pick.brand} ${pick.model}`,
        imageUrl: pick.imageUrl,
        href: `/fleet/${pick.id}/${carSlug(pick.brand, pick.model)}`,
        specs: [pick.transmission || "Automatik", pick.fuelType, `${pick.seats || 5} Sitze`].filter(Boolean).join(" · "),
        rate: pick.dailyRate,
      },
    }];
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CarRental",
    "name": "Rent-Ex GmbH",
    "image": `${SITE_URL}/assets/logo.png`,
    "@id": `${SITE_URL}/#carrental`,
    "url": SITE_URL,
    "telephone": "+436609996800",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Illstraße 75a",
      "addressLocality": "Feldkirch",
      "postalCode": "6800",
      "addressCountry": "AT"
    },
    // Staffed hours (lib/config OPENING_HOURS); phone support is separate.
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "15:00"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Darf ich mit dem Mietwagen ins Ausland fahren?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Ja, Fahrten ins Ausland sind jedoch ausschließlich mit unserer vorherigen Genehmigung zulässig. Bitte informieren Sie uns spätestens bei Mietbeginn über Ihre Reisepläne. Beachten Sie, dass bei Fahrten in bestimmte Länder (z.B. Italien, Polen, Balkanstaaten, Türkei) eine vereinbarte Haftungsreduzierung bei Diebstahl und Einbruch entfällt."
        }
      },
      {
        "@type": "Question",
        "name": "Wie ist die Tankregelung bei der Rückgabe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sie übernehmen das Fahrzeug mit vollem Kraftstofftank bzw. voller Batterieladung und können es ebenso voll zurückgeben. Falls wir für Sie nachtanken oder nachladen müssen, verrechnen wir die tatsächlichen Kosten zuzüglich einer pauschalen Aufwandsentschädigung von 18,00 €."
        }
      },
      {
        "@type": "Question",
        "name": "Gibt es Voraussetzungen für den Fahrer (Alter/Führerschein)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Das Fahrzeug darf nur von Personen gelenkt werden, die uneingeschränkt fahrtüchtig und seit mindestens zwei Jahren im ununterbrochenen Besitz einer gültigen Lenkerberechtigung (Führerschein) sind."
        }
      },
      {
        "@type": "Question",
        "name": "Was kostet es, wenn ich zusätzliche Kilometer fahre?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sofern nicht anders vereinbart, werden zusätzliche Kilometer (Mehrkilometer) je nach gemietetem Fahrzeug mit 0,33 € bis 0,45 € pro gefahrenem Kilometer verrechnet."
        }
      },
      {
        "@type": "Question",
        "name": "Wie verhalte ich mich bei einem Unfall oder Schaden?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Bei jedem Unfall oder Schaden (auch bei reinen Sachschäden oder ohne Beteiligung Dritter) müssen Sie unverzüglich uns benachrichtigen und zwingend die Polizei zur Unfallaufnahme hinzuziehen. Ein Schuldeingeständnis darf vor Ort nicht abgegeben werden."
        }
      }
    ]
  };

  // Every fact below comes from the rental terms / FAQ — no invented figures.
  const conditions = [
    { label: "Führerschein", value: "mind. 2 Jahre" },
    { label: "Tankregelung", value: "voll / voll" },
    { label: "Mehrkilometer", value: "0,33 – 0,45 € / km" },
    { label: "Ausland", value: "nach Genehmigung" },
  ];

  const fieldClass =
    "w-full min-h-12 bg-transparent px-0 pt-0.5 text-[15px] font-semibold text-hm-ink outline-none dark:[color-scheme:dark]";
  const labelClass = "block font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted";
  const cellClass =
    "min-w-0 rounded-[var(--hm-radius-input)] px-4 pt-3 pb-1 hover:bg-hm-paper-2 focus-within:bg-hm-paper-2 transition-[background-color] duration-[var(--hm-dur-short)] ease-hm-out";

  return (
    <div className={`${hmFontVariables} hm-home min-h-screen bg-hm-paper text-hm-ink font-hm-body selection:bg-hm-accent/25`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />

      <main className="pt-24">
        {/* Showroom hero + booking bar */}
        <section className="px-3 sm:px-5 lg:px-6">
          <div className="max-w-[1480px] mx-auto">
            <HeroShowroom items={showcase} modelCount={featuredCars.length} lowestRate={lowestRate} />

            <form
              action="/fleet"
              method="get"
              aria-label="Fahrzeugsuche"
              className="hm-float relative z-10 mx-auto -mt-10 lg:-mt-16 w-[calc(100%-1.5rem)] lg:w-[calc(100%-7rem)] max-w-[1180px] rounded-[calc(var(--hm-radius-input)+8px)] bg-hm-paper border border-hm-rule p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_auto] gap-1 lg:items-stretch"
            >
              <div className={cellClass}>
                <label htmlFor="hm-pickup" className={labelClass}>Abholung</label>
                <input id="hm-pickup" name="pickup" type="date" defaultValue={todayStr} min={todayStr} className={fieldClass} />
              </div>
              <div className={cellClass}>
                <label htmlFor="hm-return" className={labelClass}>Rückgabe</label>
                <input id="hm-return" name="return" type="date" defaultValue={tomorrowStr} min={todayStr} className={fieldClass} />
              </div>
              <div className={`${cellClass} sm:col-span-2 lg:col-span-1`}>
                <label htmlFor="hm-category" className={labelClass}>Fahrzeugklasse</label>
                <div className="relative">
                  <select id="hm-category" name="category" defaultValue="" className={`${fieldClass} appearance-none pr-8 cursor-pointer`}>
                    <option value="">Alle Klassen</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted pointer-events-none" />
                </div>
              </div>
              <button
                type="submit"
                className="group sm:col-span-2 lg:col-span-1 min-h-14 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover active:translate-y-px px-7 text-hm-accent-ink font-semibold text-[15px] transition-[background-color,transform] duration-[var(--hm-dur-short)] ease-hm-out"
              >
                Fahrzeuge finden
                <ArrowRight aria-hidden className="w-4 h-4 transition-transform duration-[var(--hm-dur-short)] ease-hm-out group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        </section>

        {/* Classes */}
        {showcase.length > 0 && (
          <section aria-labelledby="hm-classes-heading" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-20 lg:pt-28">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 id="hm-classes-heading" className="hm-display text-[length:var(--hm-text-display-s)] font-[750] leading-[0.95]">
                Für jede Fahrt die passende Klasse.
              </h2>
              <Link href="/fleet" className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-hm-ink-2 hover:text-hm-accent-text transition-[color] duration-[var(--hm-dur-short)]">
                Alle Fahrzeuge <ArrowRight aria-hidden className="w-4 h-4" />
              </Link>
            </div>

            <ul className="mt-10 grid grid-cols-1 md:grid-cols-[repeat(3,minmax(0,1fr))] gap-4">
              {showcase.map((item) => (
                <li key={item.category}>
                  <Link
                    href={`/fleet?category=${encodeURIComponent(item.category)}`}
                    className="group hm-stage ring-1 ring-inset ring-hm-rule dark:ring-0 relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[var(--hm-radius-card)] p-6 text-hm-stage-ink"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="hm-display text-3xl font-[750] leading-none">{item.category}</h3>
                        <p className="hm-tnum mt-2 text-sm text-hm-stage-muted">
                          {item.count} {item.count === 1 ? "Modell" : "Modelle"} · ab € {formatEuro(item.minRate)} / Tag
                        </p>
                      </div>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-hm-stage-2 text-hm-stage-ink transition-[background-color,color,transform] duration-[var(--hm-dur-short)] ease-hm-out group-hover:bg-hm-accent group-hover:text-hm-accent-ink group-hover:rotate-45">
                        <ArrowUpRight aria-hidden className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[calc(var(--hm-radius-card)-6px)]">
                      <Image
                        src={item.car.imageUrl}
                        alt={item.car.name}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-[var(--hm-dur-med)] ease-hm-out group-hover:scale-[1.04]"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Catalogue */}
        <section aria-labelledby="hm-fleet-heading" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-20 lg:py-28">
          <InteractiveFleet initialCars={featuredCars} categories={availableCategories} />
        </section>

        {/* Why Rent-Ex — bento */}
        <section aria-labelledby="hm-why-heading" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pb-20 lg:pb-28">
          <h2 id="hm-why-heading" className="hm-display max-w-2xl text-[length:var(--hm-text-display-s)] font-[750] leading-[0.95]">
            Mieten ohne Kleingedrucktes.
          </h2>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(4,minmax(0,1fr))] gap-4">
            <div className="md:col-span-2 lg:row-span-2 flex flex-col justify-between gap-10 rounded-[var(--hm-radius-card)] bg-hm-stage-ink p-7 sm:p-9 text-hm-stage">
              <Phone aria-hidden className="w-7 h-7 text-hm-accent" />
              <div>
                <p className="hm-display hm-tnum text-[clamp(4.5rem,9vw,8rem)] font-[800] leading-[0.85]">24/7</p>
                <p className="mt-4 max-w-sm text-lg text-hm-stage/75">
                  Erreichbar, wenn Sie uns brauchen — auch am Wochenende und bei Pannen.
                </p>
                <a
                  href="tel:+436609996800"
                  className="hm-tnum mt-7 inline-flex items-center gap-2 whitespace-nowrap rounded-[var(--hm-radius-pill)] bg-hm-accent px-5 py-3 text-sm font-semibold text-hm-accent-ink hover:bg-hm-accent-hover transition-[background-color] duration-[var(--hm-dur-short)] ease-hm-out"
                >
                  +43 660 9996800 <ArrowRight aria-hidden className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-8 rounded-[var(--hm-radius-card)] bg-hm-paper-2 p-7">
              <ShieldCheck aria-hidden className="w-6 h-6 text-hm-accent-text" />
              <div className="mt-auto">
                <h3 className="text-xl font-bold">Vollkasko & Insassenschutz</h3>
                <p className="mt-2 text-sm text-hm-ink-2">Bei jedem Fahrzeug der Flotte.</p>
              </div>
            </div>

            <div className="flex flex-col gap-8 rounded-[var(--hm-radius-card)] bg-hm-paper-2 p-7">
              <CalendarRange aria-hidden className="w-6 h-6 text-hm-accent-text" />
              <div className="mt-auto">
                <h3 className="text-xl font-bold">Tag, Woche, Monat</h3>
                <p className="mt-2 text-sm text-hm-ink-2">Flexible Mietdauer, unkompliziert verlängerbar.</p>
              </div>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Illstra%C3%9Fe+75a+6800+Feldkirch"
              target="_blank"
              rel="noopener noreferrer"
              className="group md:col-span-2 flex items-end justify-between gap-6 rounded-[var(--hm-radius-card)] border border-hm-rule p-7 hover:border-hm-ink transition-[border-color] duration-[var(--hm-dur-short)] ease-hm-out"
            >
              <div>
                <MapPin aria-hidden className="w-6 h-6 text-hm-accent-text" />
                <h3 className="mt-8 text-xl font-bold">Illstraße 75a, 6800 Feldkirch</h3>
                <p className="mt-2 text-sm text-hm-ink-2">Abholung & Rückgabe — für ganz Vorarlberg.</p>
              </div>
              <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-hm-ink">
                Route <ArrowUpRight aria-hidden className="w-4 h-4 transition-transform duration-[var(--hm-dur-short)] ease-hm-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </a>
          </div>

          <dl className="mt-4 grid grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] gap-x-6 gap-y-5 rounded-[var(--hm-radius-card)] border border-hm-rule px-7 py-6 lg:items-center">
            {conditions.map((row) => (
              <div key={row.label} className="min-w-0">
                <dt className="font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted">{row.label}</dt>
                <dd className="hm-tnum mt-1 font-semibold text-hm-ink">{row.value}</dd>
              </div>
            ))}
            <Link
              href="/terms"
              className="col-span-2 lg:col-span-1 inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-hm-ink-2 hover:text-hm-accent-text transition-[color] duration-[var(--hm-dur-short)]"
            >
              Alle Bedingungen <ArrowRight aria-hidden className="w-4 h-4" />
            </Link>
          </dl>
        </section>

        <HowItWorks />
        <FaqAccordion />
        <NewsletterCta />
      </main>

      <Footer />
    </div>
  );
}
