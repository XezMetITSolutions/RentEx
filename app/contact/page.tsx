import ContactForm from '@/components/ContactForm';
import { getCurrentCustomer } from '@/lib/dashboardAuth';
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Mail, Phone, MapPin } from "lucide-react";

export default async function ContactPage({searchParams}:{searchParams:Promise<{subject?:string}>}) {
    const [query,customer]=await Promise.all([searchParams,getCurrentCustomer()]);
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
                                        <a href="https://maps.google.com/?q=Illstraße+75a,+6800+Feldkirch" target="_blank" rel="noopener noreferrer" className="text-gray-900 dark:text-white font-medium hover:underline hover:text-red-500 transition-colors">Illstraße 75a, 6800 Feldkirch, Österreich</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <Phone className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Telefon</p>
                                        <a href="tel:+436609996800" className="text-gray-900 dark:text-white font-medium hover:underline hover:text-red-500 transition-colors">+43 660 9996800</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                                        <Mail className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">E-Mail</p>
                                        <a href="mailto:info@rent-ex.at" className="text-gray-900 dark:text-white font-medium hover:underline hover:text-red-500 transition-colors">info@rent-ex.at</a>
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
                        <ContactForm subject={query.subject || ""} firstName={customer?.firstName} lastName={customer?.lastName} email={customer?.email} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
