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
            {/* Quick Link to Customer Self Check-In */}
            <Link
                href={`/self-checkin/${rental.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper-2 hover:bg-hm-paper border border-hm-rule text-hm-ink font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
                title="Kunden-Check-in-Link öffnen"
            >
                <Key className="w-3.5 h-3.5 text-hm-accent" />
                <span>Self Check-in Link</span>
                <ExternalLink className="w-3 h-3 text-hm-muted" />
            </Link>

            {(rental.status === 'Pending' || rental.status === 'Confirmed') && (
                <form action={updateRentalStatus.bind(null, rental.id, 'Active')}>
                    <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--hm-radius-input)] bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Aktivieren
                    </button>
                </form>
            )}

            {(rental.status === 'Active' || rental.status === 'Confirmed' || rental.status === 'Pending') && (
                <button
                    onClick={() => setShowExtendModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                >
                    <Clock className="w-3.5 h-3.5 text-hm-muted" />
                    Verlängern
                </button>
            )}

            {rental.status === 'Active' && (
                <div className="flex items-center gap-1.5">
                    <input
                        id={`returnMileage-${rental.id}`}
                        type="number"
                        placeholder="End-KM"
                        className="w-24 px-2.5 py-1.5 bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono font-bold text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                        defaultValue={rental.car?.currentMileage || ''}
                    />
                    <button
                        onClick={async () => {
                            const input = document.getElementById(`returnMileage-${rental.id}`) as HTMLInputElement;
                            const mileage = parseInt(input.value);
                            if (isNaN(mileage)) {
                                toast.error('Bitte gültigen Endkilometerstand eingeben.');
                                return;
                            }
                            if (rental.pickupMileage && mileage < rental.pickupMileage) {
                                toast.error(`KM-Stand kann nicht niedriger als bei Abholung (${rental.pickupMileage}) sein.`);
                                return;
                            }
                            if (confirm(`Fahrzeugrückgabe abschließen? Endkilometer: ${mileage} km`)) {
                                await updateRentalStatus(rental.id, 'Completed', mileage);
                                window.location.reload();
                            }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Rückgabe buchen
                    </button>
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
