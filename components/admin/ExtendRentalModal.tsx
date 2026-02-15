'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Clock, Euro, X } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { extendRental } from '@/app/actions/extend-rental';

export default function ExtendRentalModal({ rental, onClose }: { rental: any, onClose: () => void }) {
    const [newDate, setNewDate] = useState(format(addDays(new Date(rental.endDate), 1), 'yyyy-MM-dd'));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const oldDate = new Date(rental.endDate);
    const selectedDate = new Date(newDate);
    const extraDays = differenceInDays(selectedDate, oldDate);
    const extraCost = extraDays > 0 ? extraDays * Number(rental.dailyRate) : 0;

    const handleExtend = async () => {
        if (extraDays <= 0) return;
        setIsSubmitting(true);
        try {
            await extendRental(rental.id, newDate, extraCost);
            onClose();
        } catch (error) {
            alert('Fehler beim Verlängern');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Miete verlängern
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-500">Neues Rückgabedatum</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                                type="date"
                                min={format(addDays(new Date(rental.endDate), 1), 'yyyy-MM-dd')}
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Zusatztage</p>
                            <p className="text-2xl font-black text-blue-900 dark:text-blue-100">+{extraDays}</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800">
                            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-1">Aufpreis</p>
                            <p className="text-2xl font-black text-green-900 dark:text-green-100">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(extraCost)}
                            </p>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl italic">
                        Hinweis: Die Verlängerung basiert auf der aktuellen Tagesrate von {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(rental.dailyRate))}.
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                        Abbrechen
                    </button>
                    <button
                        disabled={isSubmitting || extraDays <= 0}
                        onClick={handleExtend}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                        {isSubmitting ? 'Wird gespeichert...' : 'Kostenpflichtig verlängern'}
                    </button>
                </div>
            </div>
        </div>
    );
}
