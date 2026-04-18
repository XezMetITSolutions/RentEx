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
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="w-full max-w-[420px] animate-in fade-in zoom-in duration-500">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-12">
                    <div className="relative w-[180px] h-[60px] mb-6">
                        <Image 
                            src="/assets/logo.png" 
                            alt="RentEx Logo" 
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="h-[2px] w-12 bg-red-600 mb-6"></div>
                    <h1 className="text-xl font-black tracking-tight text-black uppercase">
                        Admin Terminal
                    </h1>
                </div>

                {/* Login Card */}
                <div className="bg-white border-2 border-black/5 p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                    {error && (
                        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-medium">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-wider text-black/40 ml-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-black/20" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full bg-transparent border-b-2 border-black/5 py-4 pl-8 pr-4 text-black font-semibold outline-none focus:border-red-600 transition-all placeholder:text-black/10"
                                    placeholder="admin@rentex.at"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-wider text-black/40 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <Key className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-black/20" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full bg-transparent border-b-2 border-black/5 py-4 pl-8 pr-4 text-black font-semibold outline-none focus:border-red-600 transition-all placeholder:text-black/10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black hover:bg-[#E31E24] active:scale-[0.98] disabled:bg-black/10 disabled:text-black/20 text-white font-black py-5 rounded-full transition-all flex items-center justify-center gap-3 group"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span className="uppercase tracking-widest text-sm">Sign In</span>
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/40 transition-colors">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="text-center mt-12 space-y-4">
                    <p className="text-[11px] font-bold text-black/40 uppercase tracking-[2px]">
                        XezMet IT Solutions &copy; 2026
                    </p>
                    <div className="flex justify-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-black/5"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-black/5"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
