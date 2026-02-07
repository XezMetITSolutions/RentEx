'use client';

import { createCoupon } from '@/app/actions/admin';
import { useActionState } from 'react';
import Link from 'next/link';

type FormState = { error?: string } | null;

export default function CouponForm() {
    const [state, formAction] = useActionState<FormState, FormData>(
        async (_: FormState, formData: FormData) => {
            return await createCoupon(formData);
        },
        null
    );

    return (
        <form action={formAction} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            {state?.error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{state.error}</p>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gutscheincode *</label>
                <input name="code" type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white font-mono uppercase" placeholder="z.B. SOMMER2025" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
                <input name="description" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="z.B. 10 % im Sommer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rabattart</label>
                    <select name="discountType" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                        <option value="PERCENTAGE">Prozent (%)</option>
                        <option value="FIXED_AMOUNT">Fester Betrag (€)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rabattwert *</label>
                    <input name="discountValue" type="number" required min={0} step={0.01} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="10 oder 25.00" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gültig von</label>
                    <input name="validFrom" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gültig bis</label>
                    <input name="validUntil" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max. Nutzungen (leer = unbegrenzt)</label>
                <input name="usageLimit" type="number" min={1} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="100" />
            </div>
            <div className="flex items-center gap-2">
                <input id="isActive" name="isActive" type="checkbox" defaultChecked className="rounded border-gray-300 dark:border-gray-600 text-red-600 focus:ring-red-500" />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Aktiv (sofort einlösbar)</label>
            </div>
            <div className="pt-4 flex gap-3">
                <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
                    Gutschein erstellen
                </button>
                <Link href="/admin/marketing" className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Abbrechen
                </Link>
            </div>
        </form>
    );
}
