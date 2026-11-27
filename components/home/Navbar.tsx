"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, User, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
    const desktopLink = (href: string) =>
        isActive(href)
            ? "text-sm font-medium text-gray-900 dark:text-white border-b-2 border-red-500 pb-1"
            : "text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors";
    const mobileLink = (href: string) =>
        `block px-3 py-3 text-sm font-bold hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg ${isActive(href) ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-zinc-300"}`;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-all duration-300">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" title="Zur Startseite" className="flex items-center gap-2 group shrink-0">
                        <div className="relative w-32 h-14 overflow-hidden transition-all duration-300 flex items-center">
                            <Image
                                src="/assets/logo.png"
                                alt="Rent-Ex Logo"
                                title="Rent-Ex Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-8 ml-8">
                        <Link href="/" title="Startseite" className={desktopLink("/")}>
                            Startseite
                        </Link>
                        <Link href="/fleet" title="Unsere Fahrzeugflotte ansehen" className={desktopLink("/fleet")}>
                            Fahrzeuge
                        </Link>
                        <Link href="/dashboard" title="Ihre Buchungen verwalten" className={desktopLink("/dashboard")}>
                            Buchungen
                        </Link>
                        <Link href="/about" title="Erfahren Sie mehr über uns" className={desktopLink("/about")}>
                            Über uns
                        </Link>
                        <Link href="/contact" title="Kontaktieren Sie uns" className={desktopLink("/contact")}>
                            Kontakt
                        </Link>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-5 ml-auto">
                        <a href="tel:+436609996800" title="Rufen Sie uns an unter +43 660 9996800" className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Phone className="w-4 h-4 text-gray-400 dark:text-zinc-400" />
                            <span>+43 660 9996800</span>
                        </a>

                        <div className="flex items-center gap-2 border-l border-gray-200 dark:border-white/10 pl-5">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/60"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Anmelden</span>
                            </Link>

                            <Link
                                href="/register"
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 dark:text-zinc-200 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/60"
                            >
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Registrieren</span>
                            </Link>
                        </div>

                        <ThemeToggle />

                        <Link
                            href="/fleet"
                            title="Jetzt ein Fahrzeug online buchen"
                            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm shadow-red-600/20"
                        >
                            Jetzt Buchen →
                        </Link>
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex lg:hidden items-center gap-2">
                        <Link
                            href="/login"
                            className="p-2 text-gray-700 dark:text-zinc-200 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800/60"
                            title="Anmelden"
                        >
                            <User className="w-5 h-5" />
                        </Link>
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            aria-label="Menü öffnen"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/5 animate-in slide-in-from-top-2 duration-200">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        <Link href="/" title="Startseite" onClick={() => setIsOpen(false)} className={mobileLink("/")}>Startseite</Link>
                        <Link href="/fleet" title="Unsere Fahrzeugflotte ansehen" onClick={() => setIsOpen(false)} className={mobileLink("/fleet")}>Fahrzeuge</Link>
                        <Link href="/dashboard" title="Ihre Buchungen verwalten" onClick={() => setIsOpen(false)} className={mobileLink("/dashboard")}>Meine Buchungen</Link>
                        <Link href="/about" title="Erfahren Sie mehr über uns" onClick={() => setIsOpen(false)} className={mobileLink("/about")}>Über uns</Link>
                        <Link href="/contact" title="Kontaktieren Sie uns" onClick={() => setIsOpen(false)} className={mobileLink("/contact")}>Kontakt</Link>
                        
                        {/* Mobile Auth Links */}
                        <div className="pt-4 mt-3 border-t border-gray-200 dark:border-white/5 grid grid-cols-2 gap-2">
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                            >
                                <LogIn className="w-3.5 h-3.5 text-red-600" />
                                Anmelden
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs font-bold text-gray-800 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                            >
                                <UserPlus className="w-3.5 h-3.5 text-red-600" />
                                Registrieren
                            </Link>
                        </div>

                        <div className="pt-3 flex flex-col gap-3">
                            <a href="tel:+436609996800" title="Rufen Sie uns an unter +43 660 9996800" className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-zinc-300">
                                <Phone className="w-4 h-4 text-red-500" /> +43 660 9996800
                            </a>
                            <Link href="/fleet" title="Jetzt ein Fahrzeug online buchen" onClick={() => setIsOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm shadow-red-600/20">
                                Jetzt Buchen →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
