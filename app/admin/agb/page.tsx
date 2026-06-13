"use client";

import React, { useState } from 'react';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AGBPage() {
    const countries = [
        { id: 'AT', name: 'Österreich', icon: '🇦🇹' }
    ] as const;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-4xl mx-auto py-12 px-6 sm:px-8">
                
                {/* Header & Country Selector */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-8 mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                            Geschäftsbedingungen
                        </h1>
                        <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-[3px]">
                            Rechtliche Grundlagen & AGB
                        </p>
                    </div>

                    <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl">
                        {countries.map((country) => (
                            <button
                                key={country.id}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg"
                            >
                                <span className="text-lg">{country.icon}</span>
                                {country.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 text-gray-750 dark:text-gray-300 text-[15px] leading-relaxed">
                        
                        <div className="flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-full w-fit">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Gültig für Österreich (AT)</span>
                        </div>

                        {/* Section 1 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                1. ALLGEMEINES
                            </h2>
                            <ul className="list-[lower-alpha] space-y-3 pl-5 text-gray-600 dark:text-gray-400">
                                <li>Dem zwischen der Firma Rent-Ex GmbH (im Folgenden als „Vermieter“ bezeichnet) und dem Mieter abgeschlossenen Mietvertrag liegen ausschließlich die folgenden Geschäfts- und Vertragsbedingungen zugrunde.</li>
                                <li>Der Abschluss des Mietvertrages bedarf der Schriftform. Zusätzlich getroffene Vereinbarungen sind deshalb vom Vermieter vollständig und ausnahmslos bei der Vertragsausfertigung schriftlich niederzulegen.</li>
                                <li>Mieter bzw. Lenker erklären mit ihrer Unterschrift Ihre Kenntnisnahme von und ihr Einverständnis mit den gegenständlichen Geschäfts- und Vertragsbedingungen, die Richtigkeit und Vollständigkeit ggf. niedergelegter Zusatz- oder Sondervereinbarungen sowie die Richtigkeit ihrer bei Vertragsausfertigung erteilten Angaben zur Person und zu Ziel und Zweck der Benutzung des gemieteten Fahrzeugs.</li>
                                <li>Mieter bzw. Lenker haften in jedem Fall und unabhängig vom Erwerb einer Haftungsreduzierung gem. Pkt. 6 in vollem Umfang für alle Schäden und Ansprüche, die dem Vermieter im Zusammenhang mit fehlerhaften oder unvollständigen Angaben des Mieters bzw. des unterfertigenden Lenkers oder durch zur Bestätigung dieser Angaben vorgelegte ungültige, unzulässige oder falsche Dokumente entstehen.</li>
                                <li>Der Mieter nimmt zur Kenntnis, dass unsere Fahrzeuge mit einer GPS-Ortungssystem ausgestattet sind.</li>
                            </ul>
                        </section>

                        {/* Section 2 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                2. WEITERGABE / AUSDEHNUNG AUF DEN FAHRZEUGLENKER
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Der Mieter darf das Mietfahrzeug nur selbst lenken oder im Mietvertrag namentlich genannten Personen oder einem angestellten Berufskraftfahrer überlassen. Die Überlassung des Fahrzeuges an weitere nicht namentlich im Mietvertrag aufgeführte Personen bedarf der schriftlichen Genehmigung des Vermieters und ist ohne diese nur aus dem Mieter nicht vorwerfbaren Gründen (z.B. medizinischen Notfällen) zulässig. Jeder mit dem Mieter nicht idente Lenker des gemieteten Fahrzeugs tritt dem Vertrag als Mitmieter bei. Es treffen ihn solidarisch mit dem Mieter alle Rechte und Pflichten sowie sämtliche Kosten und Haftungen aus diesem Vertrag. Unterfertigt der Fahrzeuglenker den Mietvertrag für einen von ihm verschiedenen Mieter, so hat der Lenker eine Erklärung des Mieters beizubringen, wonach er sowohl beauftragt als auch bevollmächtigt ist, den Mietvertrag im Namen und auf Rechnung des Mieters abschließen zu können.
                            </p>
                        </section>

                        {/* Section 3 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                3. FAHRZEUGÜBERNAHME
                            </h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-400">
                                <p>
                                    Der Mieter / Lenker erklärt, dass er bei der Übernahme vom Vermieter auf vorhandene Mängel oder Vorschäden am Fahrzeug hingewiesen wurde und dass eine vollständige schriftliche Aufnahme derselben vorliegt. Er bestätigt, dass er sich bei der Fahrzeugübernahme vom ordnungsgemäßen Zustand des Fahrzeugs (insbesondere vom vollständigen Vorhandensein der Pannen- und der gesetzlich vorgeschriebenen Sicherungs- und Rettungsausrüstung) sowie von der Vollständigkeit der zur Benutzung erforderlichen Fahrzeugpapiere und von der Richtigkeit des im Vertrag vermerkten Anfangskilometerstandes überzeugt hat. Außerdem bestätigt der Mieter / Lenker, das Fahrzeug mit vollem Kraftstofftank bzw. voller Ladung übernommen zu haben. Die Kosten für Treibstoff und verbrauchte Betriebsstoffe wie z.B. Motoröl und Scheibenwaschflüssigkeit gehen zu Lasten des Mieters.
                                </p>
                                <div className="bg-zinc-900 dark:bg-black text-white p-6 rounded-2xl border-l-8 border-red-600 shadow-lg">
                                    <h3 className="text-red-500 font-black uppercase text-[10px] tracking-widest mb-3">Service Pauschale (Kraftstoff / Ladung)</h3>
                                    <p className="text-xl font-bold">€ 18,00 inkl. MwSt.</p>
                                    <p className="text-[10px] text-white/40 mt-1 uppercase">Wird pauschal nachverrechnet, falls das Fahrzeug nicht vollgetankt/vollgeladen zurückgegeben wird.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                4. AUSLANDSFAHRTEN
                            </h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-400">
                                <p>
                                    Fahrten ins Ausland sind ausschließlich mit Genehmigung des Vermieter zulässig. Der Vermieter ist spätestens bei Beginn des Mietverhältnisses von beabsichtigten Auslandsfahrten zu verständigen. Fahrten in die vom Mieter / Lenker angegebenen und vom Vermieter genehmigten Staaten sind im Vertrag vom Vermieter zu vermerken.
                                </p>
                                <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-3">
                                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1">Italien, Polen, Balkan, Türkei & sonstige Drittstaaten</h4>
                                        <p className="text-xs text-amber-700 dark:text-amber-400">
                                            Mit Grenzübertritt verliert eine Haftungsreduzierung in Bezug auf Diebstahl und Einbruch ihre Wirksamkeit. Für sämtliche Schäden haften Mieter und Lenker in vollem Umfang.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                5. PFLICHTEN DES MIETERS UND DES LENKERS
                            </h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-400 text-sm">
                                <p><strong>a) Schonender Umgang & Limits:</strong> Der Mieter / Lenker verpflichtet sich, das Fahrzeug schonend und ausschließlich seinem Zweck gemäß zu verwenden. Des Weiteren verpflichtet sich der Mieter/Lenker eine Geschwindigkeitsobergrenze von 120 km/h bei Lieferwagen, 130 km/h bei Bussen, 140 km/h bei Kleinwagen und bei sonstigen PKW 160 km/h einzuhalten.</p>
                                <p><strong>b) Überwachung:</strong> Dem Mieter / Lenker obliegt während der Dauer des Mietverhältnisses die ständige Überwachung der Verkehrs- und der Betriebssicherheit (z.B. Reifenluftdruck, Kühlmittel- und Motorölstände).</p>
                                <p><strong>c) Lenkberechtigung:</strong> Das Fahrzeug darf nur von dazu geeigneten und befähigten Personen in Betrieb genommen werden, welche uneingeschränkt fahrtüchtig und seit mindestens zwei Jahren im ununterbrochenen Besitz einer ordnungsgemäß ausgestellten und gültigen Lenkerberechtigung sind.</p>
                                <p><strong>d) Diebstahlsicherung:</strong> Das Mietfahrzeug ist sorgfältig gegen Diebstahl zu sichern (verschlossen und mit aktivierter Lenkradsperre abzustellen).</p>
                                <p><strong>e) Transportbestimmungen:</strong> Gewerblicher Transport gefährlicher Güter ist untersagt. Die Beförderung von Tieren ist nur mit Genehmigung des Vermieters gestattet.</p>
                                <p><strong>f) Besondere Pflichten bei Unfall, Diebstahl, Einbruch:</strong> Bei Unfällen/Schäden ist der Vermieter unabhängig vom Verschulden unverzüglich zu benachrichtigen. Zur Feststellung der Unfalltatsachen hat der Mieter unverzüglich die Polizei hinzuzuziehen. Für jeden selbstverschuldeten Schadensfall wird eine Bearbeitungsgebühr von <strong>€ 58,00 inkl. MwSt.</strong> fällig.</p>
                                <p><strong>g) Betriebsstörungen, Mängel und Schäden:</strong> Bei Störungen oder Mängeln aller Art hat der Mieter/Lenker umgehend den Vermieter zu verständigen und dessen Weisungen einzuholen.</p>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                6. HAFTUNG / VEREINBARUNG EINER HAFTUNGSREDUZIERUNG
                            </h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-400">
                                <p>
                                    Das Mietfahrzeug ist bis zu einem Schadensbetrag in Höhe von EUR 10.000.000 haftpflichtversichert.
                                </p>
                                <div className="bg-red-600 text-white p-6 rounded-2xl shadow-lg">
                                    <h3 className="font-black uppercase text-[10px] tracking-widest mb-2 opacity-80">Selbstbehalt mit Haftungsreduzierung</h3>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-black">5%</p>
                                        <p className="text-xs font-bold">der Schadenshöhe (mindestens EUR 1.500,00 netto je Schadensereignis)</p>
                                    </div>
                                    <p className="text-[10px] mt-3 opacity-90 italic">Gilt bei Beschädigung oder Verlust des Fahrzeugs durch Eigenverschulden, Einbruch oder Diebstahl.</p>
                                </div>
                                <p className="text-xs">
                                    Unabhängig vom Erwerb einer Haftungsreduzierung haften Mieter und Lenker in voller Schadenshöhe bei Vorliegen von Vorsatz, grober Fahrlässigkeit, Alkohol/Drogen am Steuer, Falschbetankung, Reifen-/Unterbodenschäden sowie unerlaubten Auslandsfahrten.
                                </p>
                            </div>
                        </section>

                        {/* Section 7 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                7. DAUER UND BEENDIGUNG DES VERTRAGSVERHÄLTNISSES
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Das Mietverhältnis ist befristet. Eine Verlängerung bedarf der vorherigen Genehmigung des Vermieters sowie einer Vorauszahlung. Das Fahrzeug ist rechtzeitig am vereinbarten Ort gereinigt und im selben Zustand zurückzugeben. Bei Verletzung der Tank- (Voll/Voll) oder Reinigungsregeln werden entsprechende Pauschalen (z.B. Reinigung ab € 58,00 inkl. MwSt., Kraftstoff-Auffüllservice € 18,00 inkl. MwSt. zzgl. Tankkosten) verrechnet. Bei Rücktritt vom Vertrag hat der Mieter eine Stornogebühr von 20 % der Mietkosten netto (mindestens jedoch € 48,00 inkl. MwSt. zzgl. € 18,00 inkl. MwSt.) zu leisten.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                8. ZAHLUNGSBEDINGUNGEN
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Der Mieter hat bei Beginn des Mietverhältnisses eine Kaution zu hinterlegen. Sämtliche Miet- und Nebenkosten sind bei Rückgabe sofort fällig. Bei Zahlungsverzug gelten Verzugszinsen in Höhe von 9% als vereinbart, zudem sind Mahnkosten (pauschal € 29,00 inkl. MwSt. pro Mahnung) sowie alle außergerichtlichen Eintreibungskosten zu ersetzen.
                            </p>
                        </section>

                        {/* Section 9 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                9. MEHRKILOMETER
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Die Mehrkilometer werden je nach Fahrzeugkategorie mit <strong>0,33€ bis 0,45€ pro Kilometer</strong> verrechnet, sofern vertraglich keine abweichenden Vereinbarungen getroffen wurden.
                            </p>
                        </section>

                        {/* Section 10 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                10. DATENSCHUTZ
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Der Vermieter speichert und verarbeitet personenbezogene Daten im Rahmen der DSGVO. Bei behördlichen Anfragen (z.B. Strafzetteln oder Radarstrafen) oder Unfällen werden die Mieterdaten an die zuständigen Stellen weitergegeben. Der Mieter ist selbst für die Löschung privater Daten auf gekoppelten Bordgeräten (Navi, Freisprechanlage) verantwortlich.
                            </p>
                        </section>

                        {/* Section 11 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                11. KONSUMENTENSCHUTZ
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Sollten einzelne Bestimmungen zwingenden konsumentenschutzrechtlichen Gesetzen (KSchG) widersprechen, treten die gesetzlichen Regelungen an deren Stelle. Die Gültigkeit der übrigen Vertragsbestimmungen bleibt davon unberührt.
                            </p>
                        </section>

                        {/* Section 12 */}
                        <section className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                12. RECHTSWAHL & GERICHTSSTAND
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Erfüllungsort für alle Leistungen aus dem Mietvertrag ist A-6800 Feldkirch. Für sämtliche Streitigkeiten vereinbaren die Parteien die ausschließliche Anwendbarkeit österreichischen Rechts und den Gerichtsstand Feldkirch.
                            </p>
                        </section>

                        <section className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[4px]">
                            Feldkirch, Österreich – Gerichtsstand: Feldkirch
                        </section>
                    </div>
            </div>
        </div>
    );
}
