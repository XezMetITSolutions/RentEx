'use client';

import { useState } from 'react';
import { MapPin, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InitLocationPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleAddFeldkirch = async () => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await fetch('/api/locations/init-feldkirch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Fehler beim Hinzufügen');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/admin/locations"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück zu Standorten
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Feldkirch Standort Initialisieren</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Fügen Sie den Hauptstandort Feldkirch mit einem Klick hinzu.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-8">
                {/* Preview Card */}
                <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-600 rounded-lg">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Rent-Ex Feldkirch</h2>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">Adresse:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">Illstraße 75a, 6800 Feldkirch</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">Land:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">Österreich</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">Telefon:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">+43 5522 12345</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">E-Mail:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">feldkirch@rent-ex.at</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">Öffnungszeiten:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">Mo-Sa: 08:00 - 18:00</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">Sonntag:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">Geschlossen</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-gray-500 dark:text-gray-400 min-w-[100px]">GPS:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">47.2394, 9.5941</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="font-semibold text-green-900 dark:text-green-100">Erfolgreich hinzugefügt!</p>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Der Standort Feldkirch wurde erfolgreich zur Datenbank hinzugefügt.
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/admin/locations"
                                className="inline-flex items-center gap-2 text-sm text-green-700 dark:text-green-300 hover:underline"
                            >
                                Zu Standorten →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <div>
                                <p className="font-semibold text-red-900 dark:text-red-100">Fehler</p>
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                {!success && (
                    <button
                        onClick={handleAddFeldkirch}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Wird hinzugefügt...
                            </>
                        ) : (
                            <>
                                <MapPin className="w-5 h-5" />
                                Feldkirch Standort jetzt hinzufügen
                            </>
                        )}
                    </button>
                )}

                <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                    Das System prüft automatisch, ob der Standort bereits existiert.
                </p>
            </div>
        </div>
    );
}
