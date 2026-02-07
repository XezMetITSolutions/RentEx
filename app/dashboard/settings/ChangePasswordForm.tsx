'use client';

import { changePassword } from '@/app/actions/auth';
import { useState } from 'react';

export default function ChangePasswordForm() {
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setMessage(null);
        const result = await changePassword(formData);
        if (result?.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            setMessage({ type: 'success', text: 'Passwort wurde geändert.' });
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 mt-4">
            {message && (
                <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {message.text}
                </p>
            )}
            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Aktuelles Passwort</label>
                <input name="currentPassword" type="password" required className="w-full max-w-sm px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
            </div>
            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Neues Passwort (min. 6 Zeichen)</label>
                <input name="newPassword" type="password" required minLength={6} className="w-full max-w-sm px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
            </div>
            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Neues Passwort bestätigen</label>
                <input name="confirmPassword" type="password" required minLength={6} className="w-full max-w-sm px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
            </div>
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Passwort ändern
            </button>
        </form>
    );
}
