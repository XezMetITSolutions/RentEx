"use client";

import Link from "next/link";
import Image from "next/image";
import { Car, Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gray-100 dark:bg-zinc-950 border-t border-gray-200 dark:border-white/10 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand Info */}
                    <div>
                        <Link href="/" title="Zur Startseite" className="flex items-center gap-2 mb-6">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                                <Image
                                    src="/assets/logo.png"
                                    alt="Rent-Ex Logo"
                                    title="Rent-Ex Logo"
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                Rent-Ex GmbH
                            </span>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                            Wir transformieren Ihr Mieterlebnis mit unserer modernen Infrastruktur und großen Fahrzeugflotte.
                            Sie sind an der richtigen Adresse für sicheres, schnelles und komfortables Fahren.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/p/Rent_ex-100076092493354/" target="_blank" rel="noopener noreferrer" title="Besuchen Sie uns auf Facebook" className="w-10 h-10 rounded-lg bg-white shadow-sm dark:bg-white/5 dark:shadow-none flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white transition-all" aria-label="Facebook">
                                <Facebook className="w-5 h-5" />
                                <span className="sr-only">Facebook</span>
                            </a>
                            <a href="https://www.instagram.com/rent_ex/" target="_blank" rel="noopener noreferrer" title="Besuchen Sie uns auf Instagram" className="w-10 h-10 rounded-lg bg-white shadow-sm dark:bg-white/5 dark:shadow-none flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-red-500 hover:text-white transition-all" aria-label="Instagram">
                                <Instagram className="w-5 h-5" />
                                <span className="sr-only">Instagram</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <div className="text-gray-900 dark:text-white font-semibold mb-6">Schnelllinks</div>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/about" title="Über uns" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Über uns
                                </Link>
                            </li>
                            <li>
                                <Link href="/fleet" title="Fahrzeugflotte" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Fahrzeugflotte
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" title="Dienstleistungen" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Dienstleistungen
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" title="Kontakt" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Kontakt
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" title="Häufig gestellte Fragen" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Häufig gestellte Fragen
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <div className="text-gray-900 dark:text-white font-semibold mb-6">Unternehmen</div>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/terms" title="Nutzungsbedingungen" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Nutzungsbedingungen
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" title="Datenschutzrichtlinie" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Datenschutzrichtlinie
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" title="Cookie-Richtlinie" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Cookie-Richtlinie
                                </Link>
                            </li>
                            <li>
                                <Link href="/dsgvo" title="DSGVO-Informationstext" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    DSGVO-Informationstext
                                </Link>
                            </li>
                            <li>
                                <Link href="/impressum" title="Impressum" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Impressum
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <div className="text-gray-900 dark:text-white font-semibold mb-6">Kontaktieren Sie uns</div>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <span className="text-gray-600 dark:text-gray-400 text-sm">
                                    Illstraße 75a<br />
                                    6800 Feldkirch
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-red-500 shrink-0" />
                                <a href="tel:+436609996800" title="Rufen Sie uns an unter +43 660 9996800" className="text-gray-600 dark:text-gray-400 text-sm hover:underline hover:text-red-500 transition-colors">+43 660 9996800</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-red-500 shrink-0" />
                                <a href="mailto:info@rent-ex.at" title="Schreiben Sie uns eine E-Mail an info@rent-ex.at" className="text-gray-600 dark:text-gray-400 text-sm hover:underline hover:text-red-500 transition-colors">info@rent-ex.at</a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Rent-Ex GmbH. Alle Rechte vorbehalten.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-500 text-sm font-medium">Visa | Mastercard | SEPA</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
