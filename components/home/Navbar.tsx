"use client";

import Link from "next/link";
import { Car, Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-red-500/50 transition-all duration-300">
                            <Car className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Rent-Ex GmbH
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
                        >
                            Startseite
                        </Link>
                        <Link
                            href="/fleet"
                            className="text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
                        >
                            Fahrzeugflotte
                        </Link>
                        <Link
                            href="/about"
                            className="text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
                        >
                            Über uns
                        </Link>
                        <Link
                            href="/contact"
                            className="text-sm font-medium text-gray-300 hover:text-red-400 transition-colors"
                        >
                            Kontakt
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle />
                        <Link
                            href="/login"
                            className="text-sm font-medium text-white hover:text-red-400 transition-colors"
                        >
                            Anmelden
                        </Link>
                        <Link
                            href="/register"
                            className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-red-600/20"
                        >
                            Registrieren
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        <Link
                            href="/"
                            className="block px-3 py-4 text-base font-medium text-white hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-red-500 transition-all"
                        >
                            Startseite
                        </Link>
                        <Link
                            href="/fleet"
                            className="block px-3 py-4 text-base font-medium text-gray-300 hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-red-500 transition-all"
                        >
                            Fahrzeugflotte
                        </Link>
                        <Link
                            href="/about"
                            className="block px-3 py-4 text-base font-medium text-gray-300 hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-red-500 transition-all"
                        >
                            Über uns
                        </Link>
                        <Link
                            href="/contact"
                            className="block px-3 py-4 text-base font-medium text-gray-300 hover:bg-white/5 rounded-lg border-l-2 border-transparent hover:border-red-500 transition-all"
                        >
                            Kontakt
                        </Link>
                        <div className="pt-4 mt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                            <Link
                                href="/login"
                                className="flex items-center justify-center px-4 py-3 rounded-lg bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
                            >
                                Anmelden
                            </Link>
                            <Link
                                href="/register"
                                className="flex items-center justify-center px-4 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-all"
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
