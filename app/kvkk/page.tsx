import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function KVKKPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-10">DSGVO-Informationstext</h1>

                <div className="prose prose-invert prose-lg max-w-none text-gray-400 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Informationspflicht laut DSGVO</h2>
                        <p>
                            Gemäß der Datenschutz-Grundverordnung (DSGVO) sind wir verpflichtet, Sie über die Verarbeitung Ihrer personenbezogenen Daten zu informieren. Dieser Text fasst die wichtigsten Punkte zusammen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Rechtsgrundlagen der Verarbeitung</h2>
                        <p>
                            Wir verarbeiten Ihre Daten auf Basis folgender Rechtsgrundlagen:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Erfüllung eines Vertrages (Art. 6 Abs. 1 lit. b DSGVO)</li>
                            <li>Erfüllung rechtlicher Verpflichtungen (Art. 6 Abs. 1 lit. c DSGVO)</li>
                            <li>Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO)</li>
                            <li>Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Speicherdauer</h2>
                        <p>
                            Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Erfüllung der oben genannten Zwecke erforderlich ist oder wie es gesetzliche Aufbewahrungsfristen vorsehen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Beschwerderecht</h2>
                        <p>
                            Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das Datenschutzrecht verstößt, haben Sie das Recht, sich bei der zuständigen Aufsichtsbehörde zu beschweren. In Österreich ist dies die Datenschutzbehörde.
                        </p>
                    </section>

                    <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10 mt-8">
                        <p className="text-sm">
                            Detaillierte Informationen finden Sie in unserer <a href="/privacy" className="text-red-500 hover:underline">Datenschutzrichtlinie</a>.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
