'use client';

import { useState } from 'react';
import { triggerTestEmail } from './actions';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const TEMPLATES = [
    { id: 'bookingConfirmation', name: 'Buchungsbestätigung', desc: 'Wird versendet, wenn ein Auto über Bezahlung bei Abholung gebucht wird.' },
    { id: 'paymentConfirmation', name: 'Zahlungsbestätigung', desc: 'Wird versendet, wenn die Online-Zahlung (Stripe) erfolgreich abgeschlossen wurde.' },
    { id: 'pickupReminder', name: 'Abholerinnerung', desc: 'Erinnerungs-Mail am Tag vor der geplanten Fahrzeugabholung.' },
    { id: 'returnReminder', name: 'Rückgabeerinnerung', desc: 'Erinnerungs-Mail am Tag vor dem geplanten Mietende.' },
    { id: 'cancellationConfirmation', name: 'Stornierungsbestätigung', desc: 'Bestätigungs-Mail bei einer stornierten Buchung.' },
    { id: 'maintenanceNotification', name: 'Wartungsbenachrichtigung', desc: 'Interne Benachrichtigung über fällige Fahrzeuginspektionen.' },
    { id: 'birthdayCoupon', name: 'Geburtstags-Gutschein', desc: 'Wird an Kunden an ihrem Geburtstag versendet mit einem 10%-Rabattcode.' }
];

export default function TestEmailPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<{ [key: string]: { loading: boolean; success?: boolean; error?: string } }>({});

    const handleSend = async (templateId: string) => {
        if (!email) {
            alert('Bitte geben Sie zuerst eine E-Mail-Adresse ein!');
            return;
        }

        setStatus(prev => ({ ...prev, [templateId]: { loading: true } }));
        try {
            const res = await triggerTestEmail(email, templateId);
            if (res.success) {
                setStatus(prev => ({ ...prev, [templateId]: { loading: false, success: true } }));
            } else {
                setStatus(prev => ({ ...prev, [templateId]: { loading: false, error: res.error } }));
            }
        } catch (e) {
            setStatus(prev => ({ ...prev, [templateId]: { loading: false, error: 'Netzwerkfehler.' } }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-4">
                    <a href="/admin" className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-105 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">E-Mail Template Tester</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Testen Sie eure SMTP- und Resend-Mailverbindungen mit verschiedenen E-Mail-Vorlagen.</p>
                    </div>
                </div>

                {/* Email Input Card */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm space-y-4">
                    <h2 className="text-lg font-bold">1. Empfänger-E-Mail eingeben</h2>
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="z.B. test@beispiel.de"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-gray-900 dark:text-white focus:border-red-500 outline-none transition-all shadow-inner"
                        />
                        <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-4.5" />
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {TEMPLATES.map(t => {
                        const state = status[t.id] || {};
                        return (
                            <div key={t.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center justify-between">
                                        {t.name}
                                        {state.success && <span className="text-xs text-green-500 font-bold bg-green-500/10 px-2.5 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Gesendet</span>}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{t.desc}</p>
                                </div>

                                {state.error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] leading-relaxed flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{state.error}</span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    disabled={state.loading}
                                    onClick={() => handleSend(t.id)}
                                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white disabled:opacity-50 font-bold rounded-xl text-xs transition-all shadow-md active:scale-[0.98]"
                                >
                                    {state.loading ? 'Wird gesendet...' : 'Test-E-Mail senden'}
                                </button>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
