/* Hallmark · genre: modern-minimal · macrostructure: Catalogue · theme: custom (brand red) · enrichment: none · nav: shared Navbar · footer: shared Footer
 * tokens: /tokens.css · pre-emit critique: P4 H5 E4 S5 R4 V4
 */
import { Archivo, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/home/Navbar";
import InteractiveFleet from "@/components/home/InteractiveFleet";
import HowItWorks from "@/components/home/HowItWorks";
import FaqAccordion from "@/components/home/FaqAccordion";
import NewsletterCta from "@/components/home/NewsletterCta";
import Footer from "@/components/home/Footer";
import { getFeaturedCars, getCarCategories } from "@/app/actions";
import { ArrowRight, ChevronDown } from "lucide-react";
import { SITE_URL } from '@/lib/config';

// Live fleet + availability: render per request, never prerender at build (CI has no DB).
export const dynamic = "force-dynamic";

const archivo = Archivo({
  variable: "--font-hm-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-hm-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const formatEuro = (value: number) =>
  value.toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default async function Home() {
  const featuredCarsRaw = await getFeaturedCars();
  const categories = await getCarCategories();

  // Plain objects only: Prisma Decimal can't cross into client components.
  const featuredCars = featuredCarsRaw.map((car) => ({
    id: car.id,
    brand: car.brand,
    model: car.model,
    imageUrl: car.imageUrl,
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
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
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

  // Every row is taken from the rental terms / FAQ — no invented figures.
  const terms = [
    { label: "Abholung", value: "Illstraße 75a, 6800 Feldkirch", note: "Fahrzeuge im ganzen Ländle" },
    { label: "Erreichbarkeit", value: "24 / 7", note: "+43 660 9996800" },
    { label: "Versicherung", value: "Vollkasko & Insassenschutz", note: "bei allen Fahrzeugen" },
    { label: "Führerschein", value: "mind. 2 Jahre", note: "ununterbrochen gültig" },
    { label: "Tankregelung", value: "voll / voll", note: "sonst Kosten + 18,00 € Pauschale" },
    { label: "Mehrkilometer", value: "0,33 – 0,45 € / km", note: "je nach Fahrzeug" },
    { label: "Mietdauer", value: "Tag · Woche · Monat", note: "flexibel verlängerbar" },
    { label: "Ausland", value: "nach Genehmigung", note: "bitte vor Mietbeginn melden" },
  ];

  const fieldClass =
    "w-full min-h-11 bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-input)] px-3 py-2.5 text-sm text-hm-ink outline-none transition-[border-color] duration-[var(--hm-dur-short)] ease-hm-out hover:border-hm-muted focus:border-hm-ink dark:[color-scheme:dark]";
  const labelClass = "block font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted mb-1.5";

  return (
    <div className={`${archivo.variable} ${jetbrains.variable} hm-home min-h-screen bg-hm-paper text-hm-ink font-hm-body selection:bg-hm-accent/25`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Navbar />

      <main className="pt-20">
        {/* Inventory header + booking form */}
        <section className="border-b border-hm-rule">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-14 pb-12 lg:pt-20 lg:pb-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-end">
            <div className="min-w-0">
              <p className="hm-tnum font-hm-mono text-xs text-hm-muted mb-6">
                {featuredCars.length} Modelle · {availableCategories.length} Klassen
                {lowestRate !== null && <> · ab € {formatEuro(lowestRate)} / Tag</>}
              </p>
              <h1 className="hm-display text-[length:var(--hm-text-display)] font-[750] leading-[0.92] text-hm-ink">
                Mietwagen in Feldkirch<span className="text-hm-accent">.</span>
              </h1>
              <p className="mt-6 max-w-[34rem] text-base sm:text-lg leading-relaxed text-hm-ink-2">
                Vom Kleinwagen bis zum Kastenwagen. Datum wählen, Fahrzeug aussuchen,
                online buchen — abgeholt wird in der Illstraße.
              </p>
            </div>

            <form
              action="/fleet"
              method="get"
              className="min-w-0 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-card)] p-5 sm:p-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hm-pickup" className={labelClass}>Abholung</label>
                  <input id="hm-pickup" name="pickup" type="date" defaultValue={todayStr} min={todayStr} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="hm-return" className={labelClass}>Rückgabe</label>
                  <input id="hm-return" name="return" type="date" defaultValue={tomorrowStr} min={todayStr} className={fieldClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="hm-category" className={labelClass}>Fahrzeugklasse</label>
                  <div className="relative">
                    <select id="hm-category" name="category" defaultValue="" className={`${fieldClass} appearance-none pr-10 cursor-pointer`}>
                      <option value="">Alle Klassen</option>
                      {availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <ChevronDown aria-hidden className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted pointer-events-none" />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="group mt-5 w-full min-h-12 inline-flex items-center justify-center gap-2 whitespace-nowrap bg-hm-accent hover:bg-hm-accent-hover active:translate-y-px text-hm-accent-ink font-semibold text-sm rounded-[var(--hm-radius-input)] transition-[background-color,transform] duration-[var(--hm-dur-short)] ease-hm-out"
              >
                Verfügbare Fahrzeuge zeigen
                <ArrowRight aria-hidden className="w-4 h-4 transition-transform duration-[var(--hm-dur-short)] ease-hm-out group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        </section>

        {/* Catalogue */}
        <section aria-labelledby="hm-fleet-heading" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
          <InteractiveFleet initialCars={featuredCars} categories={availableCategories} />
        </section>

        {/* Terms spec sheet */}
        <section aria-labelledby="hm-terms-heading" className="border-t border-hm-rule bg-hm-paper-2">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-10 lg:gap-16">
            <div className="min-w-0">
              <h2 id="hm-terms-heading" className="hm-display text-[length:var(--hm-text-display-s)] font-[700] leading-[0.95]">
                Konditionen, ohne Kleingedrucktes.
              </h2>
              <p className="mt-5 max-w-sm text-hm-ink-2 leading-relaxed">
                Was gilt, bevor Sie losfahren. Die vollständigen Bedingungen stehen in den{" "}
                <a href="/terms" className="text-hm-ink underline decoration-hm-accent decoration-2 underline-offset-4 hover:decoration-hm-ink transition-[text-decoration-color] duration-[var(--hm-dur-short)]">AGB</a>.
              </p>
              <a
                href="tel:+436609996800"
                className="hm-tnum mt-8 inline-flex items-center gap-2 whitespace-nowrap font-hm-mono text-sm text-hm-ink border-b border-hm-rule-strong pb-1 hover:text-hm-accent-text hover:border-hm-accent transition-[color,border-color] duration-[var(--hm-dur-short)] ease-hm-out"
              >
                +43 660 9996800 <ArrowRight aria-hidden className="w-3.5 h-3.5" />
              </a>
            </div>

            <dl className="min-w-0 border-t border-hm-rule-strong">
              {terms.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-1 sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)] gap-x-6 gap-y-1 py-4 border-b border-hm-rule"
                >
                  <dt className="font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted sm:pt-1">{row.label}</dt>
                  <dd className="hm-tnum font-semibold text-hm-ink">{row.value}</dd>
                  <dd className="text-sm text-hm-muted sm:pt-0.5">{row.note}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <HowItWorks />
        <FaqAccordion />
        <NewsletterCta />
      </main>

      <Footer />
    </div>
  );
}
