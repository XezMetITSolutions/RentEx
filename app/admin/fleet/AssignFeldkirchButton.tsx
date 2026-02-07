'use client';

import { useState } from 'react';
import { assignAllCarsToFeldkirch } from '@/app/actions/admin';
import { MapPin } from 'lucide-react';

export function AssignFeldkirchButton() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

    async function handleClick() {
        if (loading) return;
        setLoading(true);
        setMessage(null);
        try {
            const result = await assignAllCarsToFeldkirch();
            setMessage(result.ok ? { type: 'ok', text: result.message } : { type: 'err', text: result.message });
        } catch {
            setMessage({ type: 'err', text: 'Fehler beim Zuweisen.' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                type="button"
                onClick={handleClick}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-50 transition-colors"
            >
                <MapPin className="h-4 w-4" />
                {loading ? 'Wird zugewiesen…' : 'Alle Fahrzeuge → Rent-Ex Feldkirch'}
            </button>
            {message && (
                <p className={message.type === 'ok' ? 'text-sm text-green-600 dark:text-green-400' : 'text-sm text-red-600 dark:text-red-400'}>
                    {message.text}
                </p>
            )}
        </div>
    );
}
