'use client';

import React, { useState } from 'react';
import { 
    Calendar, 
    Car, 
    Key, 
    ChevronDown, 
    ChevronUp
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
