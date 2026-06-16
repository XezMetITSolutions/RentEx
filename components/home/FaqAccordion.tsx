"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Wie hoch ist die Kaution?",
    answer: "Die Höhe der Kaution hängt vom Fahrzeugtyp ab. Für Standardfahrzeuge beträgt sie in der Regel 500€, für Luxusfahrzeuge bis zu 1.500€. Die Kaution wird auf Ihrer Kreditkarte blockiert und nach schadenfreier Rückgabe sofort freigegeben."
  },
  {
    question: "Gibt es ein Mindestalter für die Anmietung?",
    answer: "Ja, das Mindestalter für Standardfahrzeuge beträgt 21 Jahre (mit mindestens 1 Jahr Führerscheinbesitz). Für Premium- und Luxusfahrzeuge liegt das Mindestalter bei 25 Jahren."
  },
  {
    question: "Gibt es eine Kilometerbegrenzung?",
    answer: "Standardmäßig sind 250 Freikilometer pro Tag inklusive. Sie können bei der Buchung gegen einen Aufpreis auch unbegrenzte Kilometer oder zusätzliche Kilometerpakete auswählen."
  },
  {
    question: "Welche Zahlungsmethoden werden akzeptiert?",
    answer: "Wir akzeptieren alle gängigen Kreditkarten (Visa, MasterCard, American Express) sowie Debitkarten. Bei Firmenkunden ist nach vorheriger Prüfung auch eine Zahlung auf Rechnung möglich."
  }
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 relative z-10 bg-[#0a0a0a] border-y border-white/5">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <span className="inline-block text-[10px] font-black px-3 py-1 bg-red-500/10 text-red-500 rounded-full uppercase tracking-widest border border-red-500/20">FAQ</span>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white">
            Häufig gestellte Fragen
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`border rounded-2xl transition-colors duration-300 ${
                openIndex === index ? "bg-[#111] border-red-500/30" : "bg-[#0f0f0f] border-white/5 hover:border-white/10"
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-bold text-white pr-8">{faq.question}</span>
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  openIndex === index ? "bg-red-500 text-white" : "bg-white/5 text-zinc-400"
                }`}>
                  {openIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 pt-0 text-zinc-400 text-sm leading-relaxed">
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
