'use client';

import React, { useState } from 'react';
import {
    Clock,
    CheckCircle,
    XCircle,
    PenTool,
    RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { updateRentalStatus } from '@/app/actions/rental-updates';
import ExtendRentalModal from './ExtendRentalModal';
import { toast } from 'sonner';

export default function RentalActionsClient({ rental }: { rental: any }) {
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [refunding, setRefunding] = useState(false);

    async function handleRefund() {
        const reason = window.prompt('Erstattungsgrund (optional):') ?? '';
        if (!window.confirm(`Wirklich eine Erstattung von €${Number(rental.totalAmount).toFixed(2)} durchführen?`)) return;
        setRefunding(true);
        try {
            const res = await fetch(`/api/admin/rentals/${rental.id}/refund`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Fehler');
            toast.success(data.message || 'Erstattung erfolgreich.');
            window.location.reload();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setRefunding(false);
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            {rental.status === 'Pending' && (
                <>
                    <Link
                        href={`/admin/reservations/${rental.id}/check-in`}
                        className="flex items-center gap-2 bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-zinc-900/10"
                    >
                        <PenTool className="w-4 h-4" />
                        Digitaler Check-In
                    </Link>
                    <form action={updateRentalStatus.bind(null, rental.id, 'Active')}>
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
                            <CheckCircle className="w-4 h-4" />
                            Direkt Aktivieren
                        </button>
                    </form>
                </>
            )}

            {(rental.status === 'Active' || rental.status === 'Pending') && (
                <button
                    onClick={() => setShowExtendModal(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                >
                    <Clock className="w-4 h-4" />
                    Verlängern
                </button>
            )}

            {rental.status === 'Active' && (
                <div className="flex gap-2">
                    <input
                        id={`returnMileage-${rental.id}`}
                        type="number"
                        placeholder="KM-Stand"
                        className="w-24 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-green-500"
                        defaultValue={rental.returnMileage || rental.car.currentMileage}
                    />
                    <button
                        onClick={async () => {
                            const input = document.getElementById(`returnMileage-${rental.id}`) as HTMLInputElement;
                            const mileage = parseInt(input.value);
                            if (isNaN(mileage)) {
                                toast.error('Bitte gültigen KM-Stand eingeben.');
                                return;
                            }
                            if (mileage < rental.pickupMileage) {
                                toast.error(`KM-Stand kann nicht niedriger als bei Abholung (${rental.pickupMileage}) sein.`);
                                return;
                            }
                            if (confirm(`Miete abschließen? KM-Stand: ${mileage}`)) {
                                await updateRentalStatus(rental.id, 'Completed', mileage);
                            }
                        }}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-green-500/10"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Abschließen
                    </button>
                </div>
            )}

            {rental.status !== 'Cancelled' && rental.status !== 'Completed' && (
                <form action={updateRentalStatus.bind(null, rental.id, 'Cancelled')}>
                    <button className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                        <XCircle className="w-4 h-4" />
                        Stornieren
                    </button>
                </form>
            )}

            {rental.paymentStatus === 'Paid' && (
                <button
                    onClick={handleRefund}
                    disabled={refunding}
                    className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-purple-200 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                    <RotateCcw className="w-4 h-4" />
                    {refunding ? 'Wird erstattet…' : 'Erstatten'}
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
