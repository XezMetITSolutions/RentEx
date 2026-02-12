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
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Welche Dokumente und Voraussetzungen gibt es für die Anmietung?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Sie benötigen einen gültigen Führerschein, den Sie seit mindestens zwei Jahren ununterbrochen besitzen, sowie einen Personalausweis oder Reisepass. Alle Fahrer müssen uneingeschränkt fahrtüchtig sein.
                        </p>
                    </div>

                    {/* FAQ Item 2 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Wie hoch ist die Kaution und wie wird sie hinterlegt?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Die Mietsicherstellung (Kaution) wird bei Beginn des Mietverhältnisses geleistet. Dies erfolgt in der Regel durch die Autorisierung einer akzeptierten Kreditkarte. Die genaue Höhe wird vom Vermieter je nach Fahrzeugkategorie festgelegt.
                        </p>
                    </div>

                    {/* FAQ Item 3 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Darf ich mit dem Mietwagen ins Ausland fahren?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Auslandsfahrten sind ausschließlich mit schriftlicher Genehmigung des Vermieters zulässig. Bitte beachten Sie, dass in bestimmten Ländern (z.B. Italien, Polen, Türkei, Russland) die Haftungsreduzierung für Diebstahl und Einbruch ihre Wirksamkeit verliert.
                        </p>
                    </div>

                    {/* FAQ Item 4 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Wie funktioniert die Tankregelung?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Sie übernehmen das Fahrzeug vollgetankt (bzw. voll geladen) und geben es ebenso voll wieder zurück. Falls das Fahrzeug nicht vollgetankt zurückgebracht wird, berechnen wir eine Aufwandspauschale von 18,00 € inkl. MwSt. zuzüglich der Kraftstoffkosten.
                        </p>
                    </div>

                    {/* FAQ Item 5 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Darf ich mein Haustier im Fahrzeug mitnehmen?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Die Beförderung von Tieren ist nur mit ausdrücklicher Genehmigung und in geeigneten Transportbehältern gestattet. Bei Missachtung oder Verunreinigung fällt eine erhöhte Reinigungsgebühr von mindestens 78,00 € inkl. MwSt. an.
                        </p>
                    </div>

                    {/* FAQ Item 6 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Gibt es Geschwindigkeitsbegrenzungen?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Ja, zum Schutz unserer Fahrzeuge gelten folgende Limits: Lieferwagen (120 km/h), Busse (130 km/h), Kleinwagen (140 km/h) und sonstige PKW (160 km/h). Überschreitungen können zum Verlust der Haftungsreduzierung führen.
                        </p>
                    </div>

                    {/* FAQ Item 7 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Was passiert bei Mehrkilometern?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Zusätzliche Kilometer werden je nach Fahrzeugmodell mit 0,33 € bis 0,45 € pro Kilometer berechnet, sofern im Mietvertrag keine anderen Vereinbarungen getroffen wurden.
                        </p>
                    </div>

                    {/* FAQ Item 8 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Muss das Fahrzeug gereinigt zurückgegeben werden?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Ja, das Fahrzeug muss im übernommenen, sauberen Zustand zurückgegeben werden. Bei erforderlichen Reinigungsarbeiten stellen wir mindestens 58,00 € inkl. MwSt. in Rechnung.
                        </p>
                    </div>

                    {/* FAQ Item 9 */}
                    <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Was ist bei einem Unfall oder einer Panne zu tun?</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Informieren Sie umgehend den Vermieter und ziehen Sie bei jedem Schadensfall die Polizei hinzu. Fertigen Sie einen Unfallbericht an und geben Sie keine Schuldanerkenntnisse gegenüber Dritten ab.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
