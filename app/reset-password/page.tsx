import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import Link from 'next/link';
import { checkResetToken } from '@/app/actions/auth';
import { ResetPasswordForm } from '@/components/auth/PasswordResetForms';

export const metadata = { title: 'Neues Passwort', robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const { token = '' } = await searchParams;
    const valid = token ? (await checkResetToken(token)) != null : false;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white selection:bg-red-500/30 transition-colors">
            <Navbar />
            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="max-w-md w-full bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Neues Passwort</h1>
                    {valid ? (
                        <>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">Legen Sie ein neues Passwort für Ihr Kundenkonto fest.</p>
                            <ResetPasswordForm token={token} />
                        </>
                    ) : (
                        <>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Dieser Link ist abgelaufen oder wurde bereits verwendet. Links zum Zurücksetzen sind 60 Minuten gültig und funktionieren nur einmal.
                            </p>
                            <Link href="/forgot-password" className="block w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-center transition-colors">
                                Neuen Link anfordern
                            </Link>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
