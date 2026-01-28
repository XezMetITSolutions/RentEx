'use client';

import {
    User,
    Bell,
    Lock,
    Globe,
    Moon,
    Smartphone,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

const sections = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'security', label: 'Sicherheit', icon: Lock },
    { id: 'appearance', label: 'Erscheinungsbild', icon: Moon },
    { id: 'language', label: 'Sprache & Region', icon: Globe },
];

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('profile');

    return (
        <div className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar Settings Nav */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <h1 className="mb-6 text-2xl font-bold text-gray-900">Einstellungen</h1>
                <nav className="space-y-1">
                    {sections.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={clsx(
                                    'flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={clsx('h-5 w-5', isActive ? 'text-blue-600' : 'text-gray-400')} />
                                    {item.label}
                                </div>
                                {isActive && <ChevronRight className="h-4 w-4 text-blue-600" />}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main Settings Content */}
            <div className="flex-1 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 lg:p-8">
                {activeSection === 'profile' && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Profilinformationen</h2>
                            <p className="text-sm text-gray-500">Aktualisieren Sie Ihre Kontoinformationen.</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                                AU
                            </div>
                            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Bild ändern
                            </button>
                        </div>

                        <form className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Vorname</label>
                                <input type="text" defaultValue="Admin" className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nachname</label>
                                <input type="text" defaultValue="User" className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input type="email" defaultValue="admin@rentex.com" className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>

                            <div className="sm:col-span-2 flex justify-end">
                                <button className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                                    Speichern
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeSection === 'appearance' && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Erscheinungsbild</h2>
                            <p className="text-sm text-gray-500">Passen Sie das Aussehen der Anwendung an.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button className="group relative rounded-xl border-2 border-blue-600 p-4 text-left hover:bg-gray-50">
                                <div className="mb-2 h-20 rounded-lg bg-gray-100 border border-gray-200"></div>
                                <span className="font-medium text-gray-900">Hell</span>
                                <div className="absolute top-4 right-4 text-blue-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </button>
                            <button className="group relative rounded-xl border-2 border-transparent p-4 text-left ring-1 ring-gray-200 hover:bg-gray-50">
                                <div className="mb-2 h-20 rounded-lg bg-gray-900 border border-gray-800"></div>
                                <span className="font-medium text-gray-900">Dunkel</span>
                            </button>
                            <button className="group relative rounded-xl border-2 border-transparent p-4 text-left ring-1 ring-gray-200 hover:bg-gray-50">
                                <div className="mb-2 h-20 rounded-lg bg-gradient-to-br from-white to-gray-900 border border-gray-200"></div>
                                <span className="font-medium text-gray-900">System</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Other sections placeholders */}
                {['notifications', 'security', 'language'].includes(activeSection) && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 rounded-full bg-gray-100 p-4">
                            <Smartphone className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">In Entwicklung</h3>
                        <p className="text-gray-500">Dieser Bereich wird bald verfügbar sein.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
