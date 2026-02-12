import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-red-500/30">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Allgemeine Geschäftsbedingungen</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-10">Stand: Januar 2026</p>

                <div className="prose dark:prose-invert prose-lg max-w-none text-gray-700 dark:text-gray-300 space-y-12">

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Allgemeines</h2>
                        <ul className="list-[lower-alpha] space-y-2 pl-5">
                            <li>Dem zwischen der Firma Rent-Ex GmbH (im Folgenden als „Vermieter“ bezeichnet) und dem Mieter abgeschlossenen Mietvertrag liegen ausschließlich die folgenden Geschäfts- und Vertragsbedingungen zugrunde.</li>
                            <li>Der Abschluss des Mietvertrages bedarf der Schriftform. Zusätzlich getroffene Vereinbarungen sind deshalb vom Vermieter vollständig und ausnahmslos bei der Vertragsausfertigung schriftlich niederzulegen.</li>
                            <li>Mieter bzw. Lenker erklären mit ihrer Unterschrift Ihre Kenntnisnahme von und ihr Einverständnis mit den gegenständlichen Geschäfts- und Vertragsbedingungen, die Richtigkeit und Vollständigkeit ggf. niedergelegter Zusatz- oder Sondervereinbarungen sowie die Richtigkeit ihrer bei Vertragsausfertigung erteilten Angaben zur Person und zu Ziel und Zweck der Benutzung des gemieteten Fahrzeugs.</li>
                            <li>Mieter bzw. Lenker haften in jedem Fall und unabhängig vom Erwerb einer Haftungsreduzierung gem. Pkt. 6 in vollem Umfang für alle Schäden und Ansprüche, die dem Vermieter im Zusammenhang mit fehlerhaften oder unvollständigen Angaben des Mieters bzw. des unterfertigenden Lenkers oder durch zur Bestätigung dieser Angaben vorgelegte ungültige, unzulässige oder falsche Dokumente entstehen.</li>
                            <li>Der Mieter nimmt zur Kenntnis, dass unsere Fahrzeuge mit einer GPS-Ortungssystem ausgestattet sind.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Weitergabe / Ausdehnung auf den Fahrzeuglenker</h2>
                        <p>
                            Der Mieter darf das Mietfahrzeug nur selbst lenken oder im Mietvertrag namentlich genannten Personen oder einem angestellten Berufskraftfahrer überlassen. Die Überlassung des Fahrzeuges an weitere nicht namentlich im Mietvertrag aufgeführte Personen bedarf der schriftlichen Genehmigung des Vermieters und ist ohne diese nur aus dem Mieter nicht vorwerfbaren Gründen (z.B. medizinischen Notfällen) zulässig. Jeder mit dem Mieter nicht idente Lenker des gemieteten Fahrzeugs tritt dem Vertrag als Mitmieter bei. Es treffen ihn solidarisch mit dem Mieter alle Rechte und Pflichten sowie sämtliche Kosten und Haftungen aus diesem Vertrag. Unterfertigt der Fahrzeuglenker den Mietvertrag für einen von ihm verschiedenen Mieter, so hat der Lenker eine Erklärung des Mieters beizubringen, wonach er sowohl beauftragt als auch bevollmächtigt ist, den Mietvertrag im Namen und auf Rechnung des Mieters abschließen zu können.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Fahrzeugübernahme</h2>
                        <p>
                            Der Mieter / Lenker erklärt, dass er bei der Übernahme vom Vermieter auf vorhandene Mängel oder Vorschäden am Fahrzeug hingewiesen wurde und dass eine vollständige schriftliche Aufnahme derselben vorliegt. Er bestätigt, dass er sich bei der Fahrzeugübernahme vom ordnungsgemäßen Zustand des Fahrzeugs (insbesondere vom vollständigen Vorhandensein der Pannen- und der gesetzlich vorgeschriebenen Sicherungs- und Rettungsausrüstung) sowie von der Vollständigkeit der zur Benutzung erforderlichen Fahrzeugpapiere und von der Richtigkeit des im Vertrag vermerkten Anfangskilometerstandes überzeugt hat. Außerdem bestätigt der Mieter / Lenker, das Fahrzeug mit vollem Kraftstofftank bzw. voller Ladung übernommen zu haben. Die Kosten für Treibstoff und verbrauchte Betriebsstoffe wie z.B. Motoröl und Scheibenwaschflüssigkeit gehen zu Lasten des Mieters. Für das Nachtanken von Kraftstoff bzw. Ladung von Strom wird pauschal 18,00€ inklusive MwSt. nachverrechnet. Der Mieter kann nach Ende des Mietverhältnisses das Fahrzeug mit vollem Kraftstofftank bzw. voller Ladung wieder zurückgeben. Beabsichtigt der Mieter / Lenker die Benutzung gebührenpflichtiger Verkehrswege im In- oder Ausland, so gehen die Kosten hierfür (Autobahngebühren, Mauten, Umweltplaketten etc.) ausschließlich zu seinen Lasten. Der Mieter / Lenker erklärt, ggf. auch für von ihm diesbezüglich erworbene Berechtigungsnachweise (insbesondere am Fahrzeug fixierte Vignetten), welche eine über die Dauer des Mietverhältnisses hinausreichende Verwendung zulassen, auf jegliche Ersatzansprüche gegen den Vermieter zu verzichten.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Auslandsfahrten</h2>
                        <p className="mb-4">
                            Fahrten ins Ausland sind ausschließlich mit Genehmigung des Vermieters zulässig. Der Vermieter ist spätestens bei Beginn des Mietverhältnisses von beabsichtigten Auslandsfahrten zu verständigen. Fahrten in die vom Mieter / Lenker angegebenen und vom Vermieter genehmigten Staaten sind im Vertrag vom Vermieter zu vermerken. Es obliegt dem Mieter / Lenker, sich bei grenzüberschreitenden Fahrten über die geltenden verkehrs- und zollrechtlichen Vorschriften der bereisten Staaten zu informieren und diese unbedingt zu beachten und einzuhalten. Bei Verletzung der vorgenannten Vereinbarungen verliert eine vertraglich vereinbarte Haftungsreduzierung gemäß Pkt. 6 ihre Wirksamkeit, Mieter und Lenker haften gegebenenfalls für sämtliche sich dem Vermieter hieraus ergebenden Schäden in vollem Umfang, insbesondere für allfällige Rückholkosten.
                        </p>

                        <h3 className="text-xl font-semibold text-white mb-2">4.1. Haftungsreduzierung im Ausland</h3>
                        <p>
                            Mit Grenzübertritt nach Italien, Polen, Albanien, Bosnien und Herzegowina, Serbien, Montenegro, Nordmazedonien, Kosovo, Moldawien, Russland, Türkei sowie alle außereuropäischen Staaten und Territorien verliert eine Haftungsreduzierung gem. Pkt. 6 in Bezug auf Diebstahl und Einbruch ihre Wirksamkeit. Für sämtliche Schäden, die dem Vermieter im Zusammenhang mit Diebstahl und Einbruch in oben genannten Gebieten entstehen sollten, haften somit Mieter und Lenker in vollem Umfang. Alle Bestimmungen dieses Vertrages, insbesondere die unter Pkt.5 genannten Pflichten des Mieters und die unter Pkt. 6 aufgeführten Bedingungen zum Erhalt einer Haftungsreduzierung gelten für den Mieter und den Lenker ohne Einschränkung auch im Ausland als verbindlich vereinbart.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Pflichten des Mieters und des Lenkers</h2>
                        <div className="space-y-4">
                            <p><strong className="text-gray-900 dark:text-white">a)</strong> Der Mieter / Lenker verpflichtet sich, das Fahrzeug schonend und ausschließlich seinem Zweck gemäß zu verwenden sowie alle mit der Benutzung des Kraftfahrzeugs einhergehenden Rechtsvorschriften zu beachten und einzuhalten. Des Weiteren verpflichtet sich der Mieter/Lenker eine Geschwindigkeitsobergrenze von 120 km/h bei dem Lieferwagen, 130km/h bei dem Bus, 140km/h bei den Kleinwagen und bei den sonstige PKW 160km/h einzuhalten. Er haftet persönlich bei allen Rechtsverstößen im Zusammenhang mit der Verwendung des Fahrzeuges.</p>

                            <p><strong className="text-gray-900 dark:text-white">b)</strong> Dem Mieter / Lenker obliegt während der Dauer des Mietverhältnisses die ständige Überwachung der Verkehrs- und der Betriebssicherheit (insbesondere die regelmäßige Überprüfung von Reifenluftdruck, Kühlmittel- und Motorölständen). Eine Belastung des Mietfahrzeuges über das gesetzlich zulässige Maß ist untersagt, ebenso die Verwendung des Fahrzeuges zu Abschlepp-, Test-, Trainings oder Erkundungsfahrten, zur unmittelbaren Teilnahme an Renn- und Sportveranstaltungen sowie zum Befahren von Rennstrecken. Bei der Ladung und Beförderung von Gütern hat der Mieter die für das Fahrzeug zulässigen Lasten und Beladungsmaße unbedingt einzuhalten und alle erforderlichen Maßnahmen zur vorschriftsmäßigen Sicherung der Ladung zu treffen.</p>

                            <p><strong className="text-gray-900 dark:text-white">c)</strong> Der Mieter hat dafür Sorge zu tragen und sich zu vergewissern, dass das Mietfahrzeug nur von dazu geeigneten und befähigten Personen in Betrieb genommen wird, welche uneingeschränkt fahrtüchtig und seit mindestens zwei Jahren im ununterbrochenen Besitz einer ordnungsgemäß ausgestellten und gültigen Lenkerberechtigung sind.</p>

                            <p><strong className="text-gray-900 dark:text-white">d)</strong> Der Mieter bzw. Lenker hat das Fahrzeug sorgfältig gegen Diebstahl zu sichern und grundsätzlich verschlossen und mit Lenkradsperre abzustellen. Das Fahrzeug ist, wenn möglich, auf einem überwachten Parkplatz abzustellen.</p>

                            <p><strong className="text-gray-900 dark:text-white">e)</strong> Der Mieter bzw. Lenker hat bei Verwendung des Fahrzeuges zur gewerblichen Personen- und Güterbeförderung alle gesetzlichen Bestimmungen, insbesondere des Gewerberechts, zu beachten und einzuhalten. Der Transport gefährlicher Güter nach dem Gefahrengüterbeförderungsgesetz ist verboten. Die Beförderung von Tieren ist dem Mieter nur mit Genehmigung des Vermieters und ausschließlich in dafür geeigneten Transportbehältern gestattet.</p>

                            <p><strong className="text-gray-900 dark:text-white">f) Besondere Pflichten bei Unfall, Diebstahl, Einbruch:</strong> Bei Unfall ist der Vermieter unabhängig vom Verschulden unverzüglich zu benachrichtigen. Auf Verlangen ist dem Vermieter eine wahrheitsgemäße schriftliche Darstellung des Unfallherganges auszufertigen. Für jeden von ihm verschuldeten Schadensfall ist vom Mieter / Lenker eine Bearbeitungsgebühr in Höhe von € 58,00 inkl. MwSt. an den Vermieter zu entrichten. Zwecks Feststellung der Unfalltatsachen hat der Mieter unverzüglich das zuständige Polizeiorgan hinzuzuziehen und zu verlangen, dass der Unfall polizeilich aufgenommen wird. Falls seitens der Polizei eine Unfallaufnahme verweigert wird, so hat der Mieter dies dem Vermieter in geeigneter Form nachzuweisen. Dies gilt auch, wenn keine Dritten am Unfall beteiligt sind und lediglich Sachschaden entstanden ist. Im Fall einer Beschädigung des Mietfahrzeuges, insbesondere durch Verkehrsunfall, sind sämtliche Daten aller Unfallbeteiligten, Ort, Zeit und Zeugen des Unfalls sowie die polizeilichen Kennzeichen und die Haftpflicht-versicherer beteiligter Fahrzeuge festzuhalten. Erklärungen zu Schuldfragen dürfen anderen Unfallbeteiligten gegenüber keinesfalls abgegeben werden. Bei Diebstahl oder Einbruch ist der Vermieter umgehend zu benachrichtigen und der Schaden unverzüglich beim zuständigen Polizeiorgan anzuzeigen, wobei auf eine polizeiliche Aufnahme der Schadenstatsachen zu bestehen ist. Auf Verlangen ist dem Vermieter eine schriftliche Darstellung des Schadensherganges auszufertigen. Handelt der Mieter bzw. Lenker den vorgenannten Vorschriften zuwider, haftet er dem Vermieter – unabhängig von einer erworbenen Haftungsreduzierung gem. Pkt. 6 – für die eingetretenen Schäden in vollem Umfang.</p>

                            <p><strong className="text-gray-900 dark:text-white">g) Betriebsstörungen, Mängel und Schäden:</strong> - Bei Betriebsstörungen, Fahrzeugmängeln oder -Schäden aller Art hat der Mieter bzw. Lenker umgehend den Vermieter zu verständigen und dessen Weisungen einzuholen. Widrigenfalls hat der Mieter bzw. Lenker - unabhängig von einer erworbenen Haftungsreduzierung - die Kosten einer Störungs-, Mängel oder Schadensbehebung zu tragen und haftet dem Vermieter für alle in diesem Zusammenhang entstehenden Folgeschäden und -Kosten in vollem Umfang.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Haftung des Mieters bzw. Lenkers / Vereinbarung einer Haftungsreduzierung</h2>
                        <div className="space-y-4">
                            <p>Das Mietfahrzeug ist bis zu einem Schadensbetrag in Höhe von EUR 10.000.000 haftpflichtversichert. Ein darüber hinausreichender Versicherungsschutz der Insassen für Schäden an Leib, Leben und Besitz (insbesondere Gepäck) besteht nicht. Ebenso sind mit dem Mietfahrzeug beförderte Güter von jeglichem Versicherungsschutz ausgenommen. Der Mieter kann bei Abschluss des Mietvertrages eine Haftungsreduzierung erwerben, für die folgende Bedingungen gelten:</p>

                            <p><strong className="text-gray-900 dark:text-white">a)</strong> Bei Verzicht auf eine Haftungsreduzierung haftet der Mieter bzw. Lenker nach Maßgabe der gesetzlichen Bestimmungen für jede Art von Beschädigungen am Mietfahrzeug mitsamt Zubehör, bei Diebstahl in voller Höhe für den entstandenen unmittelbaren Schaden und für alle auf diesen ursächlich zurückführbaren Folgeschäden. Die Schadensersatzforderungen des Vermieters betreffend gilt zwischen den Vertragsparteien als vereinbart, dass - im Fall einer Totalbeschädigung oder eines Totalverlust die Forderung des Vermieters zumindest die Wiederbeschaffungs- und allfälligen Umbaukosten sowie die Ab- und Anmeldespesen beinhaltet, - im Fall einer Teilbeschädigung des Fahrzeuges der Mieter und der Lenker für die Reparaturkosten bzw. den eingetretenen Wertverlust lt. Kostenvoranschlag eines Fachbetriebes in vollem Umfang haften, - in jedem Fall in voller Höhe für alle Kosten, die dem Vermieter im Zusammenhang mit der Bergung, Abschleppung und Rückholung des Fahrzeuges entstehen sowie für Verdienstentgang und Rechts- aufwandkosten entsprechend der unter Pkt. 6b nachgenannten Bestimmungen.</p>

                            <p><strong className="text-gray-900 dark:text-white">b)</strong> Mit Erwerb einer Haftungsreduzierung haften der Mieter und der Lenker dem Vermieter mit einem Selbstbehalt von 5% der Schadenshöhe, mindestens jedoch EUR 1500,00 netto. je Schadensereignis bei Beschädigung oder Verlust des Fahrzeugs durch Eigenverschulden. Im Fall von Einbruch oder Diebstahl des Mietfahrzeuges beträgt der Selbstbehalt 5% der Schadenshöhe, mindestens jedoch EUR 1500,00 netto. Die Haftungsreduzierung erstreckt sich ausschließlich auf die Instandsetzungs- bzw. Wiederbeschaffungskosten und keinesfalls auf dem Vermieter fallweise entstehende Unfallfolgekosten oder Ausfallschäden. Der Mieter / Lenker haftet deshalb auch bei Erwerb der Haftungsreduzierung • für alle Kosten, die dem Vermieter im Zusammenhang mit der Bergung, Abschleppung und Rückholung des Fahrzeuges entstehen in voller Höhe, • für Verdienstentgang vorbehaltlich der gesetzlichen Bestimmungen nach § 1324 ABGB je Steh- bzw. Ausfalltag pauschal mit eine Tagesnormaltarif der betreffenden Fahrzeugkategorie lt. Preisliste für die Dauer der Reparatur bzw. die angemessene Dauer der Wiederbeschaffung eines gleichwertigen Ersatzfahrzeuges, dies unabhängig vom Nachweis eines effektiven Verdienstentgangs bzw. einer konkreten Vermietbarkeit des beschädigten oder abhanden gekommenen Fahrzeuges seitens des Vermieters, sowie für alle Rechtsaufwandkosten, die dem Vermieter im Zusammenhang mit der Schadensbearbeitung entstehen in vollem Umfang.</p>

                            <p><strong className="text-gray-900 dark:text-white">c)</strong> Unabhängig vom Erwerb einer Haftungsreduzierung haften Mieter und Lenker darüber hinaus in jedem Fall in voller Schadenshöhe bei Vorliegen von Vorsatz, grober Fahrlässigkeit oder Fahrerflucht sowie für • Unfallschäden infolge selbstverschuldeter Fahruntüchtigkeit (Alkohol, Medikamente etc.) – • Schäden und Verlust durch Diebstahl, wenn der Mieter die Fahrzeugschlüssel nicht beibringen kann; - Schäden im Zusammenhang mit nicht genehmigten Auslandsfahrten und bei Unwirksamkeit lt. Punkt 4.1. • den Verlust von Fahrzeugschlüsseln und -Papieren; - • Beschädigungen und Verschmutzungen des Fahrzeuginnenraumes, die keine unmittelbare Unfallfolge darstellen; - • Schäden, die im Zusammenhang mit der Beladung des Fahrzeuges entstehen, so z.B. im Zuge von Be- und Entladetätigkeiten, durch Überladung oder Überschreitung der zulässigen Lademaße, mangelhafte bzw. unsachgemäße Ladungssicherung oder für den Fahrzeugtyp unzulässiges Ladegut; • Schäden infolge der Nichtbeachtung von Durchfahrtshöhe oder -Breite; • Schäden infolge überhöhter Geschwindigkeit oder Nichtbeachtung von Überholverboten; •Schäden infolge Falschbetankung wenn diese vom Mieter / Lenker verschuldet sind; • Schäden, die vom Mieter / Lenker nach Ablauf der vereinbarten Mietvertragsdauer verschuldet werden; •Schäden und damit ursächlich verbundene Folgeschäden an Reifen, Felgen oder Fahrzeugunterboden; • Schäden, die dem Vermieter im Zusammenhang mit der Nichteinhaltung bzw. Verletzung der unter Pkt.2 (Weitergabe) und Pkt. 5 (Pflichten des Mieters und des Lenkers) genannten Bestimmungen entstehen; • Schäden, die im Zusammenhang mit der Beförderung des Fahrzeuges mit anderen Verkehrs- bzw. Transportmitteln wie bspw. Autoreisezügen, Fährschiffen oder anderen Fahrzeugtransportern entstehen. Von einer Haftung des Mieters / Lenkers ausgenommen sind jene Schäden und Kosten, die dem Vermieter nachweislich infolge vorsätzlichen oder fahrlässigen Verschuldens seiner selbst oder ihm nach den gesetzlichen Bestimmungen zuzuordnenden Personen entstehen. Die Haftungsreduzierung gem. Pkt. 6b unterliegt nicht den allgemeinen Kaskobestimmungen. Der Mieter / Lenker hat in geeigneter Form nachzuweisen, dass ihn kein Verschulden am Schadenseintritt trifft und dieser ein unabwendbares Ereignis im Sinne des § 9 Abs. 2 EKHG darstellt.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Dauer und Beendigung des Vertragsverhältnisses</h2>
                        <p>
                            Das Mietverhältnis wird regelmäßig für einen befristeten Zeitraum abgeschlossen. Von der Absicht oder Erforderlichkeit einer Verlängerung des Mietverhältnisses hat der Mieter den Vermieter vor Ablauf der vereinbarten Vertragsdauer in Kenntnis zu setzen. Vertragsverlängerungen sind nur mit Einverständnis des Vermieters und vorbehaltlich einer Vorauszahlung der im Verlängerungszeitraum auflaufenden Miet- und Nebenkosten möglich. Der Vermieter behält sich vor, Mietverhältnisse aus wichtigen Gründen (wie z.B. Unfall, Verstöße gegen die Vertragsbedingungen, Zahlungsverzug) für beendet zu erklären und sowohl die unverzügliche Rückgabe des Mietfahrzeuges als auch die sofortige und vollständige Zahlung der entstandenen Miet- und Zusatzkosten einzufordern. Der Mieter / Lenker verpflichtet sich, das Fahrzeug rechtzeitig am vereinbarten Ort gereinigt und in dem von ihm übernommenen Zustand an den Vermieter zurückzugeben. Bei der Übergabe des Fahrzeuges wird empfohlen, Bilder und Videos vom Fahrzeug zu machen. Der Vermieter behält sich vor, erforderliche Reinigungsarbeiten in einer dem Aufwand angemessenen Höhe, mindestens jedoch mit EUR 58,00 inkl. MwSt. (bzw. mindestens EUR 78,00 inkl. MwSt. bei Verunreinigungen infolge Verletzung der unter 5e) angeführten Bestimmungen bzgl. der Beförderung von Tieren), in Rechnung zu stellen. Ebenso gehen die Kosten einer vom Mieter versäumten Volltankung bzw. Vollladung des Fahrzeuges in voller Höhe und zuzüglich einer Aufwandsentschädigung von EUR 18,00 inkl. MwSt zu dessen Lasten. Bei nicht rechtzeitiger Rückgabe des Fahrzeuges samt Zubehör, Fahrzeugpapieren und –Schlüsseln verpflichtet sich der Mieter zum Ersatz des dem Vermieter gegebenenfalls hieraus entstandenen Schadens sowie zur Zahlung einer Verzugsgebühr in Höhe eines Tagestarifes lt. Preisliste. Bei Rücktritt vom Vertrag muss der Mieter einen Schadenersatz von 20 % der Mietkosten netto bzw. mindestens EUR 48,00 inkl. Mwst und zuzüglich EUR 18,00 inkl. Mwst bezahlen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Zahlungsbedingungen</h2>
                        <p>
                            Der Mieter hat bei Beginn des Mietverhältnisses eine Mietsicherstellung (Kaution) in einer dem Ermessen des Vermieters vorbehaltenen Höhe zu leisten oder den Vermieter mittels Autorisierung einer von ihm akzeptieren Kreditkarte zum Einzug derselben zu ermächtigen. Sämtliche Miet-, Neben- und Zusatzkosten sowie ggf. Selbstbehalte sind bei der Rückgabe des Fahrzeuges sofort zur Zahlung fällig, Schadensersatzforderungen spätestens mit der schriftlichen Zahlungsaufforderung durch den Vermieter. Erfolgt die Abrechnung des Mietvertrages mittels einer vom Vermieter akzeptierten Kreditkarte, erklärt sich der Mieter damit einverstanden, dass sämtliche anfallenden Verbindlichkeiten aus dem Mietverhältnis mit dem Kreditkartenherausgeber abgerechnet und ggf. nachverrechnet werden können. Bei Zahlungsverzug haben Mieter und Lenker solidarisch alle gerichtlichen und außergerichtlichen Kosten der Eintreibung (inkl. Inkassospesen) zu ersetzen. Die Gebühr für eine außergerichtliche Mahnung wird mit € 29,00 inkl. MwSt. bestimmt. Bei Zahlungsverzug gilt ein Verzugszins von 9% als vereinbart.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Mehrkilometer</h2>
                        <p>
                            Die Mehrkilometer werden je nach Fahrzeug mit 0,33€ bis 0,45€ pro Kilometer verrechnet. Ausgenommen sind sonstige Vereinbarungen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Datenschutz</h2>
                        <p>
                            Im Rahmen der Anbahnung und Abwicklung von Mietgeschäften behält sich der Vermieter die Speicherung und Verarbeitung personenbezogener Daten des Mieters bzw. Lenkers gem. DSGVO vor. Eine Erklärung des Vermieters zum Datenschutz kann der Mieter unter http://Rent-Ex.at/datenschutz.pdf oder in den Geschäftsräumen des Vermieters einsehen. Bei begründeten behördlichen Anfragen, bei Rechtsverletzungen im Zusammenhang mit der Verwendung des Mietfahrzeugs sowie bei Unfällen erfolgt eine Weitergabe der Kontakt- und Anmietdaten des Mieters / Lenkers an die zuständigen Behörden bzw. an die mit der Klärung des Sachverhalts befassten Dritten. Der Vermieter weist ausdrücklich darauf hin, dass bei der Nutzung mit dem Fahrzeug verkoppelter elektronischer Geräte (z.B. Navigation -und Mobilfunkgeräte) Daten auf diesen und im Fahrzeug gespeichert werden können. Die Löschung derartiger Daten obliegt ausnahmslos dem Mieter bzw. Fahrer, der Vermieter ist hierzu nicht verpflichtet. Für einen Missbrauch von Daten, die aufgrund einer vom Mieter / Lenker unterlassenen Löschung von Dritten eingesehen werden können, übernimmt der Vermieter weder Verantwortung noch Haftung. Der Mieter erklärt bei Vertragsabschluss durch Ankreuzen des dafür vorgesehenen Feldes sein Einverständnis mit den Erklärungen des Vermieters zum Datenschutz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Konsumentenschutz</h2>
                        <p>
                            Sollten einzelnen der o.a. Geschäftsbedingungen zwingenden gesetzliche Bestimmungen, insbesondere denen des Konsumentenschutzgesetzes, zuwiderlaufen, so treten letztere an deren Stelle. Bei Nichtigkeit einzelner Bestimmungen treten lediglich diese außer Kraft und zieht dies weder die Nichtigkeit der übrigen Geschäftsbedingungen noch des ganzen Vertrages nach sich.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Rechtswahl, Gerichtsstand</h2>
                        <p>
                            Als Erfüllungsort für alle Leistungen aus diesem Vertrag wird A-6800 Feldkirch bestimmt. Die Vertragsparteien vereinbaren für sämtliche Rechtsstreitigkeiten aus dem Vertragsverhältnis die alleinige Anwendbarkeit österreichischen Rechts. Mit Mietern, die als Unternehmer gemäß KSchG auftreten oder weder Wohnsitz noch Beschäftigung in Österreich nachweisen können, gilt die Zuständigkeit der sachlich in Betracht kommenden Gerichte in A-6800 Feldkirch als vereinbart.
                        </p>
                    </section>

                </div>
            </main>

            <Footer />
        </div>
    );
}
