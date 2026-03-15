"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield, Key, Mail, AlertCircle, Loader2 } from "lucide-react";
import { adminLogin } from "@/app/actions/auth";

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        const formData = new FormData(e.currentTarget);
        try {
            const result = await adminLogin(formData);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
        } catch (e) {
            setError("Ein Fehler ist aufgetreten.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600/10 mb-4 border border-red-600/20 shadow-lg shadow-red-600/5">
                        <Shield className="h-8 w-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">RentEx Administration</h1>
                    <p className="text-slate-400 mt-2">Mitarbeiter-Anmeldung</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">E-Mail</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full bg-black/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                    placeholder="name@rentex.at"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Passwort</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full bg-black/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Anmelden"
                            )}
                        </button>
                    </form>
                </div>
                
                <p className="text-center mt-8 text-slate-500 text-sm">
                    Sollten Sie Probleme beim Login haben, wenden Sie sich bitte an die IT-Abteilung.
                </p>
            </div>
        </div>
    );
}
