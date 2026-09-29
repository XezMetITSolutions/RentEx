'use client';

import { cancelReservation } from '@/app/actions/dashboard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** `fee`/`paidAmount` come from the server (AGB cancellation fee, lib/cancellationFee.ts). */
export default function CancelReservationButton({ rentalId, fee, paidAmount }: { rentalId: number; fee: number; paidAmount: number }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    async function handleClick() {
        const eur = (v: number) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(v);
        const refund = Math.max(0, paidAmount - fee);
        const details = paidAmount > 0
            ? `\n\nGemäß AGB fällt eine Stornogebühr von ${eur(fee)} an. Sie erhalten ${eur(refund)} zurück.`
            : `\n\nGemäß AGB fällt eine Stornogebühr von ${eur(fee)} an.`;
        if (!confirm(`Reservierung wirklich stornieren?${details}`)) return;
        setLoading(true);
        setMessage(null);
        const formData = new FormData();
        formData.set('rentalId', String(rentalId));
        const result = await cancelReservation(formData);
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
