'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, CheckCircle2 } from 'lucide-react';

export default function NotificationSettings() {
    const [settings, setSettings] = useState({
        emailBooking: true,
        emailPromo: false,
        smsReminder: true,
        pushUpdates: true,
    });

    const [saved, setSaved] = useState(false);

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <Bell className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Benachrichtigungen</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Verwalten Sie, wie wir Sie kontaktieren.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-zinc-400" />
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Buchungsbestätigungen per E-Mail</p>
                            <p className="text-xs text-zinc-500">Wichtig für Ihre Unterlagen</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => toggle('emailBooking')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.emailBooking ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailBooking ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-zinc-400" />
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Angebote & News per E-Mail</p>
                            <p className="text-xs text-zinc-500">Exklusive Rabatte für Business-Kunden</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => toggle('emailPromo')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.emailPromo ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailPromo ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-zinc-400" />
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">SMS-Erinnerungen</p>
                            <p className="text-xs text-zinc-500">Vor Mietbeginn und Rückgabe</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => toggle('smsReminder')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.smsReminder ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.smsReminder ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
                <button 
                    onClick={handleSave}
                    className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                    Speichern
                </button>
                {saved && (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-left-2 duration-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Einstellungen gespeichert
                    </span>
                )}
            </div>
        </div>
    );
}
