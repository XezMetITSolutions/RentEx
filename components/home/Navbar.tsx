"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "../ThemeToggle";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-all duration-300">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group shrink-0">
                        <div className="relative w-32 h-14 overflow-hidden transition-all duration-300 flex items-center">
                            {/* Assuming the logo is an image. If not, text fallback */}
                            <Image
                                src="/assets/logo.png"
                                alt="Rent-Ex Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-8 ml-8">
                        <Link href="/" className="text-sm font-medium text-gray-900 dark:text-white border-b-2 border-red-500 pb-1">
                            Home
                        </Link>
                        <Link href="/fleet" className="text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Fahrzeuge
                        </Link>
                        <Link href="/dashboard" className="text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Buchungen
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Über uns
                        </Link>
                        <Link href="/contact" className="text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Kontakt
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="hidden lg:flex items-center gap-6 ml-auto">
                        <a href="tel:+436609996800" className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Phone className="w-4 h-4 text-gray-400 dark:text-zinc-400" />
                            <span>+43 660 9996800</span>
                        </a>

                        <div className="flex items-center gap-3 border-l border-gray-200 dark:border-white/10 pl-6">
                            <ThemeToggle />
                        </div>

                        <Link
                            href="/fleet"
                            className="px-6 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all"
                        >
                            Jetzt Buchen →
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-white/5">
                    <div className="px-4 pt-2 pb-6 space-y-1">
                        <Link href="/" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">Home</Link>
                        <Link href="/fleet" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-sm font-bold text-gray-500 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">Fahrzeuge</Link>
                        <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-sm font-bold text-gray-500 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">Buchungen</Link>
                        <Link href="/about" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-sm font-bold text-gray-500 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">Über uns</Link>
                        <Link href="/contact" onClick={() => setIsOpen(false)} className="block px-3 py-3 text-sm font-bold text-gray-500 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg">Kontakt</Link>
                        
                        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-white/5 flex flex-col gap-4 px-3">
                            <a href="tel:+436609996800" className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-zinc-300">
                                <Phone className="w-4 h-4 text-red-500" /> +43 660 9996800
                            </a>
                            <Link href="/fleet" onClick={() => setIsOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-md bg-red-600 text-white text-sm font-bold">
                                Jetzt Buchen →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
