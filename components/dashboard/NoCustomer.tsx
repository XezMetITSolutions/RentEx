import Link from 'next/link';

export default function NoCustomer() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <h2 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Keine Kundendaten gefunden</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-center">Bitte registrieren Sie sich oder legen Sie einen Kunden an.</p>
            <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Registrieren
            </Link>
        </div>
    );
}
