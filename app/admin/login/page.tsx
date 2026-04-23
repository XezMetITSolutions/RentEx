"use client";

import { useState } from "react";
import Image from "next/image";
import { Key, Mail, AlertCircle, Loader2 } from "lucide-react";
import { adminLogin } from "@/app/actions/auth";

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        const formData = new FormData(e.currentTarget);
        const result = await adminLogin(formData);
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
        // If login is successful, redirect is handled by the server action
        // No catch block needed here as Next.js handles redirects via throw
    }


    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-black">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2500"
                    alt="Background"
                    fill
                    className="object-cover opacity-50 grayscale-[0.5]"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Logo & Welcome */}
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

                {/* Login Card - Glassmorphism style */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/10 p-10 rounded-[40px] shadow-2xl">
                    <div className="mb-8">
                        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
                            Willkommen zurÃ¼ck
                        </h1>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                            Admin-Portal Anmeldung
                        </p>
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
                                E-Mail Adresse
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-red-600 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full bg-transparent border-b border-white/10 py-4 pl-10 pr-4 text-white font-medium outline-none focus:border-red-600 transition-all placeholder:text-white/10"
                                    placeholder="name@rent-ex.at"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-white/40 ml-1">
                                Passwort
                            </label>
                            <div className="relative group">
                                <Key className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-red-600 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full bg-transparent border-b border-white/10 py-4 pl-10 pr-4 text-white font-medium outline-none focus:border-red-600 transition-all placeholder:text-white/10"
                                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                />
                            </div>
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:bg-white/5 disabled:text-white/20 text-white font-black py-5 rounded-full transition-all flex items-center justify-center gap-3 overflow-hidden shadow-lg shadow-red-600/20"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="uppercase tracking-[3px] text-sm">Anmelden</span>
                                )}
                            </button>
                        </div>
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
