'use client';

import { useState } from 'react';
import { Mail, Ban, CheckCircle2, Key, Loader2, AlertCircle } from 'lucide-react';
import { toggleCustomerBlacklist, resetCustomerPassword } from '@/app/actions/customer-ops';

interface CustomerActionsProps {
    customer: {
        id: number;
        email: string;
        isBlacklisted: boolean;
        blacklistReason?: string | null;
    };
}

export default function CustomerActions({ customer }: CustomerActionsProps) {
    const [loading, setLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState<string | null>(null);

    async function handleToggleBlacklist() {
        const reason = customer.isBlacklisted 
            ? null 
            : window.prompt('Grund für die Sperrung (optional):', 'Verstoß gegen AGB');
        
        if (customer.isBlacklisted && !window.confirm('Kunden wirklich entsperren?')) return;
        if (!customer.isBlacklisted && reason === null) return;

        setLoading(true);
        const result = await toggleCustomerBlacklist(customer.id, reason || undefined);
        setLoading(false);

        if (!result.success) {
            alert(result.error);
        }
    }

    async function handleResetPassword() {
        if (!window.confirm('Passwort wirklich zurücksetzen? Ein temporäres Passwort wird generiert.')) return;

        setLoading(true);
        const result = await resetCustomerPassword(customer.id);
        setLoading(false);

        if (result.success) {
            setTempPassword(result.tempPassword!);
        } else {
            alert(result.error);
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            {tempPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6 text-green-600">
                            <CheckCircle2 className="w-8 h-8" />
                            <h3 className="text-xl font-bold">Passwort zurückgesetzt</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Das Passwort wurde erfolgreich geändert. Bitte teilen Sie dem Kunden das neue Passwort mit:
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl font-mono text-2xl text-center tracking-wider text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-6 select-all">
                            {tempPassword}
                        </div>
                        <button 
                            onClick={() => setTempPassword(null)}
                            className="w-full py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                        >
                            Schließen
                        </button>
                    </div>
                </div>
            )}

            <a 
                href={`mailto:${customer.email}`}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
                <Mail className="w-4 h-4" />
                Nachricht
            </a>

            <button 
                onClick={handleResetPassword}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50"
            >
                <Key className="w-4 h-4" />
                Passwort Reset
            </button>

            {!customer.isBlacklisted ? (
                <button 
                    onClick={handleToggleBlacklist}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                    Sperren
                </button>
            ) : (
                <button 
                    onClick={handleToggleBlacklist}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Entsperren
                </button>
            )}
        </div>
    );
}
