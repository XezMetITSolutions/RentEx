import Link from "next/link";
import { Search, CalendarCheck, KeyRound, ArrowRight, ShieldCheck, Clock, MapPin, Sparkles } from "lucide-react";
import AustrianPlate from "@/components/ui/AustrianPlate";

const steps = [
  {
    step: "01",
    tag: "Transparente Auswahl",
    title: "Fahrzeug & Zeitraum wählen",
    description: "Keine versteckten Gebühren. Echtzeit-Verfügbarkeit aller Modelle mit fixen Tagespreisen inklusive Vollkasko und Insassenschutz.",
    icon: Search,
    badge: "14 Modelle verfügbar",
    highlight: "Sofort online einsehbar",
    accentColor: "from-amber-500/10 to-orange-500/10",
  },
  {
    step: "02",
    tag: "Schnelle Reservierung",
    title: "Online buchen & zahlen",
    description: "In unter 2 Minuten reserviert. Bezahlen Sie bequem per Kreditkarte oder wählen Sie bei Abholung die Bar-/Kartenzahlung vor Ort.",
    icon: CalendarCheck,
    badge: "Faire AGB §7 Stornoregelung",
    highlight: "Sofortige Bestätigung per E-Mail",
    accentColor: "from-blue-500/10 to-cyan-500/10",
  },
  {
    step: "03",
    tag: "Flexible Übergabe",
    title: "Schlüssel holen & losfahren",
    description: "Persönlich in unserer Filiale Illstraße 75a in Feldkirch oder rund um die Uhr kontaktlos per 24/7 Schlüsseltresor mit eigenem Code.",
    icon: KeyRound,
    badge: "24/7 Self Check-in Safe",
    highlight: "Illstraße 75a, Feldkirch",
    accentColor: "from-rose-500/10 to-red-500/10",
  },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="hm-steps-heading" className="border-t border-hm-rule bg-gradient-to-b from-hm-paper to-hm-paper-2/40 py-20 lg:py-28 relative overflow-hidden">
      {/* Subtle ambient accent glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-hm-accent/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Header with pill and lead-in */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 max-w-4xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hm-accent/10 border border-hm-accent/20 text-hm-accent-text text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Einfach, flexibel & transparent
            </div>
            <h2 id="hm-steps-heading" className="hm-display text-[length:var(--hm-text-display-s)] font-[750] leading-[0.95] text-hm-ink">
              Drei Schritte bis zum Schlüssel.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-hm-ink-2 max-w-2xl leading-relaxed">
              Vom ersten Klick bis zur Abfahrt in Feldkirch — kein Papierkram, keine Warteschlangen und keine bösen Überraschungen bei der Rückgabe.
            </p>
          </div>

          <div className="shrink-0 pb-1">
            <Link
              href="/fleet"
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-[var(--hm-radius-pill)] bg-hm-ink text-hm-paper font-semibold text-sm hover:bg-hm-accent hover:text-hm-accent-ink transition-[background-color,color] duration-[var(--hm-dur-short)] ease-hm-out shadow-sm"
            >
              Jetzt Fahrzeug finden
              <ArrowRight aria-hidden className="w-4 h-4 transition-transform duration-[var(--hm-dur-short)] ease-hm-out group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* 3 Interactive Feature Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative flex flex-col justify-between rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper p-7 lg:p-8 hover:border-hm-ink/40 transition-[border-color,transform,box-shadow] duration-[var(--hm-dur-med)] ease-hm-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
              >
                {/* Top bar: Step number & Category Tag */}
                <div>
                  <div className="flex items-center justify-between pb-6 border-b border-hm-rule">
                    <span className="font-hm-mono text-2xl font-bold tracking-tight text-hm-accent-text">
                      {item.step}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-hm-paper-2 border border-hm-rule text-hm-ink-2">
                      {item.tag}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="mt-6">
                    <div className="w-12 h-12 rounded-2xl bg-hm-paper-2 border border-hm-rule flex items-center justify-center text-hm-ink group-hover:bg-hm-accent group-hover:text-hm-accent-ink group-hover:border-hm-accent transition-colors duration-[var(--hm-dur-short)]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="mt-5 text-xl lg:text-2xl font-bold text-hm-ink tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm text-hm-ink-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom detail pill / highlight */}
                <div className="mt-8 pt-5 border-t border-hm-rule flex flex-wrap items-center justify-between gap-2 text-xs text-hm-muted">
                  <span className="font-medium text-hm-ink flex items-center gap-1.5 shrink-0">
                    {idx === 2 ? <Clock className="w-3.5 h-3.5 text-hm-accent-text" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />}
                    {item.highlight}
                  </span>
                  <span className="font-hm-mono font-semibold text-hm-ink-2 shrink-0">{item.badge}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Location & Handover Banner */}
        <div className="mt-8 rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-stage-ink text-hm-stage p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-hm-accent/20 border border-hm-accent/40 text-hm-accent grid place-items-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase font-hm-mono text-hm-stage/70 tracking-wider">Zentraler Stützpunkt</p>
              <h4 className="text-lg sm:text-xl font-bold text-white mt-0.5">Illstraße 75a, 6800 Feldkirch</h4>
              <p className="text-sm text-hm-stage/75 mt-0.5">Direkt erreichbar im Vorarlberger Rheintal · Parkplätze vor Ort vorhanden.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-white/10 text-white font-medium border border-white/10">
              Schlüsseltresor 24/7 aktiv
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
              Fahrzeuge vollgetankt bereit
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
