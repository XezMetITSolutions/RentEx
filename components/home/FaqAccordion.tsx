"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

const faqs = [
  {
    question: "Darf ich mit dem Mietwagen ins Ausland fahren?",
    answer: "Ja, Fahrten ins Ausland sind jedoch ausschließlich mit unserer vorherigen Genehmigung zulässig. Bitte informieren Sie uns spätestens bei Mietbeginn über Ihre Reisepläne. Beachten Sie, dass bei Fahrten in bestimmte Länder (z.B. Italien, Polen, Balkanstaaten, Türkei) eine vereinbarte Haftungsreduzierung bei Diebstahl und Einbruch entfällt."
  },
  {
    question: "Wie ist die Tankregelung bei der Rückgabe?",
    answer: "Sie übernehmen das Fahrzeug mit vollem Kraftstofftank bzw. voller Batterieladung und können es ebenso voll zurückgeben. Falls wir für Sie nachtanken oder nachladen müssen, verrechnen wir die tatsächlichen Kosten zuzüglich einer pauschalen Aufwandsentschädigung von 18,00 €."
  },
  {
    question: "Gibt es Voraussetzungen für den Fahrer (Alter/Führerschein)?",
    answer: "Das Fahrzeug darf nur von Personen gelenkt werden, die uneingeschränkt fahrtüchtig und seit mindestens zwei Jahren im ununterbrochenen Besitz einer gültigen Lenkerberechtigung (Führerschein) sind."
  },
  {
    question: "Was kostet es, wenn ich zusätzliche Kilometer fahre?",
    answer: "Sofern nicht anders vereinbart, werden zusätzliche Kilometer (Mehrkilometer) je nach gemietetem Fahrzeug mit 0,33 € bis 0,45 € pro gefahrenem Kilometer verrechnet."
  },
  {
    question: "Wie verhalte ich mich bei einem Unfall oder Schaden?",
    answer: "Bei jedem Unfall oder Schaden (auch bei reinen Sachschäden oder ohne Beteiligung Dritter) müssen Sie unverzüglich uns benachrichtigen und zwingend die Polizei zur Unfallaufnahme hinzuziehen. Ein Schuldeingeständnis darf vor Ort nicht abgegeben werden."
  }
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section aria-labelledby="hm-faq-heading" className="border-t border-hm-rule bg-hm-paper-2">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-10 lg:gap-16">
        <div className="min-w-0">
          <h2 id="hm-faq-heading" className="hm-display text-[length:var(--hm-text-display-s)] font-[700] leading-[0.95]">
            Häufige Fragen.
          </h2>
          <p className="mt-5 max-w-sm text-hm-ink-2 leading-relaxed">
            Nicht dabei?{" "}
            <Link href="/faq" className="text-hm-ink underline decoration-hm-accent decoration-2 underline-offset-4 hover:decoration-hm-ink transition-[text-decoration-color] duration-[var(--hm-dur-short)]">
              Alle Fragen
            </Link>{" "}
            oder direkt{" "}
            <Link href="/contact" className="text-hm-ink underline decoration-hm-accent decoration-2 underline-offset-4 hover:decoration-hm-ink transition-[text-decoration-color] duration-[var(--hm-dur-short)]">
              Kontakt aufnehmen
            </Link>.
          </p>
        </div>

        <div className="min-w-0 border-t border-hm-rule-strong">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            const panelId = `hm-faq-panel-${index}`;
            return (
              <div key={faq.question} className="border-b border-hm-rule">
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="group w-full flex items-start justify-between gap-6 py-5 text-left"
                  >
                    <span className={`text-base sm:text-lg font-semibold transition-[color] duration-[var(--hm-dur-short)] ${open ? "text-hm-ink" : "text-hm-ink-2 group-hover:text-hm-ink"}`}>
                      {faq.question}
                    </span>
                    <Plus
                      aria-hidden
                      className={`mt-1 w-5 h-5 shrink-0 text-hm-muted transition-transform duration-[var(--hm-dur-med)] ease-hm-out ${open ? "rotate-45 text-hm-accent-text" : ""}`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  hidden={!open}
                  className="pb-6 pr-10 max-w-2xl text-sm leading-relaxed text-hm-ink-2"
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
