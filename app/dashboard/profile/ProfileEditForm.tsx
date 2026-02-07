'use client';

import { updateProfile } from '@/app/actions/dashboard';
import { useState } from 'react';
import { Customer } from '@prisma/client';

export default function ProfileEditForm({ customer }: { customer: Customer }) {
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setMessage(null);
        const result = await updateProfile(formData);
        if (result?.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Profil gespeichert.' });
        }
    }

    return (
        <div className="p-6 sm:p-8 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Daten bearbeiten</h3>
            {message && (
                <div
                    className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}
                >
                    {message.text}
                </div>
            )}
            <form action={handleSubmit} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Vorname *</label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            defaultValue={customer.firstName}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nachname *</label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            defaultValue={customer.lastName}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Telefon</label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={customer.phone ?? ''}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Adresse</label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        defaultValue={customer.address ?? ''}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">PLZ</label>
                        <input
                            id="postalCode"
                            name="postalCode"
                            type="text"
                            defaultValue={customer.postalCode ?? ''}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Stadt</label>
                        <input
                            id="city"
                            name="city"
                            type="text"
                            defaultValue={customer.city ?? ''}
                            className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Land</label>
                    <input
                        id="country"
                        name="country"
                        type="text"
                        defaultValue={customer.country ?? ''}
                        className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                    Speichern
                </button>
            </form>
        </div>
    );
}
