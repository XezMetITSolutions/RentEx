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

interface GoogleReview {
    author_name: string;
    rating: number;
    text: string;
    relative_time_description: string;
    profile_photo_url?: string;
}

interface HomeTrustAndStepsProps {
    reviewsData?: {
        rating: number;
        user_ratings_total: number;
        reviews: GoogleReview[];
        placeId: string;
    };
}

export default function HomeTrustAndSteps({ reviewsData }: HomeTrustAndStepsProps) {
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

    const rating = reviewsData?.rating || 4.9;
    const userRatingsTotal = reviewsData?.user_ratings_total || 48;
    const reviews = reviewsData?.reviews || [];
    const placeId = reviewsData?.placeId || "ChIJ6846wQ7an0cRAG_XyP8y-d4";

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
                <div className="text-center space-y-4 mb-10">
                    <span className="text-xs font-black tracking-widest text-red-500 uppercase">Kundenbewertungen</span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Was sagen unsere Kunden?
                    </h2>
                </div>

                {/* Google Rating Summary Box */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 p-6 bg-gray-50/50 dark:bg-zinc-900/40 rounded-3xl border border-gray-100 dark:border-zinc-800/80 max-w-2xl mx-auto shadow-sm">
                    <div className="flex items-center gap-3 shrink-0">
                        <svg className="w-8 h-8" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-wider">Google</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-zinc-800 hidden sm:block" />
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{Number(rating).toFixed(1)}</span>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => {
                                    const isFull = i < Math.round(rating);
                                    return (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${isFull ? "fill-yellow-500 text-yellow-500" : "text-gray-300 dark:text-zinc-700"}`}
                                        />
                                    );
                                })}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">Basierend auf {userRatingsTotal} Google-Rezensionen</span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-zinc-800 hidden sm:block" />
                    <a
                        href={`https://search.google.com/local/writereview?placeid=${placeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-full border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-850 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-red-500/30 transition-all flex items-center gap-2"
                    >
                        Rezension schreiben
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.slice(0, 6).map((t, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-zinc-900/30 p-8 rounded-3xl border border-gray-100 dark:border-zinc-800/50 flex flex-col justify-between hover:border-red-500/20 hover:shadow-lg transition-all duration-300 relative group overflow-hidden">
                            {/* Google Icon Badge in corner */}
                            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none">
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-1">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    ))}
                                </div>
                                <div className="relative">
                                    <Quote className="w-10 h-10 text-gray-200 dark:text-zinc-850 absolute -top-4 -left-2 -z-10" />
                                    <p className="text-gray-600 dark:text-zinc-300 text-sm italic leading-relaxed relative z-10">{t.text}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800/80">
                                {t.profile_photo_url ? (
                                    <img 
                                        src={t.profile_photo_url} 
                                        alt={t.author_name} 
                                        className="w-10 h-10 rounded-full object-cover"
                                        referrerPolicy="no-referrer" 
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-sm">
                                        {t.author_name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{t.author_name}</h4>
                                    <p className="text-xs text-gray-500">{t.relative_time_description}</p>
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
