'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function RootGlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[Root Global Error]', error);
    }, [error]);

    return (
        <html lang="de">
            <body className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4 font-sans">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-zinc-800 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Systemfehler
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Ein kritischer Fehler ist aufgetreten. Bitte laden Sie die Seite neu.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => reset()}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Neu laden
                        </button>
                        <Link
                            href="/"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 font-medium text-sm transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Startseite
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
