"use client";

/* Hallmark · component: login screen · genre: modern-minimal · theme: custom (brand red) · tokens.css
 * states: default · hover · focus · active · disabled · loading · error
 */
import { useState } from "react";
import Image from "next/image";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { adminLogin } from "@/app/actions/auth";

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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

    const inputClass =
        "w-full min-h-12 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper px-4 text-[15px] text-hm-ink outline-none placeholder:text-hm-muted hover:border-hm-muted focus:border-hm-ink transition-[border-color] duration-[var(--hm-dur-short)] ease-hm-out disabled:opacity-60";

    return (
        <div className="hm-home min-h-screen bg-hm-paper text-hm-ink font-hm-body grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            {/* Brand panel */}
            <div className="hidden lg:flex p-4">
                <div className="hm-stage relative flex w-full flex-col justify-between overflow-hidden rounded-[var(--hm-radius-stage)] ring-1 ring-inset ring-hm-rule dark:ring-0 p-12 text-hm-stage-ink">
                    {/* The logo's tagline is white, so it sits on a dark chip. */}
                    <div className="w-fit rounded-[var(--hm-radius-input)] bg-hm-stage-ink px-4 py-2.5">
                        <div className="relative h-11 w-32">
                            <Image src="/assets/logo.png" alt="Rent-Ex" fill priority className="object-contain" sizes="128px" />
                        </div>
                    </div>
                    <div className="relative -mr-12 aspect-[16/7]">
                        <Image
                            src="/assets/cars/Ford_Mustang_MachE_GT.png"
                            alt=""
                            fill
                            priority
                            sizes="55vw"
                            className="object-contain"
                        />
                    </div>
                    <p className="max-w-sm text-sm text-hm-stage-muted">
                        Verwaltung für Flotte, Reservierungen, Check-in und Abrechnung.
                    </p>
                </div>
            </div>

            {/* Form */}
            <main className="flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-[400px]">
                    <div className="mb-10 w-fit rounded-[var(--hm-radius-input)] bg-hm-stage-ink px-4 py-2.5 lg:hidden">
                        <div className="relative h-10 w-28">
                            <Image src="/assets/logo.png" alt="Rent-Ex" fill priority className="object-contain" sizes="112px" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight">Admin-Login</h1>
                    <p className="mt-2 text-sm text-hm-ink-2">Mit Ihrem Mitarbeiterkonto anmelden.</p>

                    {error && (
                        <div role="alert" className="mt-8 flex items-start gap-3 rounded-[var(--hm-radius-input)] border border-hm-accent/30 bg-hm-accent/10 px-4 py-3 text-sm text-hm-accent-text">
                            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label htmlFor="admin-email" className="block text-sm font-semibold">E-Mail</label>
                            <input
                                id="admin-email"
                                type="email"
                                name="email"
                                required
                                autoComplete="username"
                                autoFocus
                                disabled={loading}
                                className={`${inputClass} mt-2`}
                                placeholder="name@firma.at"
                            />
                        </div>

                        <div>
                            <label htmlFor="admin-password" className="block text-sm font-semibold">Passwort</label>
                            <div className="relative mt-2">
                                <input
                                    id="admin-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    disabled={loading}
                                    className={`${inputClass} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-[var(--hm-radius-input)] text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 transition-[background-color,color] duration-[var(--hm-dur-short)]"
                                >
                                    {showPassword ? <EyeOff aria-hidden className="h-4 w-4" /> : <Eye aria-hidden className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group mt-2 w-full min-h-12 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover active:translate-y-px text-hm-accent-ink font-semibold text-[15px] transition-[background-color,transform] duration-[var(--hm-dur-short)] ease-hm-out disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                                    Anmelden …
                                </>
                            ) : (
                                <>
                                    Anmelden
                                    <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-[var(--hm-dur-short)] ease-hm-out group-hover:translate-x-0.5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-10 text-xs text-hm-muted">
                        Zugang vergessen? Bitte an die Geschäftsleitung wenden.
                    </p>
                </div>
            </main>
        </div>
    );
}
