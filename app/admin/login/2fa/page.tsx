"use client";

import { useState } from "react";
import Image from "next/image";
import { ShieldCheck, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { verifyAdmin2FA } from "@/app/actions/auth";

export default function Admin2FAPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [useBackup, setUseBackup] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        if (useBackup) formData.set("useBackup", "1");
        const result = await verifyAdmin2FA(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/cars/skoda_superb.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-50 grayscale-[0.5]"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            </div>

            <div className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center mb-10">
                    <div className="relative w-[180px] h-[60px] mb-6 drop-shadow-2xl">
                        <Image
                            src="/assets/logo.png"
                            alt="RentEx Logo"
                            fill
                            className="object-contain brightness-0 invert"
                            priority
                        />
                    </div>
                </div>

                <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-2xl">
                    <div className="mb-8 flex items-start gap-4">
                        <div className="rounded-2xl bg-red-600/20 border border-red-600/30 p-3">
                            <ShieldCheck className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white mb-1">
                                Zwei-Faktor-Code
                            </h1>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                                {useBackup ? "Backup-Code eingeben" : "Aus deiner Authenticator-App"}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm font-medium">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                                {useBackup ? "Backup-Code" : "6-stelliger Code"}
                            </label>
                            <input
                                type="text"
                                name="code"
                                required
                                autoComplete="one-time-code"
                                inputMode={useBackup ? "text" : "numeric"}
                                pattern={useBackup ? undefined : "[0-9]{6}"}
                                maxLength={useBackup ? 11 : 6}
                                autoFocus
                                className="w-full bg-transparent border-b border-white/10 py-4 px-4 text-center text-white font-mono text-2xl tracking-[8px] outline-none focus:border-red-600 transition-all placeholder:text-white/10"
                                placeholder={useBackup ? "XXXXX-XXXXX" : "000000"}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:bg-white/5 disabled:text-white/20 text-white font-black py-5 rounded-full transition-all flex items-center justify-center gap-3 overflow-hidden shadow-lg shadow-red-600/20"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="uppercase tracking-[3px] text-sm">Bestätigen</span>
                                )}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => { setUseBackup(!useBackup); setError(""); }}
                            className="w-full text-white/40 hover:text-white/70 text-xs font-bold uppercase tracking-[2px] flex items-center justify-center gap-2 transition-colors"
                        >
                            <KeyRound className="h-3 w-3" />
                            {useBackup ? "Authenticator-Code verwenden" : "Backup-Code verwenden"}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-12">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[3px]">
                        XezMet IT Solutions &copy; 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
