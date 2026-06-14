'use client';

import { useState, useTransition } from 'react';
import { updateCustomerNotes } from '@/app/actions/customers';
import { FileText, Save, Loader2, CheckCircle2 } from 'lucide-react';

interface CustomerNotesProps {
    customerId: number;
    initialNotes: string;
}

export default function CustomerNotes({ customerId, initialNotes }: CustomerNotesProps) {
    const [notes, setNotes] = useState(initialNotes);
    const [isPending, startTransition] = useTransition();
    const [showSavedSuccess, setShowSavedSuccess] = useState(false);

    const handleSave = () => {
        startTransition(async () => {
            const res = await updateCustomerNotes(customerId, notes);
            if (res.success) {
                setShowSavedSuccess(true);
                setTimeout(() => setShowSavedSuccess(false), 3000);
            } else {
                alert(res.error || 'Fehler beim Speichern der Notizen');
            }
        });
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Interne Notizen</h3>
                </div>
                {showSavedSuccess && (
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-500 animate-fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Gespeichert
                    </span>
                )}
            </div>
            <div className="p-5">
                <textarea 
                    className="w-full h-32 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none font-medium placeholder:text-gray-400"
                    placeholder="Notizen zum Kunden hinterlassen..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <button 
                    onClick={handleSave}
                    disabled={isPending}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm shadow-blue-500/10 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Speichern...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>Speichern</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
