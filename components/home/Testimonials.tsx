"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  comment: string;
  rating: number;
  avatarInitials: string;
  bgGradient: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Maximilian Huber",
    role: "Geschäftsreisender",
    comment: "Hervorragender Service! Der gebuchte PKW war in makellosem Zustand, sauber und vollgetankt. Die Übergabe in Feldkirch dauerte keine 5 Minuten. Absolut empfehlenswert für alle, die Wert auf Qualität legen.",
    rating: 5,
    avatarInitials: "MH",
    bgGradient: "from-red-500/10 to-orange-500/10",
  },
  {
    id: 2,
    name: "Sabine Weber",
    role: "Umzugskunde",
    comment: "Für unseren Umzug haben wir einen Kastenwagen gemietet. Die Online-Buchung war extrem unkompliziert, der Laderaum war riesig und das Fahrzeug fuhr sich super einfach. Preis-Leistungs-Verhältnis ist top!",
    rating: 5,
    avatarInitials: "SW",
    bgGradient: "from-blue-500/10 to-indigo-500/10",
  },
  {
    id: 3,
    name: "Andreas Hofer",
    role: "Privatkunde",
    comment: "Schon mehrmals hier gemietet. Immer freundlicher Support, faire Tankregelungen und transparente Preise ohne versteckte Kosten. RentEx ist definitiv meine erste Anlaufstelle in Vorarlberg.",
    rating: 5,
    avatarInitials: "AH",
    bgGradient: "from-emerald-500/10 to-teal-500/10",
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-black border-t border-gray-100 dark:border-white/5">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-semibold tracking-wider uppercase mb-4">
            Kundenmeinungen
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Was unsere Kunden sagen
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Erfahren Sie von unseren Kunden, warum RentEx für exzellente Mobilität steht.
          </p>
        </div>

        {/* Testimonial Slider */}
        <div className="relative">
          {/* Quote Icon Background */}
          <div className="absolute -top-10 -left-6 text-gray-100 dark:text-zinc-900 pointer-events-none">
            <Quote className="w-24 h-24 rotate-180 opacity-50" />
          </div>

          <div className="min-h-[280px] sm:min-h-[240px] flex items-center">
            {testimonials.map((t, idx) => (
              <div
                key={t.id}
                className={`w-full transition-all duration-700 ease-in-out transform absolute ${
                  idx === activeIndex
                    ? "opacity-100 translate-x-0 relative z-10 scale-100"
                    : "opacity-0 translate-x-8 pointer-events-none scale-95"
                }`}
              >
                <div className={`p-8 sm:p-12 rounded-[2rem] bg-gradient-to-br ${t.bgGradient} border border-gray-100 dark:border-white/5 backdrop-blur-xl shadow-xl flex flex-col md:flex-row gap-8 items-start md:items-center`}>
                  {/* Avatar Circle */}
                  <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                    {t.avatarInitials}
                  </div>

                  <div className="flex-grow">
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium italic leading-relaxed mb-6">
                      "{t.comment}"
                    </p>

                    {/* Author */}
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">{t.name}</h4>
                      <p className="text-sm text-red-500 dark:text-red-400 font-semibold">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mt-10 px-2">
            {/* Dots indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "bg-red-500 w-8"
                      : "bg-gray-300 dark:bg-zinc-800 hover:bg-red-500/50"
                  }`}
                  aria-label={`Gehe zu Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 transition-colors active:scale-95"
                aria-label="Vorherige Bewertung"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 transition-colors active:scale-95"
                aria-label="Nächste Bewertung"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
