const steps = [
  {
    stage: "1.0",
    title: "Fahrzeug wählen.",
    description: "Zeitraum eingeben und aus den freien Fahrzeugen das passende aussuchen.",
  },
  {
    stage: "2.0",
    title: "Online buchen.",
    description: "Reservierung und Zahlung in wenigen Schritten — die Bestätigung kommt per E-Mail.",
  },
  {
    stage: "3.0",
    title: "Abholen & losfahren.",
    description: "Schlüssel in der Illstraße 75a in Feldkirch abholen. Voll getankt zurückbringen.",
  },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="hm-steps-heading" className="border-t border-hm-rule">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
        <h2 id="hm-steps-heading" className="hm-display max-w-3xl text-[length:var(--hm-text-display-s)] font-[700] leading-[0.95]">
          Drei Schritte bis zum Schlüssel.
        </h2>

        <ol className="mt-12 grid grid-cols-1 md:grid-cols-[repeat(3,minmax(0,1fr))] border-t border-hm-rule-strong">
          {steps.map((step) => (
            <li key={step.stage} className="py-6 md:py-8 md:pr-10 border-b md:border-b-0 border-hm-rule">
              <span className="hm-tnum font-hm-mono text-sm text-hm-accent-text">{step.stage}</span>
              <h3 className="mt-4 text-xl font-bold text-hm-ink">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-hm-ink-2">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
