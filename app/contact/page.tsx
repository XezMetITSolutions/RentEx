import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Kontaktieren Sie uns</h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                        Haben Sie Fragen oder benötigen Sie Unterstützung? Wir sind für Sie da.
                        Füllen Sie das Formular aus oder erreichen Sie uns direkt über unsere Kontaktdaten.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-200 dark:border-white/10">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Kontaktinformationen</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <MapPin className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Adresse</p>
                                        <p className="text-gray-900 dark:text-white font-medium">Illstraße 75a, 6800 Feldkirch, Österreich</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <Phone className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Telefon</p>
                                        <p className="text-gray-900 dark:text-white font-medium">0660 9996800</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <Mail className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">E-Mail</p>
                                        <p className="text-gray-900 dark:text-white font-medium">info@rent-ex.at</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-200 dark:border-white/10">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Öffnungszeiten</h3>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                                <li className="flex justify-between">
                                    <span>Montag - Freitag</span>
                                    <span className="text-gray-900 dark:text-white">08:00 - 18:00</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Samstag</span>
                                    <span className="text-gray-900 dark:text-white">09:00 - 15:00</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Sonntag</span>
                                    <span className="text-gray-900 dark:text-white">Geschlossen</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 p-8 rounded-3xl border border-gray-200 dark:border-white/10">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Nachricht schreiben</h3>
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Vorname</label>
                                    <input type="text" className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Max" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nachname</label>
                                    <input type="text" className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Mustermann" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">E-Mail Adresse</label>
                                <input type="email" className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="max@beispiel.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Betreff</label>
                                <input type="text" className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Ihre Anfrage" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nachricht</label>
                                <textarea rows={4} className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Wie können wir Ihnen helfen?"></textarea>
                            </div>

                            <button type="button" className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 mt-2 flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" />
                                Nachricht senden
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
