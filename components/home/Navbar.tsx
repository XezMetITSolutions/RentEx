"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/45 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-28 h-12 overflow-hidden transition-all duration-300">
                            <Image
                                src="/assets/logo.png"
                                alt="Rent-Ex Logo"
                                fill
                                className="object-contain dark:brightness-110"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/"
                            className="text-xs tracking-wider uppercase font-extrabold text-gray-700 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            Startseite
                        </Link>
                        <Link
                            href="/fleet"
                            className="text-xs tracking-wider uppercase font-extrabold text-gray-700 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            Fahrzeugflotte
                        </Link>
                        <Link
                            href="/about"
                            className="text-xs tracking-wider uppercase font-extrabold text-gray-700 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            Über uns
                        </Link>
                        <Link
                            href="/contact"
                            className="text-xs tracking-wider uppercase font-extrabold text-gray-700 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            Kontakt
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        <a href="tel:+493012345678" className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            <Phone className="w-4 h-4 text-red-500" />
                            <span>+49 30 123 456 78</span>
                        </a>

                        <ThemeToggle />

                        <Link
                            href="/login"
                            className="text-xs tracking-wider uppercase font-extrabold text-gray-950 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            Anmelden
                        </Link>
                        <Link
                            href="/register"
                            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs tracking-wider uppercase font-extrabold transition-all hover:shadow-lg hover:shadow-red-600/20 active:scale-[0.97]"
                        >
                            Registrieren
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 dark:bg-black/90 backdrop-blur-2xl border-b border-gray-200/50 dark:border-white/5">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-4 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-red-500 transition-all"
                        >
                            Startseite
                        </Link>
                        <Link
                            href="/fleet"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-4 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-red-500 transition-all"
                        >
                            Fahrzeugflotte
                        </Link>
                        <Link
                            href="/about"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-4 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-red-500 transition-all"
                        >
                            Über uns
                        </Link>
                        <Link
                            href="/contact"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-4 text-sm font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-red-500 transition-all"
                        >
                            Kontakt
                        </Link>
                        <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-white/5 grid grid-cols-2 gap-4">
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center px-4 py-3.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                            >
                                Anmelden
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center px-4 py-3.5 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all"
                            >
                                Registrieren
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
