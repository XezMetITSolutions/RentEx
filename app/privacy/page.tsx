import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Datenschutzerklärung</h1>
                <p className="text-gray-400 mb-10">Stand: Januar 2026</p>

                <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-12">

                    {/* Einleitung */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Einleitung und Überblick</h2>
                        <p>
                            Wir haben diese Datenschutzerklärung (Fassung 27.11.2021-111888685) verfasst, um Ihnen gemäß der Vorgaben der Datenschutz-Grundverordnung (EU) 2016/679 und anwendbaren nationalen Gesetzen zu erklären, welche personenbezogenen Daten (kurz Daten) wir als Verantwortliche – und die von uns beauftragten Auftragsverarbeiter (z. B. Provider) – verarbeiten, zukünftig verarbeiten werden und welche rechtmäßigen Möglichkeiten Sie haben. Die verwendeten Begriffe sind geschlechtsneutral zu verstehen.
                            <br /><strong>Kurz gesagt:</strong> Wir informieren Sie umfassend über Daten, die wir über Sie verarbeiten.
                        </p>
                        <p>
                            Datenschutzerklärungen klingen für gewöhnlich sehr technisch und verwenden juristische Fachbegriffe. Diese Datenschutzerklärung soll Ihnen hingegen die wichtigsten Dinge so einfach und transparent wie möglich beschreiben. Soweit es der Transparenz förderlich ist, werden technische Begriffe leserfreundlich erklärt, Links zu weiterführenden Informationen geboten und Grafiken zum Einsatz gebracht. Wir informieren damit in klarer und einfacher Sprache, dass wir im Rahmen unserer Geschäftstätigkeiten nur dann personenbezogene Daten verarbeiten, wenn eine entsprechende gesetzliche Grundlage gegeben ist. Das ist sicher nicht möglich, wenn man möglichst knappe, unklare und juristisch-technische Erklärungen abgibt, so wie sie im Internet oft Standard sind, wenn es um Datenschutz geht. Ich hoffe, Sie finden die folgenden Erläuterungen interessant und informativ und vielleicht ist die eine oder andere Information dabei, die Sie noch nicht kannten.
                        </p>
                        <p>
                            Wenn trotzdem Fragen bleiben, möchten wir Sie bitten, sich an die unten bzw. im Impressum genannte verantwortliche Stelle zu wenden, den vorhandenen Links zu folgen und sich weitere Informationen auf Drittseiten anzusehen. Unsere Kontaktdaten finden Sie selbstverständlich auch im Impressum.
                        </p>
                    </section>

                    {/* Anwendungsbereich */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Anwendungsbereich</h2>
                        <p>
                            Diese Datenschutzerklärung gilt für alle von uns im Unternehmen verarbeiteten personenbezogenen Daten und für alle personenbezogenen Daten, die von uns beauftragte Firmen (Auftragsverarbeiter) verarbeiten. Mit personenbezogenen Daten meinen wir Informationen im Sinne des Art. 4 Nr. 1 DSGVO wie zum Beispiel Name, E-Mail-Adresse und postalische Anschrift einer Person. Die Verarbeitung personenbezogener Daten sorgt dafür, dass wir unsere Dienstleistungen und Produkte anbieten und abrechnen können, sei es online oder offline. Der Anwendungsbereich dieser Datenschutzerklärung umfasst:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>alle Onlineauftritte (Websites, Onlineshops), die wir betreiben</li>
                            <li>Social Media Auftritte und E-Mail-Kommunikation</li>
                            <li>mobile Apps für Smartphones und andere Geräte</li>
                        </ul>
                        <p>
                            <strong>Kurz gesagt:</strong> Die Datenschutzerklärung gilt für alle Bereiche, in denen personenbezogene Daten im Unternehmen über die genannten Kanäle strukturiert verarbeitet werden. Sollten wir außerhalb dieser Kanäle mit Ihnen in Rechtsbeziehungen eintreten, werden wir Sie gegebenenfalls gesondert informieren.
                        </p>
                    </section>

                    {/* Rechtsgrundlagen */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Rechtsgrundlagen</h2>
                        <p>
                            In der folgenden Datenschutzerklärung geben wir Ihnen transparente Informationen zu den rechtlichen Grundsätzen und Vorschriften, also den Rechtsgrundlagen der Datenschutz-Grundverordnung, die uns ermöglichen, personenbezogene Daten zu verarbeiten.
                            Was das EU-Recht betrifft, beziehen wir uns auf die VERORDNUNG (EU) 2016/679 DES EUROPÄISCHEN PARLAMENTS UND DES RATES vom 27. April 2016. Diese Datenschutz-Grundverordnung der EU können Sie selbstverständlich online auf EUR-Lex, dem Zugang zum EU-Recht, unter <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=celex%3A32016R0679" target="_blank" className="text-red-400 hover:text-red-300">https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=celex%3A32016R0679</a> nachlesen.
                        </p>
                        <p>Wir verarbeiten Ihre Daten nur, wenn mindestens eine der folgenden Bedingungen zutrifft:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Einwilligung (Artikel 6 Absatz 1 lit. a DSGVO):</strong> Sie haben uns Ihre Einwilligung gegeben, Daten zu einem bestimmten Zweck zu verarbeiten. Ein Beispiel wäre die Speicherung Ihrer eingegebenen Daten eines Kontaktformulars.</li>
                            <li><strong>Vertrag (Artikel 6 Absatz 1 lit. b DSGVO):</strong> Um einen Vertrag oder vorvertragliche Verpflichtungen mit Ihnen zu erfüllen, verarbeiten wir Ihre Daten. Wenn wir zum Beispiel einen Kaufvertrag mit Ihnen abschließen, benötigen wir vorab personenbezogene Informationen.</li>
                            <li><strong>Rechtliche Verpflichtung (Artikel 6 Absatz 1 lit. c DSGVO):</strong> Wenn wir einer rechtlichen Verpflichtung unterliegen, verarbeiten wir Ihre Daten. Zum Beispiel sind wir gesetzlich verpflichtet Rechnungen für die Buchhaltung aufzuheben. Diese enthalten in der Regel personenbezogene Daten.</li>
                            <li><strong>Berechtigte Interessen (Artikel 6 Absatz 1 lit. f DSGVO):</strong> Im Falle berechtigter Interessen, die Ihre Grundrechte nicht einschränken, behalten wir uns die Verarbeitung personenbezogener Daten vor. Wir müssen zum Beispiel gewisse Daten verarbeiten, um unsere Website sicher und wirtschaftlich effizient betreiben zu können. Diese Verarbeitung ist somit ein berechtigtes Interesse.</li>
                        </ul>
                        <p>
                            Zusätzlich zu der EU-Verordnung gelten auch noch nationale Gesetze:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>In Österreich ist dies das Bundesgesetz zum Schutz natürlicher Personen bei der Verarbeitung personenbezogener Daten (Datenschutzgesetz), kurz <strong>DSG</strong>.</li>
                            <li>In Deutschland gilt das Bundesdatenschutzgesetz, kurz <strong>BDSG</strong>.</li>
                        </ul>
                    </section>

                    {/* Kontaktdaten */}
                    <section className="bg-zinc-900/50 p-6 rounded-2xl border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">Kontaktdaten des Verantwortlichen</h2>
                        <p>Sollten Sie Fragen zum Datenschutz haben, finden Sie nachfolgend die Kontaktdaten der verantwortlichen Person bzw. Stelle:</p>
                        <p className="mt-4">
                            <strong>RENT-EX GmbH</strong><br />
                            Reichsstraße 126<br />
                            6800 Feldkirch<br />
                            Österreich
                        </p>
                        <p className="mt-2">
                            <strong>E-Mail:</strong> <a href="mailto:info@rent-ex.metechnik.at" className="text-red-400">info@rent-ex.metechnik.at</a><br />
                            <strong>Telefon:</strong> 0660 999 6800<br />
                            <strong>Impressum:</strong> <Link href="/impressum" className="text-red-400">http://rent-ex.metechnik.at/impressum/</Link>
                        </p>
                    </section>

                    {/* Speicherdauer */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Speicherdauer</h2>
                        <p>
                            Dass wir personenbezogene Daten nur so lange speichern, wie es für die Bereitstellung unserer Dienstleistungen und Produkte unbedingt notwendig ist, gilt als generelles Kriterium bei uns. Das bedeutet, dass wir personenbezogene Daten löschen, sobald der Grund für die Datenverarbeitung nicht mehr vorhanden ist. In einigen Fällen sind wir gesetzlich dazu verpflichtet, bestimmte Daten auch nach Wegfall des ursprüngliches Zwecks zu speichern, zum Beispiel zu Zwecken der Buchführung.
                        </p>
                        <p>
                            Sollten Sie die Löschung Ihrer Daten wünschen oder die Einwilligung zur Datenverarbeitung widerrufen, werden die Daten so rasch wie möglich und soweit keine Pflicht zur Speicherung besteht, gelöscht.
                        </p>
                    </section>

                    {/* Rechte */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Rechte laut Datenschutz-Grundverordnung</h2>
                        <p>Laut Artikel 13 DSGVO stehen Ihnen die folgenden Rechte zu, damit es zu einer fairen und transparenten Verarbeitung von Daten kommt:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Sie haben laut Artikel 15 DSGVO ein Auskunftsrecht darüber, ob wir Daten von Ihnen verarbeiten.</li>
                            <li>Sie haben laut Artikel 16 DSGVO ein Recht auf Berichtigung der Daten, was bedeutet, dass wir Daten richtig stellen müssen, falls Sie Fehler finden.</li>
                            <li>Sie haben laut Artikel 17 DSGVO das Recht auf Löschung („Recht auf Vergessenwerden“).</li>
                            <li>Sie haben laut Artikel 18 DSGVO das Recht auf Einschränkung der Verarbeitung.</li>
                            <li>Sie haben laut Artikel 19 DSGVO das Recht auf Datenübertragbarkeit.</li>
                            <li>Sie haben laut Artikel 21 DSGVO ein Widerspruchsrecht.</li>
                            <li>Sie haben laut Artikel 22 DSGVO unter Umständen das Recht, nicht einer ausschließlich auf einer automatisierten Verarbeitung beruhenden Entscheidung unterworfen zu werden.</li>
                        </ul>
                        <p className="mt-4"><strong>Kurz gesagt:</strong> Sie haben Rechte – zögern Sie nicht, die oben gelistete verantwortliche Stelle bei uns zu kontaktieren!</p>

                        <div className="mt-8 bg-zinc-900/50 p-6 rounded-2xl border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-2">Zuständige Aufsichtsbehörde</h3>
                            <p>Österreich Datenschutzbehörde<br />Leiterin: Mag. Dr. Andrea Jelinek</p>
                            <p className="mt-2">Adresse: Barichgasse 40-42, 1030 Wien</p>
                            <p>Telefonnr.: +43 1 52 152-0</p>
                            <p>E-Mail: <a href="mailto:dsb@dsb.gv.at" className="text-red-400">dsb@dsb.gv.at</a></p>
                            <p>Website: <a href="https://www.dsb.gv.at/" target="_blank" className="text-red-400">https://www.dsb.gv.at/</a></p>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Cookies</h2>
                        <div className="bg-zinc-900/30 p-4 rounded-xl mb-4 border-l-4 border-red-500">
                            <p><strong>Cookies Zusammenfassung</strong></p>
                            <ul className="list-none space-y-1 mt-2 text-sm">
                                <li>👥 <strong>Betroffene:</strong> Besucher der Website</li>
                                <li>🤝 <strong>Zweck:</strong> abhängig vom jeweiligen Cookie.</li>
                                <li>📓 <strong>Verarbeitete Daten:</strong> Abhängig vom jeweils eingesetzten Cookie.</li>
                                <li>📅 <strong>Speicherdauer:</strong> abhängig vom jeweiligen Cookie, kann von Stunden bis hin zu Jahren variieren</li>
                                <li>⚖️ <strong>Rechtsgrundlagen:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung), Art. 6 Abs. 1 lit.f DSGVO (Berechtigte Interessen)</li>
                            </ul>
                        </div>
                        <p>
                            Unsere Website verwendet HTTP-Cookies, um nutzerspezifische Daten zu speichern. Cookies sind kleine Text-Dateien, die von unserer Website auf Ihrem Computer gespeichert werden.
                        </p>

                        <h3 className="text-xl font-bold text-white mt-6 mb-2">Welche Arten von Cookies gibt es?</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Unerlässliche Cookies:</strong> Diese Cookies sind nötig, um grundlegende Funktionen der Website sicherzustellen.</li>
                            <li><strong>Zweckmäßige Cookies:</strong> Diese Cookies sammeln Infos über das Userverhalten.</li>
                            <li><strong>Zielorientierte Cookies:</strong> Diese Cookies sorgen für eine bessere Nutzerfreundlichkeit.</li>
                            <li><strong>Werbe-Cookies:</strong> Diese Cookies dienen dazu dem User individuell angepasste Werbung zu liefern.</li>
                        </ul>

                        <h3 className="text-xl font-bold text-white mt-6 mb-2">Widerspruchsrecht – wie kann ich Cookies löschen?</h3>
                        <p>
                            Wie und ob Sie Cookies verwenden wollen, entscheiden Sie selbst. Unabhängig von welchem Service oder welcher Website die Cookies stammen, haben Sie immer die Möglichkeit Cookies zu löschen, zu deaktivieren oder nur teilweise zuzulassen.
                        </p>
                    </section>

                    {/* Webhosting */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Webhosting</h2>
                        <div className="bg-zinc-900/30 p-4 rounded-xl mb-4 border-l-4 border-red-500">
                            <p><strong>Webhosting Zusammenfassung</strong></p>
                            <ul className="list-none space-y-1 mt-2 text-sm">
                                <li>👥 <strong>Betroffene:</strong> Besucher der Website</li>
                                <li>🤝 <strong>Zweck:</strong> professionelles Hosting der Website und Absicherung des Betriebs</li>
                                <li>📓 <strong>Verarbeitete Daten:</strong> IP-Adresse, Zeitpunkt des Websitebesuchs, verwendeter Browser und weitere Daten.</li>
                                <li>📅 <strong>Speicherdauer:</strong> abhängig vom jeweiligen Provider, aber in der Regel 2 Wochen</li>
                                <li>⚖️ <strong>Rechtsgrundlagen:</strong> Art. 6 Abs. 1 lit.f DSGVO (Berechtigte Interessen)</li>
                            </ul>
                        </div>
                        <p>
                            Wenn Sie heutzutage Websites besuchen, werden gewisse Informationen – auch personenbezogene Daten – automatisch erstellt und gespeichert, so auch auf dieser Website. Diese Daten sollten möglichst sparsam und nur mit Begründung verarbeitet werden.
                        </p>
                    </section>

                    {/* Services */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Dienste und Integrationen</h2>

                        <div className="space-y-8">
                            {/* Website Baukastensysteme */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Website Baukastensysteme</h3>
                                <p>
                                    Wir verwenden für unsere Website ein Website Baukastensystem. Wir haben ein berechtigtes Interesse daran, ein Website Baukastensystem zu verwenden, um unseren Online-Service zu optimieren und für Sie effizient und nutzeransprechend darzustellen.
                                </p>
                                <h4 className="font-bold text-white mt-2">WordPress.com</h4>
                                <p>
                                    Wir nutzen für unsere Website WordPress.com. Dienstanbieter ist das amerikanische Unternehmen Automattic Inc., 60 29th Street #343, San Francisco, CA 94110, USA.
                                    WordPress verarbeitet Daten von Ihnen u.a. auch in den USA. Wir weisen darauf hin, dass nach Meinung des Europäischen Gerichtshofs derzeit kein angemessenes Schutzniveau für den Datentransfer in die USA besteht.
                                </p>
                            </div>

                            {/* PayPal */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">PayPal</h3>
                                <p>
                                    Wir nutzen auf unserer Website den Online-Bezahldienst PayPal. Dienstanbieter ist das amerikanische Unternehmen PayPal Inc. Für den europäischen Raum ist das Unternehmen PayPal Europe (S.à r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg) verantwortlich.
                                </p>
                            </div>

                            {/* Stripe */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Stripe</h3>
                                <p>
                                    Wir verwenden auf unserer Website ein Zahlungstool des amerikanischen Technologieunternehmens und Online-Bezahldienstes Stripe. Für Kunden innerhalb von der EU ist Stripe Payments Europe (Europe Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland) verantwortlich.
                                </p>
                            </div>

                            {/* Font Awesome */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Font Awesome</h3>
                                <p>
                                    Wir verwenden auf unserer Website Font Awesome des amerikanischen Unternehmens Fonticons (307 S. Main St., Suite 202, Bentonville, AR 72712, USA). Wenn Sie eine unserer Webseite aufrufen, wird die Web-Schriftart Font Awesome (im Speziellen Icons) über das Font Awesome Content Delivery Netzwerk (CDN) geladen.
                                </p>
                            </div>

                            {/* OpenStreetMap */}
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">OpenStreetMap</h3>
                                <p>
                                    Wir haben auf unserer Website Kartenausschnitte des Online-Kartentools „OpenStreetMap“ eingebunden. Angeboten wird diese Funktion von OpenStreetMap Foundation, St John’s Innovation Centre, Cowley Road, Cambridge, CB4 0WS, United Kingdom. Durch die Verwendung dieser Kartenfunktion wird Ihre IP-Adresse an OpenStreetMap weitergeleitet.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="border-t border-white/10 pt-4 text-xs text-gray-500">
                        Quelle: Erstellt mit dem Datenschutz Generator von AdSimple
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
