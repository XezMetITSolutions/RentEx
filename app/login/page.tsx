import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { login } from '@/app/actions/auth';
import Link from 'next/link';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string; error?: string }> }) {
    const params = await searchParams;
    const from = params.from ?? '/dashboard';
    const error = params.error;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white selection:bg-red-500/30 transition-colors">
            <Navbar />
            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="max-w-md w-full bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Anmelden</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Melden Sie sich in Ihrem Kundenkonto an.</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form action={login} className="space-y-4">
                        <input type="hidden" name="from" value={from} />
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                                placeholder="ihre@email.de"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passwort</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                        >
                            Anmelden
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Noch kein Konto?{' '}
                        <Link href="/register" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                            Jetzt registrieren
                        </Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
