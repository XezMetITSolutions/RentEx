'use client';

import React, { useState } from 'react';
import { 
    Calendar, 
    Car, 
    Key, 
    Star, 
    ChevronDown, 
    ChevronUp,
    Quote
} from 'lucide-react';

export default function HomeTrustAndSteps() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const steps = [
        {
            icon: <Car className="w-8 h-8 text-red-500" />,
            title: "1. Fahrzeug wählen",
            desc: "Filtern Sie ganz einfach aus unserer großen Flotte den passenden Pkw oder Transporter heraus."
        },
        {
            icon: <Calendar className="w-8 h-8 text-red-500" />,
            title: "2. Zeitraum festlegen",
            desc: "Wählen Sie Abhol- und Rückgabedatum und fügen Sie die gewünschten Zusatzpakete und Versicherungen hinzu."
        },
        {
            icon: <Key className="w-8 h-8 text-red-500" />,
            title: "3. Fahrzeug abholen",
            desc: "Schließen Sie Ihre sichere Online-Zahlung ab und holen Sie Ihr Fahrzeug schnell an der gewählten Station ab."
        }
    ];

    const testimonials = [
        {
            name: "Maximilian Müller",
            role: "Geschäftsmann",
            text: "Ich habe einen Fiat Ducato an der Station Feldkirch gemietet. Mein Umzug verlief absolut reibungslos! Das Fahrzeug war sauber, die Übergabe dauerte nur 5 Minuten. Sehr zu empfehlen.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
        },
        {
            name: "Sarah Lindt",
            role: "Reisende",
            text: "Wir haben einen Ford Mustang für ein Wochenendausflug gemietet. Die Preise waren sehr fair und der Kundenservice super freundlich. Das Online-Zahlungssystem funktioniert tadellos.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
        },
        {
            name: "Alexander K.",
            role: "Stammkunde",
            text: "Ich nutze Rent-Ex regelmäßig für meine Geschäftsreisen. Die Fahrzeuge sind hervorragend gewartet und moderne Modelle. Der Abrechnungsprozess und die Transparenz sind top.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80"
        }
    ];

    const faqs = [
        {
            q: "Was sind das Mindestalter und die Führerscheinanforderungen?",
            a: "Das Mindestalter für Pkw beträgt 21 Jahre mit mindestens einem Jahr Führerscheinbesitz. Für Luxusfahrzeuge oder große Nutzfahrzeuge kann diese Grenze bei 25 Jahren und mindestens 3 Jahren Führerscheinbesitz liegen."
        },
        {
            q: "Wird bei der Anmietung eine Kaution verlangt?",
            a: "Ja, bei jeder Anmietung wird eine Kaution (Sicherheitsleistung) auf Ihrer Karte blockiert. Die Höhe hängt vom Fahrzeug ab. Nach schadensfreier Rückgabe des Fahrzeugs wird dieser Betrag sofort wieder freigegeben."
        },
        {
            q: "Wie funktioniert die Kraftstoffregelung?",
            a: "Rent-Ex arbeitet standardmäßig mit der Regelung 'Voll/Voll'. Sie erhalten das Fahrzeug vollgetankt und geben es ebenfalls vollgetankt wieder zurück."
        },
        {
            q: "Kann ich meine Reservierung stornieren oder ändern?",
            a: "Ja, bei einer Stornierung bis zu 24 Stunden vor der geplanten Abholung erhalten Sie eine 100%ige Rückerstattung ohne Abzüge. Für Änderungswünsche kontaktieren Sie bitte unseren Support."
        }
    ];

    return (
        <div className="space-y-32 py-20 bg-white dark:bg-black">
            
            {/* 1. HOW IT WORKS SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                    <span className="text-xs font-black tracking-widest text-red-500 uppercase">Einfachheit</span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Wie kann ich mieten?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-sm">
                        In 3 einfachen Schritten Ihr Wunschfahrzeug reservieren und losfahren.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-zinc-900/40 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800/80 hover:border-red-500/20 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
                            <div className="mb-6 inline-block p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-700/50">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. TESTIMONIALS SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                    <span className="text-xs font-black tracking-widest text-red-500 uppercase">Kundenbewertungen</span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Was sagen unsere Kunden?
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-zinc-900/30 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800/50 flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex items-center gap-1">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>
                                <div className="relative">
                                    <Quote className="w-10 h-10 text-gray-200 dark:text-zinc-800 absolute -top-4 -left-2 -z-10" />
                                    <p className="text-gray-600 dark:text-zinc-300 text-sm italic leading-relaxed relative z-10">{t.text}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800/80">
                                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</h4>
                                    <p className="text-xs text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. FAQ SECTION */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-4 mb-16">
                    <span className="text-xs font-black tracking-widest text-red-500 uppercase">Support</span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Häufig gestellte Fragen
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                            <div key={idx} className="bg-gray-50 dark:bg-zinc-900/30 border border-gray-100 dark:border-zinc-800/80 rounded-2xl overflow-hidden transition-all">
                                <button
                                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                                    className="w-full flex items-center justify-between p-6 text-left font-bold text-gray-900 dark:text-white focus:outline-none hover:text-red-500 transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    {isOpen ? <ChevronUp className="w-5 h-5 text-red-500" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {isOpen && (
                                    <div className="p-6 pt-0 border-t border-gray-100 dark:border-zinc-800/40 text-sm text-gray-500 dark:text-zinc-400 leading-relaxed animate-in fade-in slide-in-from-top-1">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

        </div>
    );
}
