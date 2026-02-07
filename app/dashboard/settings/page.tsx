import { getCurrentCustomer } from '@/lib/dashboardAuth';
import NoCustomer from '@/components/dashboard/NoCustomer';
import Link from 'next/link';
import { Settings, Bell, Shield, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const customer = await getCurrentCustomer();
    if (!customer) return <NoCustomer />;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Einstellungen</h1>
                <p className="mt-1 text-zinc-600 dark:text-zinc-400">Verwalten Sie Ihre Konto- und Benachrichtigungseinstellungen.</p>
            </div>

            <div className="space-y-4">
                <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        <Settings className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Profil &amp; Kontaktdaten</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Name, E-Mail, Adresse und Telefon anzeigen oder ändern.</p>
                    </div>
                    <span className="text-zinc-400 dark:text-zinc-500">→</span>
                </Link>

                <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 opacity-90">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        <Bell className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Benachrichtigungen</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">E-Mail- und SMS-Benachrichtigungen zu Buchungen und Erinnerungen.</p>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">Demnächst</span>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 opacity-90">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        <Shield className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Sicherheit &amp; Passwort</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Passwort ändern und Anmeldeoptionen.</p>
                    </div>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">Demnächst</span>
                </div>
            </div>
        </div>
    );
}
