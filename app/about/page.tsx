import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { CheckCircle2 } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Über Uns</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                        Rent-Ex GmbH ist Ihr zuverlässiger Partner für Premium-Autovermietung in Feldkirch und Umgebung.
                        Unsere Mission ist es, Ihnen nicht nur ein Auto, sondern ein Erlebnis zu bieten.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-3xl p-8 border border-gray-200 dark:border-white/10 h-full flex flex-col justify-center">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Unsere Vision</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Wir streben danach, die Autovermietung so einfach, transparent und angenehm wie möglich zu gestalten.
                            Mit modernster Technologie und einem Fokus auf Kundenzufriedenheit setzen wir neue Standards in der Branche.
                            Qualität, Sicherheit und Komfort stehen bei uns an erster Stelle.
                        </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-3xl p-8 border border-gray-200 dark:border-white/10 h-full flex flex-col justify-center">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Warum Rent-Ex?</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-red-500 mt-1" />
                                <span className="text-gray-600 dark:text-gray-400">Junge, top-gepflegte Fahrzeugflotte</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-red-500 mt-1" />
                                <span className="text-gray-600 dark:text-gray-400">Transparente Preise ohne versteckte Kosten</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-red-500 mt-1" />
                                <span className="text-gray-600 dark:text-gray-400">24/7 Notfall-Support für Ihre Sicherheit</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-red-500 mt-1" />
                                <span className="text-gray-600 dark:text-gray-400">Flexible Abhol- und Rückgabeoptionen</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
