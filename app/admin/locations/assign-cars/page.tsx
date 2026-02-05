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

export default function AssignCarsToFeldkirchPage() {
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

                {/* Austrian Plate Format */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Österreichische Kennzeichen (Vorarlberg)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                            { code: 'FK', city: 'Feldkirch', color: 'blue' },
                            { code: 'BZ', city: 'Bregenz', color: 'green' },
                            { code: 'DO', city: 'Dornbirn', color: 'purple' },
                            { code: 'BL', city: 'Bludenz', color: 'orange' },
                            { code: 'FE', city: 'Feldkirch Alt.', color: 'red' },
                        ].map((plate) => (
                            <div key={plate.code} className={`bg-${plate.color}-50 dark:bg-${plate.color}-900/20 border border-${plate.color}-200 dark:border-${plate.color}-800 rounded-lg p-3 text-center`}>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{plate.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{plate.city}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Success Message */}
                {result && result.success && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-green-900 dark:text-green-100 text-lg">Erfolgreich zugewiesen!</h3>
                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                    {result.message}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Fahrzeuge aktualisiert</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{result.totalCars}</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Kennzeichen geändert</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{result.platesUpdated}</div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400">Standort</div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white truncate">{result.locationName}</div>
                            </div>
                        </div>

                        {result.updates && result.updates.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Aktualisierte Fahrzeuge:</h4>
                                <div className="bg-white dark:bg-gray-800 rounded-lg max-h-64 overflow-y-auto">
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {result.updates.map((update, index) => (
                                            <div key={index} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Car className="w-4 h-4 text-gray-400" />
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {update.brand} {update.model}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-500 dark:text-gray-400 font-mono">{update.oldPlate}</span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className="text-green-600 dark:text-green-400 font-mono font-semibold">{update.newPlate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <Link
                                href="/admin/locations"
                                className="flex-1 text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Zu Standorten
                            </Link>
                            <Link
                                href="/admin/fleet"
                                className="flex-1 text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Zur Fahrzeugflotte
                            </Link>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
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
                {!result?.success && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-6">
                        <button
                            onClick={handleAssignCars}
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Fahrzeuge werden zugewiesen...
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-6 h-6" />
                                    Alle Fahrzeuge zu Feldkirch zuweisen
                                </>
                            )}
                        </button>
                        <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                            ⚠️ Diese Aktion überschreibt bestehende Standort-Zuweisungen und Kennzeichen
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
