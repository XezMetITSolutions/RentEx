import React from 'react';

export default function AGBPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto py-16 px-6 sm:px-8">
                {/* Header */}
                <div className="border-b-4 border-red-600 pb-8 mb-12">
                    <h1 className="text-4xl font-black tracking-tighter text-black uppercase">
                        Allgemeine Geschäftsbedingungen
                    </h1>
                    <p className="text-sm font-bold text-red-600 mt-2 uppercase tracking-widest">
                        Rent-Ex GmbH – Stand: 2026 (Österreich)
                    </p>
                </div>

                <div className="space-y-12 text-black/80 text-[15px] leading-relaxed">
                    
                    {/* Section 1 */}
                    <section>
                        <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight">1. ALLGEMEINES</h2>
                        <div className="space-y-4">
                            <p>a) Dem zwischen der <strong>Firma Rent-Ex GmbH</strong> (im Folgenden als „Vermieter“ bezeichnet) und dem Mieter abgeschlossenen Mietvertrag liegen ausschließlich die folgenden Geschäfts- und Vertragsbedingungen zugrunde.</p>
                            <p>b) Der Abschluss des Mietvertrages bedarf der Schriftform. Zusätzlich getroffene Vereinbarungen sind deshalb vom Vermieter vollständig und ausnahmslos bei der Vertragsausfertigung schriftlich niederzulegen.</p>
                            <p>c) Mieter bzw. Lenker erklären mit ihrer Unterschrift Ihre Kenntnisnahme von und ihr Einverständnis mit den gegenständlichen Geschäfts- und Vertragsbedingungen, die Richtigkeit und Vollständigkeit ggf. niedergelegter Zusatz- oder Sondervereinbarungen sowie die Richtigkeit ihrer bei Vertragsausfertigung erteilten Angaben zur Person und zu Ziel und Zweck der Benutzung des gemieteten Fahrzeugs.</p>
                            <p>d) Mieter bzw. Lenker haften in jedem Fall und unabhängig vom Erwerb einer Haftungsreduzierung gem. Pkt. 6 in vollem Umfang für alle Schäden und Ansprüche, die dem Vermieter im Zusammenhang mit fehlerhaften oder unvollständigen Angaben des Mieters bzw. des unterfertigenden Lenkers oder durch zur Bestätigung dieser Angaben vorgelegte ungültige, unzulässige oder falsche Dokumente entstehen.</p>
                            <p>e) Der Mieter nimmt zur Kenntnis, dass unsere Fahrzeuge mit einer GPS-Ortungssystem ausgestattet sind.</p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight">2. WEITERGABE / AUSDEHNUNG AUF DEN FAHRZEUGLENKER</h2>
                        <p>Der Mieter darf das Mietfahrzeug nur selbst lenken oder im Mietvertrag namentlich genannten Personen oder einem angestellten Berufskraftfahrer überlassen. Die Überlassung des Fahrzeuges an weitere nicht namentlich im Mietvertrag aufgeführte Personen bedarf der schriftlichen Genehmigung des Vermieters und ist ohne diese nur aus dem Mieter nicht vorwerfbaren Gründen (z.B. medizinischen Notfällen) zulässig. Jeder mit dem Mieter nicht idente Lenker des gemieteten Fahrzeugs tritt dem Vertrag als Mitmieter bei. Es treffen ihn solidarisch mit dem Mieter alle Rechte und Pflichten sowie sämtliche Kosten und Haftungen aus diesem Vertrag.</p>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight">3. FAHRZEUGÜBERNAHME</h2>
                        <div className="space-y-4">
                            <p>Der Mieter / Lenker erklärt, dass er bei der Übernahme vom Vermieter auf vorhandene Mängel oder Vorschäden am Fahrzeug hingewiesen wurde und dass eine vollständige schriftliche Aufnahme derselben vorliegt. Er bestätigt, dass er sich bei der Fahrzeugübernahme vom ordnungsgemäßen Zustand des Fahrzeugs sowie von der Vollständigkeit der zur Benutzung erforderlichen Fahrzeugpapiere überzeugt hat.</p>
                            <div className="bg-red-50 p-4 border-l-4 border-red-600 text-red-900 text-sm italic">
                                Beachten: Das Fahrzeug wird mit vollem Kraftstofftank/Ladung übernommen. Für das Nachtanken durch den Vermieter wird eine Pauschale von <strong>€ 18,00 inkl. MwSt.</strong> nachverrechnet.
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight">4. AUSLANDSFAHRTEN</h2>
                        <p>Fahrten ins Ausland sind ausschließlich mit Genehmigung des Vermieters zulässig. Bei ungenehmigten Fahrten verfällt jegliche Haftungsreduzierung.</p>
                        <div className="mt-4 overflow-hidden rounded-xl border border-black/5">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-black text-white uppercase text-[10px] tracking-widest font-bold">
                                    <tr>
                                        <th className="p-3">Haftungseinschränkung (Pkt 4.1)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white">
                                    <tr>
                                        <td className="p-3 bg-red-50/50">
                                            In folgenden Ländern verliert die Haftungsreduzierung bei Diebstahl ihre Gültigkeit: Italien, Polen, Albanien, Bosnien, Serbien, Montenegro, Nordmazedonien, Kosovo, Moldawien, Russland, Türkei sowie alle außereuropäischen Staaten.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight">5. PFLICHTEN DES MIETERS UND DES LENKERS</h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border-2 border-black/5 rounded-2xl">
                                    <h3 className="font-bold text-xs uppercase mb-2 text-black/40">Geschwindigkeitslimits</h3>
                                    <ul className="text-xs space-y-1 font-bold text-black">
                                        <li>Lieferwagen: 120 km/h</li>
                                        <li>Bus: 130 km/h</li>
                                        <li>Kleinwagen: 140 km/h</li>
                                        <li>Sonstige PKW: 160 km/h</li>
                                    </ul>
                                </div>
                                <div className="p-4 border-2 border-black/5 rounded-2xl">
                                    <h3 className="font-bold text-xs uppercase mb-2 text-black/40">Besondere Pflichten</h3>
                                    <p className="text-xs">Bei Unfall, Diebstahl oder Einbruch ist <strong>unverzüglich die Polizei</strong> hinzuzuziehen und der Vermieter zu informieren.</p>
                                </div>
                            </div>
                            <p className="text-sm italic">Für jeden verschuldeten Schadensfall wird eine Bearbeitungsgebühr von <strong>€ 58,00 inkl. MwSt.</strong> fällig.</p>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight">6. HAFTUNG / HAFTUNGSREDUZIERUNG</h2>
                        <div className="space-y-4">
                            <p>Das Fahrzeug ist bis zu einem Betrag von <strong>EUR 10.000.000</strong> haftpflichtversichert.</p>
                            <div className="bg-black text-white p-6 rounded-[32px]">
                                <h3 className="text-red-500 font-black uppercase text-xs mb-3">Selbstbehalt bei Haftungsreduzierung</h3>
                                <p className="text-2xl font-black">5% der Schadenshöhe</p>
                                <p className="text-xs text-white/50 mt-1">mindestens jedoch EUR 1.500,00 netto je Schadensereignis.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 7 - Duration */}
                    <section>
                        <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight">7. DAUER UND BEENDIGUNG</h2>
                        <p>Das Fahrzeug ist gereinigt zurückzugeben. Bei Verunreinigung werden Reinigungskosten in Höhe von mindestens <strong>EUR 58,00</strong> verrechnet. Bei Tiertransporten mindestens <strong>EUR 78,00</strong>.</p>
                    </section>

                    {/* Section 8 - Payments */}
                    <section>
                        <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight">8. ZAHLUNGSBEDINGUNGEN</h2>
                        <p>Bei Zahlungsverzug gelten <strong>Verzugszinsen von 9%</strong> als vereinbart. Mahngebühren betragen € 29,00 inkl. MwSt. Mehrkilometer werden je nach Fahrzeug mit € 0,33 bis € 0,45 verrechnet.</p>
                    </section>

                    {/* Section 10 - GDPR */}
                    <section className="bg-black/5 p-8 rounded-[40px]">
                        <h2 className="text-lg font-black text-black mb-4 uppercase tracking-tight">DATENSCHUTZERKLÄRUNG (DSGVO)</h2>
                        <p className="text-sm">Wir speichern Ihre Daten zur Vertragsabwicklung. Eine Weitergabe an Dritte (Versicherungen, Behörden, Inkasso) erfolgt nur bei berechtigtem Interesse. Sie haben das Recht auf Auskunft, Berichtigung und Löschung.</p>
                        <p className="text-xs mt-4 text-black/40">Zuständige Behörde: Österreichische Datenschutzbehörde (DSB), Wien.</p>
                    </section>

                    <section className="border-t border-black/10 pt-8 text-center text-[11px] font-bold text-black/30 uppercase tracking-[3px]">
                        Feldkirch, Österreich – Gerichtsstand: Feldkirch
                    </section>
                </div>
            </div>
        </div>
    );
}
