'use client';

import { cancelReservation } from '@/app/actions/dashboard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CancelReservationButton({ rentalId, quote }: { rentalId: number; quote: {fee:number;refund:number;outstanding:number} }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    async function handleClick() {
        if (!confirm(`Kostenpflichtig stornieren? Stornokosten: €${quote.fee.toFixed(2)}. Erstattung: €${quote.refund.toFixed(2)}. Noch offen: €${quote.outstanding.toFixed(2)}.`)) return;
        setLoading(true);
        setMessage(null);
        const formData = new FormData();
        formData.set('rentalId', String(rentalId));
        formData.set('acceptedFee', String(quote.fee));
        let result;
        try { result = await cancelReservation(formData); } catch { setMessage("Stornierung fehlgeschlagen. Bitte erneut versuchen."); setLoading(false); return; }
        setLoading(false);
        if (result?.error) {
            setMessage(result.error);
        } else {
            router.push('/dashboard/rentals');
            router.refresh();
        }
    }

    return (
        <div>
            <p className="mb-3 text-sm">AGB §7: Stornokosten <strong>€{quote.fee.toFixed(2)}</strong> · Erstattung €{quote.refund.toFixed(2)} · Noch offen €{quote.outstanding.toFixed(2)}. Online-Stornierung nur vor Mietbeginn.</p>
            {message && (
                <p className="mb-3 text-sm text-red-600 dark:text-red-400">{message}</p>
            )}
            <button
                type="button"
                onClick={handleClick}
                disabled={loading}
                className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
            >
                {loading ? 'Wird storniert...' : 'Reservierung stornieren'}
            </button>
        </div>
    );
}
