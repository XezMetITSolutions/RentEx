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
        <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-[#0a0a0a]">
            {/* Background Image with Advanced Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/luxury-bg.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[460px] animate-in fade-in zoom-in-95 duration-1000 ease-out">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-12">
                    <div className="relative w-[200px] h-[70px] mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <Image 
                            src="/assets/logo.png" 
                            alt="RentEx Logo" 
                            fill
                            className="object-contain brightness-0 invert"
                            priority
                        />
                    </div>
                </div>

                {/* Login Card - Ultra Glassmorphism */}
                <div className="relative group">
                    {/* Subtle Glow behind the card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-transparent rounded-[42px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <div className="relative bg-white/[0.03] backdrop-blur-[32px] border border-white/10 p-10 rounded-[40px] shadow-2xl overflow-hidden">
                        {/* Inner corner highlight */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        
                        <div className="mb-10 text-center">
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                                Admin Access
                            </h1>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                                Secure Control Center
                            </p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs font-semibold animate-shake">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-7">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">
                                    Operator ID / Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-medium outline-none focus:bg-white/10 focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:text-white/10"
                                        placeholder="admin@rent-ex.at"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">
                                    Access Key
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-medium outline-none focus:bg-white/10 focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10 transition-all placeholder:text-white/10"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative group/btn h-[64px] bg-red-600 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-black opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                                    
                                    <div className="relative flex items-center justify-center gap-3">
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                                        ) : (
                                            <>
                                                <span className="text-white font-bold uppercase tracking-[0.2em] text-xs">Enter Portal</span>
                                                <div className="w-6 h-[1px] bg-white/30"></div>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                {/* Footer Section */}
                <div className="text-center mt-12">
                    <p className="text-[10px] font-medium text-white/5 uppercase tracking-[0.4em]">
                        RentEx &copy; 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
