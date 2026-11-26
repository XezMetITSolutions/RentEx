import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string }> }) {
    const params = await searchParams;
    const error = params.error;

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0A0A0A] text-foreground selection:bg-red-500/30">
            <Navbar />
            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="max-w-md w-full bg-white dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Registrieren</h1>
                    <p className="text-gray-650 dark:text-gray-400 mb-6">Erstellen Sie Ihr Kundenkonto.</p>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <RegisterForm email={params.email} />

                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Bereits registriert?{' '}
                        <Link href="/login" className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                            Anmelden
                        </Link>
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
