import { getCurrentCustomer } from '@/lib/dashboardAuth';
import NoCustomer from '@/components/dashboard/NoCustomer';
import Link from 'next/link';
import { Settings, Shield, ChevronRight } from 'lucide-react';
import ChangePasswordForm from './ChangePasswordForm';
import NotificationSettings from './NotificationSettings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const customer = await getCurrentCustomer();
    if (!customer) return <NoCustomer />;

    return (
        <div className="max-w-4xl space-y-8">
            <header>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Einstellungen</h1>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">Verwalten Sie Ihre Konto- und Benachrichtigungseinstellungen.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {/* 1. Profile Link Card */}
                <Link
                    href="/dashboard/profile"
                    className="group relative flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-900"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                        <Settings className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Profil & Kontaktdaten</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Name, E-Mail, Adresse und Telefon anzeigen oder ändern.</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* 2. Notification Controls */}
                <NotificationSettings />

                {/* 3. Security Form */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Sicherheit &amp; Passwort</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Halten Sie Ihr Konto mit einem sicheren Passwort geschützt.</p>
                        </div>
                    </div>
                    <div className="max-w-md">
                        <ChangePasswordForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
