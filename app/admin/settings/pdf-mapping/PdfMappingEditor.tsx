'use client';

import { useState, useTransition } from 'react';
import { PdfFieldMapping } from '@/lib/pdfMapping';
import { Save, Loader2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PdfMappingEditor({ initialMapping }: { initialMapping: PdfFieldMapping[] }) {
    const [mapping, setMapping] = useState<PdfFieldMapping[]>(initialMapping);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleChange = (index: number, field: keyof PdfFieldMapping, value: string | number) => {
        const newMapping = [...mapping];
        newMapping[index] = { ...newMapping[index], [field]: value };
        setMapping(newMapping);
    };

    const handleSave = async () => {
        setStatus(null);
        startTransition(async () => {
            try {
                const res = await fetch('/api/admin/pdf-mapping', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mapping),
                });

                if (!res.ok) throw new Error('Save failed');

                setStatus({ type: 'success', message: 'Einstellungen gespeichert' });
                router.refresh();

                setTimeout(() => setStatus(null), 3000);
            } catch {
                setStatus({ type: 'error', message: 'Fehler beim Speichern' });
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3 text-sm text-amber-800 dark:text-amber-200">
                <Info className="w-5 h-5 flex-shrink-0" />
                <div>
                    <p className="font-semibold mb-1">Koordinatensystem Info</p>
                    <p>PDF Koordinaten starten unten links bei (0,0). Eine A4 Seite ist ca. 595 Punkte breit und 842 Punkte hoch.</p>
                    <p className="mt-1">Laden Sie eine PDF-Vorlage in <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">public/damage-report-template.pdf</code> hoch.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Felder zuweisen</h3>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Speichern
                    </button>
                </div>

                {status && (
                    <div className={`p-3 text-sm text-center font-medium ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {status.message}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-4 py-3">Feldname (Formular)</th>
                                <th className="px-4 py-3">Beschreibung</th>
                                <th className="px-4 py-3 w-24">X-Koord.</th>
                                <th className="px-4 py-3 w-24">Y-Koord.</th>
                                <th className="px-4 py-3 w-20">Seite</th>
                                <th className="px-4 py-3 w-20">Schrift</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {mapping.map((field, index) => (
                                <tr key={field.field} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                                    <td className="px-4 py-2 font-mono text-xs text-gray-500">{field.field}</td>
                                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{field.label}</td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            value={field.x}
                                            onChange={(e) => handleChange(index, 'x', Number(e.target.value))}
                                            className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-center"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            value={field.y}
                                            onChange={(e) => handleChange(index, 'y', Number(e.target.value))}
                                            className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-center"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            value={field.page}
                                            min={0}
                                            onChange={(e) => handleChange(index, 'page', Number(e.target.value))}
                                            className="w-12 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-center"
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            value={field.fontSize || 10}
                                            min={1}
                                            onChange={(e) => handleChange(index, 'fontSize', Number(e.target.value))}
                                            className="w-12 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-center"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
