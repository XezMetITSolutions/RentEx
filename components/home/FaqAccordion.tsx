"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

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

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 relative z-10 bg-gray-50 dark:bg-[#0a0a0a] border-y border-gray-200 dark:border-white/5 transition-colors">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="inline-block text-[10px] font-black px-3 py-1 bg-red-500/10 text-red-500 rounded-full uppercase tracking-widest border border-red-500/20">FAQ</span>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
            Häufig gestellte Fragen
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`border rounded-2xl transition-colors duration-300 shadow-sm dark:shadow-none ${
                openIndex === index ? "bg-red-50 dark:bg-[#111] border-red-500/30" : "bg-white dark:bg-[#0f0f0f] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10"
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-bold text-gray-900 dark:text-white pr-8">{faq.question}</span>
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  openIndex === index ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-zinc-400"
                }`}>
                  {openIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 pt-0 text-gray-500 dark:text-zinc-400 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
