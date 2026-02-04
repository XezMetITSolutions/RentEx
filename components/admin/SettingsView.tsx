'use client';

import {
    User,
    Bell,
    Lock,
    Globe,
    Moon,
    Smartphone,
    CheckCircle2,
    ChevronRight,
    Save,
    Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useTransition } from 'react';
import { updateSystemSetting } from '@/app/actions';

const sections = [
    { id: 'profile', label: 'Profil', icon: User },
    // { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    // { id: 'security', label: 'Sicherheit', icon: Lock },
    { id: 'appearance', label: 'Erscheinungsbild', icon: Moon },
    // { id: 'language', label: 'Sprache & Region', icon: Globe },
];

interface SettingsViewProps {
    initialSettings: Record<string, string>;
}

export default function SettingsView({ initialSettings }: SettingsViewProps) {
    const [activeSection, setActiveSection] = useState('profile');
    const [settings, setSettings] = useState(initialSettings);
    const [isPending, startTransition] = useTransition();

    const handleSave = (key: string, value: string) => {
        startTransition(async () => {
            const result = await updateSystemSetting(key, value);
            if (result.success) {
                setSettings(prev => ({ ...prev, [key]: value }));
                // Opsiyonel: Başarı mesajı göster
            } else {
                alert('Fehler beim Speichern');
            }
        });
    };

    const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            await updateSystemSetting('admin_firstname', formData.get('firstname') as string);
            await updateSystemSetting('admin_lastname', formData.get('lastname') as string);
            await updateSystemSetting('admin_email', formData.get('email') as string);

            // State'i güncelle
            setSettings(prev => ({
                ...prev,
                admin_firstname: formData.get('firstname') as string,
                admin_lastname: formData.get('lastname') as string,
                admin_email: formData.get('email') as string,
            }));

            alert('Profil erfolgreich gespeichert!');
        });
    };

    return (
        <div className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar Settings Nav */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Einstellungen</h1>
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
                                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={clsx('h-5 w-5', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400')} />
                                    {item.label}
                                </div>
                                {isActive && <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main Settings Content */}
            <div className="flex-1 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 lg:p-8">
                {activeSection === 'profile' && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profilinformationen</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Aktualisieren Sie Ihre Kontoinformationen.</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold">
                                {settings['admin_firstname']?.[0] || 'A'}{settings['admin_lastname']?.[0] || 'U'}
                            </div>
                            <button
                                onClick={() => alert('Bild-Upload ist noch in Entwicklung')}
                                className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Bild ändern
                            </button>
                        </div>

                        <form onSubmit={handleProfileSubmit} className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vorname</label>
                                <input
                                    type="text"
                                    name="firstname"
                                    defaultValue={settings['admin_firstname'] || 'Admin'}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nachname</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    defaultValue={settings['admin_lastname'] || 'User'}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    defaultValue={settings['admin_email'] || 'admin@rentex.com'}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:text-white"
                                />
                            </div>

                            <div className="sm:col-span-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Speichern
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeSection === 'appearance' && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Erscheinungsbild</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Passen Sie das Aussehen der Anwendung an.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button className="group relative rounded-xl border-2 border-transparent p-4 text-left ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className="mb-2 h-20 rounded-lg bg-gray-100 border border-gray-200"></div>
                                <span className="font-medium text-gray-900 dark:text-white">Hell</span>
                            </button>
                            <button className="group relative rounded-xl border-2 border-transparent p-4 text-left ring-1 ring-gray-200 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className="mb-2 h-20 rounded-lg bg-gray-900 border border-gray-800"></div>
                                <span className="font-medium text-gray-900 dark:text-white">Dunkel</span>
                            </button>
                            <button className="group relative rounded-xl border-2 border-blue-600 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className="mb-2 h-20 rounded-lg bg-gradient-to-br from-white to-gray-900 border border-gray-200"></div>
                                <span className="font-medium text-gray-900 dark:text-white">System</span>
                                <div className="absolute top-4 right-4 text-blue-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
