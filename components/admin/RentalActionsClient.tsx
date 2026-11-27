'use client';

import React, { useState } from 'react';
import {
    Clock,
    CheckCircle,
    XCircle,
    RotateCcw,
    Key,
    ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { updateRentalStatus } from '@/app/actions/rental-updates';
import ExtendRentalModal from './ExtendRentalModal';
import { toast } from 'sonner';

export default function RentalActionsClient({ rental }: { rental: any }) {
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [refunding, setRefunding] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    async function handleRefund() {
        const reason = window.prompt('Erstattungsgrund für Stripe / Buchhaltung (optional):') ?? '';
        if (!window.confirm(`Möchten Sie wirklich eine Stripe-Erstattung von €${Number(rental.totalAmount).toFixed(2)} an den Kunden durchführen?`)) return;
        setRefunding(true);
        try {
            const res = await fetch(`/api/admin/rentals/${rental.id}/refund`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Fehler bei der Erstattung');
            toast.success(data.message || 'Stripe-Erstattung erfolgreich durchgeführt.');
            window.location.reload();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setRefunding(false);
        }
    }

    async function handleCancel() {
        if (!window.confirm(`Reservierung #${rental.id} wirklich stornieren?`)) return;
        setIsCancelling(true);
        try {
            await updateRentalStatus(rental.id, 'Cancelled');
            toast.success('Reservierung erfolgreich storniert.');
            window.location.reload();
        } catch (err: any) {
            toast.error(err.message || 'Fehler beim Stornieren');
        } finally {
            setIsCancelling(false);
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Primary Action: Vor-Ort Übergabe / Check-in */}
            {(rental.status === 'Pending' || rental.status === 'Confirmed') && (
                <Link
                    href={`/admin/reservations/${rental.id}/check-in`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm shadow-red-600/20"
                >
                    <CheckCircle className="w-4 h-4" />
                    <span>Übergabe mit Mieter starten</span>
                </Link>
            )}

            {/* Secondary Action: Digital Self Check-in Link only as fallback/share */}
            <Link
                href={`/self-checkin/${rental.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold transition-colors"
                title="Self Check-in Vorschau öffnen"
            >
                <Key className="w-3.5 h-3.5 text-gray-500" />
                <span>Kunden-Link (Self Check-in)</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
            </Link>

            {(rental.status === 'Active' || rental.status === 'Confirmed' || rental.status === 'Pending') && (
                <button
                    onClick={() => setShowExtendModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                    <Clock className="w-3.5 h-3.5 text-hm-muted" />
                    Verlängern
                </button>
            )}

            {/* Return / Check-Out Actions */}
            {rental.status === 'Active' && (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/reservations/${rental.id}/check-out`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm shadow-emerald-600/20"
                    >
                        <CheckCircle className="w-4 h-4" />
                        <span>Rücknahme starten (Protokoll)</span>
                    </Link>
                </div>
            )}

            {rental.status !== 'Cancelled' && rental.status !== 'Completed' && (
                <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-rose-50 border border-hm-rule hover:border-rose-300 text-rose-700 font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                    <XCircle className="w-3.5 h-3.5" />
                    Stornieren
                </button>
            )}

            {rental.paymentStatus === 'Paid' && (
                <button
                    onClick={handleRefund}
                    disabled={refunding}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-purple-50 border border-hm-rule hover:border-purple-300 text-purple-700 font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    title="Online-Zahlung via Stripe zurückerstatten"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {refunding ? 'Stripe Erstattung läuft…' : 'Stripe Erstatten'}
                </button>
            )}

            {showExtendModal && (
                <ExtendRentalModal
                    rental={rental}
                    onClose={() => setShowExtendModal(false)}
                />
            )}
        </div>
    );
}
