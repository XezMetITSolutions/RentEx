'use client';

import React, { useState } from 'react';
import {
    Clock,
    CheckCircle,
    XCircle,
    PenTool
} from 'lucide-react';
import Link from 'next/link';
import { updateRentalStatus } from '@/app/actions/rental-updates';
import ExtendRentalModal from './ExtendRentalModal';

export default function RentalActionsClient({ rental }: { rental: any }) {
    const [showExtendModal, setShowExtendModal] = useState(false);

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
                <form action={updateRentalStatus.bind(null, rental.id, 'Completed')}>
                    <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
                        <CheckCircle className="w-4 h-4" />
                        Abschließen
                    </button>
                </form>
            )}

            {rental.status !== 'Cancelled' && rental.status !== 'Completed' && (
                <form action={updateRentalStatus.bind(null, rental.id, 'Cancelled')}>
                    <button className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                        <XCircle className="w-4 h-4" />
                        Stornieren
                    </button>
                </form>
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
