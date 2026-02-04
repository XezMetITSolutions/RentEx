"use client";

import Link from "next/link";
import Image from "next/image";
import { Car, Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-zinc-950 border-t border-white/10 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand Info */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                                <Image
                                    src="/assets/logo.png"
                                    alt="Rent-Ex Logo"
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Rent-Ex GmbH
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Wir transformieren Ihr Mieterlebnis mit unserer modernen Infrastruktur und großen Fahrzeugflotte.
                            Sie sind an der richtigen Adresse für sicheres, schnelles und komfortables Fahren.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Schnelllinks</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Über uns
                                </Link>
                            </li>
                            <li>
                                <Link href="/fleet" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Fahrzeugflotte
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Dienstleistungen
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Kontakt
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Häufig gestellte Fragen
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Unternehmen</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Nutzungsbedingungen
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Datenschutzrichtlinie
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Cookie-Richtlinie
                                </Link>
                            </li>
                            <li>
                                <Link href="/kvkk" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    DSGVO-Informationstext
                                </Link>
                            </li>
                            <li>
                                <Link href="/impressum" className="text-gray-400 hover:text-red-500 transition-colors text-sm">
                                    Impressum
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Kontaktieren Sie uns</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <span className="text-gray-400 text-sm">
                                    Illstraße 75a<br />
                                    6800 Feldkirch
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-gray-400 text-sm">0660 9996800</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-gray-400 text-sm">info@rent-ex-gmbh.at</span>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Rent-Ex GmbH. Alle Rechte vorbehalten.
                    </p>
                    <div className="flex items-center gap-4">
                        {/* Payment methods placeholder icons could go here */}
                        <div className="h-6 w-10 bg-white/10 rounded"></div>
                        <div className="h-6 w-10 bg-white/10 rounded"></div>
                        <div className="h-6 w-10 bg-white/10 rounded"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
