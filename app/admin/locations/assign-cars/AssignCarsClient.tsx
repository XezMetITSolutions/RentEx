'use client';

import { useState } from 'react';
import { Car, MapPin, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AssignmentResult {
    success: boolean;
    message?: string;
    totalCars?: number;
    platesUpdated?: number;
    locationName?: string;
    updates?: Array<{
        brand: string;
        model: string;
        oldPlate: string;
        newPlate: string;
    }>;
}

export default function AssignCarsClient() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AssignmentResult | null>(null);
    const [error, setError] = useState('');

    const handleAssignCars = async () => {
        if (!confirm('Möchten Sie wirklich ALLE Fahrzeuge dem Feldkirch-Standort zuweisen und die Kennzeichen aktualisieren?')) {
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/locations/assign-to-feldkirch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Fehler beim Zuweisen der Fahrzeuge');
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/admin/locations"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Zurück zu Standorten
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fahrzeuge zu Feldkirch zuweisen</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Weisen Sie alle vorhandenen Fahrzeuge dem Feldkirch-Standort zu und aktualisieren Sie die Kennzeichen auf österreichisches Format.
                </p>
            </div>

            <div className="space-y-6">
                {/* Info Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                        <Car className="w-5 h-5" />
                        Was macht diese Funktion?
                    </h2>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                        <li className="flex items-start gap-2">
                            <span>📍</span>
                            <span>Weist alle aktiven Fahrzeuge dem Feldkirch-Standort als aktuellen und Heimatstandort zu</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>🇦🇹</span>
                            <span>Aktualisiert Kennzeichen auf österreichisches Format (FK, BZ, DO, BL, FE)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>✅</span>
                            <span>Stellt sicher, dass alle Kennzeichen eindeutig sind</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>📝</span>
                            <span>Format: <code className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded">FK 1234 AB</code></span>
                        </li>
                    </ul>
                </div>

                {/* Action Box */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Aktion ausführen</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        Klicken Sie auf den Button unten, um den Zuweisungsprozess zu starten. Dies kann einige Sekunden dauern.
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-xl space-y-4">
                            <div className="flex items-center gap-3 font-semibold">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                {result.message || 'Fahrzeuge erfolgreich zugewiesen!'}
                            </div>
                            <div className="text-sm space-y-1 opacity-90">
                                <p>Standort: <span className="font-semibold">{result.locationName}</span></p>
                                <p>Zugeordnete Fahrzeuge: <span className="font-semibold">{result.totalCars}</span></p>
                                <p>Aktualisierte Kennzeichen: <span className="font-semibold">{result.platesUpdated}</span></p>
                            </div>
                            {result.updates && result.updates.length > 0 && (
                                <div className="mt-4 border-t border-green-200 dark:border-green-800 pt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-2">Aktualisierungsdetails:</p>
                                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-2">
                                        {result.updates.map((up, idx) => (
                                            <div key={idx} className="text-xs flex justify-between bg-white/50 dark:bg-black/20 p-2 rounded">
                                                <span>{up.brand} {up.model}</span>
                                                <span className="font-mono">{up.oldPlate} ➔ {up.newPlate}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleAssignCars}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 w-full justify-center md:w-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Zuweisung läuft...
                            </>
                        ) : (
                            <>
                                <MapPin className="w-5 h-5" />
                                Alle Fahrzeuge zuweisen
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
