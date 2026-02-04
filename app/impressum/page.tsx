import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function ImpressumPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-10">Impressum</h1>

                <div className="prose prose-invert prose-lg max-w-none text-gray-400 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Informationspflicht</h2>
                        <p>
                            Informationspflicht laut §5 D-Commerce Gesetz, §14 Unternehmensgesetzbuch, §63 Gewerbeordnung und Offenlegungspflicht laut §25 Mediengesetz.
                        </p>
                    </section>

                    <section className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4">RENT-EX GmbH</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <p><strong className="text-white">Adresse:</strong><br />Illstraße 75a, 6800 Feldkirch, Österreich</p>
                                <p className="mt-4"><strong className="text-white">Firmensitz:</strong><br />Reichsstraße 126 6820 Feldkirch</p>
                                <p className="mt-4"><strong className="text-white">UID-Nummer:</strong> ATU76189189</p>
                                <p><strong className="text-white">Firmenbuchnummer:</strong> FN 660833p</p>
                                <p><strong className="text-white">Firmenbuchgericht:</strong> Landesgericht Feldkirch</p>
                            </div>
                            <div>
                                <p><strong className="text-white">Kontakt:</strong><br />
                                    Tel.: 0660 999 6800<br />
                                    E-Mail: <a href="mailto:info@rent-ex.metechnik.at" className="text-red-400 hover:text-red-300">info@rent-ex.metechnik.at</a></p>

                                <p className="mt-4"><strong className="text-white">Mitglied bei:</strong> Wirtschaftskammer Vorarlberg</p>
                                <p><strong className="text-white">Berufsrecht:</strong> Gewerbeordnung: <a href="https://www.ris.bka.gv.at" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">www.ris.bka.gv.at</a></p>
                                <p><strong className="text-white">Aufsichtsbehörde:</strong> Bezirkshauptmannschaft Feldkirch</p>
                                <p><strong className="text-white">Verleihungsstaat:</strong> Österreich</p>
                                <p><strong className="text-white">Unternehmensgegenstand:</strong> Vermietung beweglicher Sachen und Güterbeförderung bis 3,5t</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Kontaktdaten des Verantwortlichen für Datenschutz</h2>
                        <p>
                            Sollten Sie Fragen zum Datenschutz haben, finden Sie nachfolgend die Kontaktdaten der verantwortlichen Person bzw. Stelle:
                        </p>
                        <p className="mt-2">
                            <strong>RENT-EX GmbH</strong><br />
                            Illstraße 75a<br />
                            6800 Feldkirch<br />
                            E-Mail-Adresse: info@rent-ex.metechnik.at<br />
                            Telefon: 0660 999 6800<br />
                            Impressum: <a href="http://rent-ex.metechnik.at/impressum/" className="text-red-400 hover:text-red-300">http://rent-ex.metechnik.at/impressum/</a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">EU-Streitschlichtung</h2>
                        <p>
                            Gemäß Verordnung über Online-Streitbeilegung in Verbraucherangelegenheiten (ODR-Verordnung) möchten wir Sie über die Online-Streitbeilegungsplattform (OS-Plattform) informieren.
                            Verbraucher haben die Möglichkeit, Beschwerden an die Online Streitbeilegungsplattform der Europäischen Kommission unter <a href="http://ec.europa.eu/odr?tid=121888682" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">http://ec.europa.eu/odr?tid=121888682</a> zu richten. Die dafür notwendigen Kontaktdaten finden Sie oberhalb in unserem Impressum.
                        </p>
                        <p className="mt-2 text-sm italic">
                            Wir möchten Sie jedoch darauf hinweisen, dass wir nicht bereit oder verpflichtet sind, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Haftung für Inhalte dieser Website</h2>
                        <p>
                            Wir entwickeln die Inhalte dieser Webseite ständig weiter und bemühen uns korrekte und aktuelle Informationen bereitzustellen. Leider können wir keine Haftung für die Korrektheit aller Inhalte auf dieser Website übernehmen, speziell für jene, die seitens Dritter bereitgestellt wurden. Als Diensteanbieter sind wir nicht verpflichtet, die von ihnen übermittelten oder gespeicherten Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                        </p>
                        <p className="mt-2">
                            Unsere Verpflichtungen zur Entfernung von Informationen oder zur Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen aufgrund von gerichtlichen oder behördlichen Anordnungen bleiben auch im Falle unserer Nichtverantwortlichkeit davon unberührt.
                        </p>
                        <p className="mt-2">
                            Sollten Ihnen problematische oder rechtswidrige Inhalte auffallen, bitte wir Sie uns umgehend zu kontaktieren, damit wir die rechtswidrigen Inhalte entfernen können. Sie finden die Kontaktdaten im Impressum.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Haftung für Links auf dieser Webseite</h2>
                        <p>
                            Unsere Webseite enthält Links zu anderen Webseiten für deren Inhalt wir nicht verantwortlich sind. Haftung für verlinkte Websites besteht für uns nicht, da wir keine Kenntnis rechtswidriger Tätigkeiten hatten und haben, uns solche Rechtswidrigkeiten auch bisher nicht aufgefallen sind und wir Links sofort entfernen würden, wenn uns Rechtswidrigkeiten bekannt werden.
                        </p>
                        <p className="mt-2">
                            Wenn Ihnen rechtswidrige Links auf unserer Website auffallen, bitte wir Sie uns zu kontaktieren. Sie finden die Kontaktdaten im Impressum.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Urheberrechtshinweis</h2>
                        <p>
                            Alle Inhalte dieser Webseite (Bilder, Fotos, Texte, Videos) unterliegen dem Urheberrecht. Bitte fragen Sie uns bevor Sie die Inhalte dieser Website verbreiten, vervielfältigen oder verwerten wie zum Beispiel auf anderen Websites erneut veröffentlichen. Falls notwendig, werden wir die unerlaubte Nutzung von Teilen der Inhalte unserer Seite rechtlich verfolgen.
                        </p>
                        <p className="mt-2">
                            Sollten Sie auf dieser Webseite Inhalte finden, die das Urheberrecht verletzen, bitten wir Sie uns zu kontaktieren.
                        </p>
                    </section>

                    <div className="border-t border-white/10 pt-4 text-xs text-gray-500">
                        Quelle: Erstellt mit dem Impressum Generator von AdSimple
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
