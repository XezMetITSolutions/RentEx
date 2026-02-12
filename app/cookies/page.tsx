import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-10">Cookie-Richtlinie</h1>

                <div className="prose dark:prose-invert prose-lg max-w-none text-gray-600 dark:text-gray-400 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Was sind Cookies?</h2>
                        <p>
                            Cookies sind kleine Textdateien, die auf Ihrem Computer oder Mobilgerät gespeichert werden, wenn Sie eine Website besuchen. Sie helfen dabei, die Website ordnungsgemäß funktionieren zu lassen und die Benutzererfahrung zu verbessern.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Welche Cookies verwenden wir?</h2>
                        <p>
                            Wir verwenden folgende Arten von Cookies:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li>
                                <strong className="text-gray-900 dark:text-white">Notwendige Cookies:</strong> Diese sind für den Betrieb der Website unerlässlich (z.B. für den Login-Bereich oder die Buchungsabwicklung).
                            </li>
                            <li>
                                <strong className="text-gray-900 dark:text-white">Funktionale Cookies:</strong> Diese speichern Ihre Präferenzen (z.B. Spracheinstellungen), um die Nutzung komfortabler zu gestalten.
                            </li>
                            <li>
                                <strong className="text-gray-900 dark:text-white">Analyse-Cookies:</strong> Diese helfen uns zu verstehen, wie Besucher unsere Website nutzen, damit wir sie stetig verbessern können.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Verwaltung von Cookies</h2>
                        <p>
                            Sie können in Ihren Browsereinstellungen festlegen, ob Sie Cookies akzeptieren oder ablehnen möchten. Bitte beachten Sie, dass die Deaktivierung von Cookies die Funktionalität unserer Website einschränken kann.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
