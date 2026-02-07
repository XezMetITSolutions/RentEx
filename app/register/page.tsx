import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { register } from '@/app/actions/auth';
import Link from 'next/link';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const params = await searchParams;
    const error = params.error;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />
            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="max-w-md w-full bg-zinc-900/50 p-8 rounded-3xl border border-white/10">
                    <h1 className="text-3xl font-bold mb-2 text-white">Registrieren</h1>
                    <p className="text-gray-400 mb-6">Erstellen Sie Ihr Kundenkonto.</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form action={register} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">Vorname *</label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Max"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">Nachname *</label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Mustermann"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">E-Mail *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="ihre@email.de"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Telefon</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="+43 660 1234567"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Passwort * (min. 6 Zeichen)</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-zinc-500 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                        >
                            Konto erstellen
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Bereits registriert?{' '}
                        <Link href="/login" className="text-red-400 hover:text-red-300 font-medium">
                            Anmelden
                        </Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
