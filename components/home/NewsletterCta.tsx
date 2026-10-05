import { ArrowRight } from "lucide-react";

export default function NewsletterCta() {
  return (
    <section aria-labelledby="hm-newsletter-heading" className="border-t border-hm-rule">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-8 lg:gap-16 items-end">
        <div className="min-w-0">
          <h2 id="hm-newsletter-heading" className="hm-display text-[length:var(--hm-text-display-s)] font-[700] leading-[0.95]">
            Neue Fahrzeuge zuerst erfahren.
          </h2>
          <p className="mt-5 max-w-md text-hm-ink-2 leading-relaxed">
            Angebote, Neuzugänge in der Flotte und saisonale Rabatte — selten, aber lohnend.
          </p>
        </div>

        <div className="min-w-0">
          <form className="grid grid-cols-[minmax(0,1fr)_auto] items-center border-b-2 border-hm-rule-strong focus-within:border-hm-accent transition-[border-color] duration-[var(--hm-dur-short)] ease-hm-out">
            <label htmlFor="hm-newsletter-email" className="sr-only">E-Mail-Adresse</label>
            <input
              id="hm-newsletter-email"
              type="email"
              placeholder="name@beispiel.at"
              autoComplete="email"
              required
              className="min-h-12 bg-transparent py-3 text-base text-hm-ink outline-none placeholder:text-hm-muted"
            />
            <button
              type="submit"
              className="group inline-flex items-center gap-2 whitespace-nowrap py-3 pl-4 text-sm font-semibold text-hm-ink hover:text-hm-accent-text transition-[color] duration-[var(--hm-dur-short)] ease-hm-out"
            >
              Anmelden
              <ArrowRight aria-hidden className="w-4 h-4 transition-transform duration-[var(--hm-dur-short)] ease-hm-out group-hover:translate-x-0.5" />
            </button>
          </form>
          <p className="mt-3 text-xs text-hm-muted">Kein Spam. Abmeldung jederzeit.</p>
        </div>
      </div>
    </section>
  );
}
