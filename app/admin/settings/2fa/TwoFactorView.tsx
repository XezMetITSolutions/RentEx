"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, ShieldX, Copy, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import {
    startAdmin2FASetup,
    confirmAdmin2FASetup,
    disableAdmin2FA,
} from '@/app/actions/auth';

interface Props {
    email: string;
    enabled: boolean;
    verifiedAt: string | null;
}

type SetupState =
    | { stage: 'idle' }
    | { stage: 'setup'; secret: string; qrDataUrl: string; otpauthUri: string }
    | { stage: 'codes'; backupCodes: string[] };

export default function TwoFactorView({ email, enabled, verifiedAt }: Props) {
    const [state, setState] = useState<SetupState>({ stage: 'idle' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDisable, setShowDisable] = useState(false);

    async function handleStart() {
        setLoading(true);
        setError('');
        const res = await startAdmin2FASetup();
        setLoading(false);
        if ('error' in res) {
            setError(res.error);
            return;
        }
        setState({
            stage: 'setup',
            secret: res.secret,
            qrDataUrl: res.qrDataUrl,
            otpauthUri: res.otpauthUri,
        });
    }

    async function handleConfirm(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const fd = new FormData(e.currentTarget);
        const res = await confirmAdmin2FASetup(fd);
        setLoading(false);
        if ('error' in res) {
            setError(res.error);
            return;
        }
        setState({ stage: 'codes', backupCodes: res.backupCodes });
    }

    async function handleDisable(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');
        const fd = new FormData(e.currentTarget);
        const res = await disableAdmin2FA(fd);
        setLoading(false);
        if (res.error) {
            setError(res.error);
            return;
        }
        window.location.reload();
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-black tracking-tight mb-2">Zwei-Faktor-Authentifizierung</h1>
                <p className="text-sm text-zinc-500">
                    Schützt deinen Admin-Zugang mit einem 6-stelligen Code aus einer Authenticator-App.
                </p>
            </div>

            {/* Status panel */}
            <div className={`rounded-3xl border p-6 ${enabled ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900'}`}>
                <div className="flex items-center gap-4">
                    {enabled ? (
                        <ShieldCheck className="h-8 w-8 text-emerald-600" />
                    ) : (
                        <ShieldX className="h-8 w-8 text-zinc-400" />
                    )}
                    <div className="flex-1">
                        <div className="font-bold">{enabled ? '2FA ist aktiviert' : '2FA ist nicht aktiviert'}</div>
                        <div className="text-xs text-zinc-500">
                            {enabled && verifiedAt
                                ? `Aktiviert am ${new Date(verifiedAt).toLocaleString('de-AT')}`
                                : 'Empfohlen für alle Admin-Konten.'}
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-700 dark:text-red-400 text-sm font-medium">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                </div>
            )}

            {/* Not enabled — Start Setup */}
            {!enabled && state.stage === 'idle' && (
                <button
                    onClick={handleStart}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-full transition-all flex items-center gap-2"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    2FA einrichten
                </button>
            )}

            {/* Setup stage — show QR + secret + verify input */}
            {state.stage === 'setup' && (
                <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-6">
                    <div>
                        <h2 className="font-bold text-lg mb-2">1. App scannen</h2>
                        <p className="text-sm text-zinc-500 mb-4">
                            Scanne den QR-Code mit Google Authenticator, Authy, 1Password o. ä.
                        </p>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="bg-white p-3 rounded-2xl">
                                <Image
                                    src={state.qrDataUrl}
                                    alt="2FA QR Code"
                                    width={240}
                                    height={240}
                                    unoptimized
                                />
                            </div>
                            <div className="flex-1 space-y-3 text-sm">
                                <div className="text-zinc-500">Konto:</div>
                                <div className="font-mono text-xs break-all">{email}</div>
                                <div className="text-zinc-500 mt-3">Manueller Schlüssel:</div>
                                <div className="flex items-center gap-2">
                                    <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded break-all flex-1">
                                        {state.secret}
                                    </code>
                                    <button
                                        type="button"
                                        onClick={() => navigator.clipboard.writeText(state.secret)}
                                        className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        aria-label="Kopieren"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
                        <h2 className="font-bold text-lg mb-2">2. Code bestätigen</h2>
                        <p className="text-sm text-zinc-500 mb-4">
                            Gib den 6-stelligen Code aus deiner App ein, um die Aktivierung abzuschließen.
                        </p>
                        <form onSubmit={handleConfirm} className="flex gap-3">
                            <input
                                type="text"
                                name="code"
                                required
                                inputMode="numeric"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                autoComplete="one-time-code"
                                autoFocus
                                placeholder="000000"
                                className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 font-mono text-2xl tracking-[8px] text-center outline-none focus:border-red-600"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-2xl transition-all"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aktivieren'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Codes stage — show backup codes once */}
            {state.stage === 'codes' && (
                <div className="rounded-3xl border-2 border-emerald-500/40 bg-emerald-500/5 p-6 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-6 w-6" />
                        <div className="font-bold text-lg">2FA aktiviert</div>
                    </div>
                    <div className="text-sm">
                        Speichere diese Backup-Codes an einem sicheren Ort. Jeder Code kann
                        <strong> nur einmal</strong> verwendet werden, falls du keinen Zugriff auf deine
                        Authenticator-App hast.
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
                        {state.backupCodes.map((c) => (
                            <div key={c} className="px-2 py-1">{c}</div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(state.backupCodes.join('\n'))}
                            className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 font-bold px-4 py-2 rounded-full text-sm flex items-center gap-2"
                        >
                            <Copy className="h-4 w-4" /> Alle kopieren
                        </button>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-full text-sm"
                        >
                            Fertig
                        </button>
                    </div>
                </div>
            )}

            {/* Already enabled — disable form */}
            {enabled && state.stage === 'idle' && (
                <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6">
                    {!showDisable ? (
                        <button
                            onClick={() => setShowDisable(true)}
                            className="text-red-600 hover:text-red-700 font-bold text-sm"
                        >
                            2FA deaktivieren
                        </button>
                    ) : (
                        <form onSubmit={handleDisable} className="space-y-4">
                            <div>
                                <h3 className="font-bold mb-1">2FA deaktivieren</h3>
                                <p className="text-sm text-zinc-500">
                                    Gib einen aktuellen 6-stelligen Code zur Bestätigung ein.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    name="code"
                                    required
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    autoComplete="one-time-code"
                                    placeholder="000000"
                                    className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 font-mono text-xl tracking-[6px] text-center outline-none focus:border-red-600"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-2xl"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Deaktivieren'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowDisable(false); setError(''); }}
                                    className="px-4 py-3 rounded-2xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                >
                                    Abbrechen
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
