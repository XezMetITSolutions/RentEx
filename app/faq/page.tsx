import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Plus, Minus } from "lucide-react";

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Häufig gestellte Fragen</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Hier finden Sie Antworten auf die wichtigsten Fragen rund um die Anmietung bei Rent-Ex.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* FAQ Item 1 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Welche Dokumente benötige ich für die Anmietung?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Sie benötigen einen gültigen Führerschein (seit mindestens 2 Jahren), einen Personalausweis oder Reisepass sowie eine Kreditkarte für die Kaution. Bei internationalen Anmietungen kann ein internationaler Führerschein erforderlich sein.
                        </p>
                    </div>

                    {/* FAQ Item 2 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Wie hoch ist die Kaution?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Die Kautionshöhe hängt von der Fahrzeugklasse ab. Für Standardfahrzeuge beträgt sie in der Regel zwischen 500€ und 1000€. Bei Luxusfahrzeugen kann die Kaution höher ausfallen. Der Betrag wird auf Ihrer Kreditkarte reserviert und nach Rückgabe wieder freigegeben.
                        </p>
                    </div>

                    {/* FAQ Item 3 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Sind die Kilometer begrenzt?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Die meisten unserer Tarife beinhalten eine großzügige Kilometerpauschale oder sind sogar unbegrenzt. Details finden Sie in den spezifischen Mietbedingungen des gewählten Fahrzeugs.
                        </p>
                    </div>

                    {/* FAQ Item 4 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Kann ich das Fahrzeug an einem anderen Ort zurückgeben?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Ja, Einwegmieten sind gegen eine Gebühr möglich. Bitte geben Sie den gewünschten Rückgabeort bei der Buchung an, um die Verfügbarkeit und Kosten zu prüfen.
                        </p>
                    </div>

                    {/* FAQ Item 5 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Was passiert im Falle einer Panne oder eines Unfalls?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Ihre Sicherheit hat Priorität. Kontaktieren Sie bitte sofort unseren 24/7 Notfall-Support. Wir kümmern uns um Pannenhilfe, Ersatzfahrzeug und die weitere Abwicklung. Alle unsere Fahrzeuge sind vollkaskoversichert.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
