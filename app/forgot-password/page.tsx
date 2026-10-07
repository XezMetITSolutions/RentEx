import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/PasswordResetForms';

export const metadata = { title: 'Passwort vergessen', robots: { index: false } };

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white selection:bg-red-500/30 transition-colors">
            <Navbar />
            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="max-w-md w-full bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Passwort vergessen</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Geben Sie Ihre E-Mail-Adresse ein. Wir schicken Ihnen einen Link, mit dem Sie ein neues Passwort festlegen.
                        Das funktioniert auch, wenn Sie bisher ohne Passwort gebucht haben.
                    </p>
                    <ForgotPasswordForm />
                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        <Link href="/login" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                            Zurück zur Anmeldung
                        </Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
