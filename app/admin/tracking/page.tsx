import Link from 'next/link';
import { Radio, ArrowLeft, Wrench, Shield, Satellite, Navigation } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function TrackingPage() {
    return (
        <div className="max-w-[1440px] mx-auto space-y-6 pb-16 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-hm-rule">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="p-2.5 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-muted hover:text-hm-ink transition-colors"
                        title="Zurück zum Dashboard"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                                Live GPS Tracking & Telematik
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] font-mono text-[11px] font-bold uppercase tracking-wider border bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                                In Bearbeitung
                            </span>
                        </div>
                        <p className="text-xs font-mono text-hm-muted mt-1 uppercase tracking-wider">
                            Telematik-Schnittstelle · Geofencing · OBD-II Flottenortung
                        </p>
                    </div>
                </div>
            </div>

            {/* In Bearbeitung Hero Card */}
            <div className="rounded-[var(--hm-radius-card)] bg-hm-paper border border-hm-rule p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-xs">
                <div className="w-16 h-16 rounded-[var(--hm-radius-input)] bg-amber-500/10 text-amber-600 border border-amber-500/20 grid place-items-center mx-auto">
                    <Radio className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-2">
                    <h2 className="hm-display text-xl sm:text-2xl font-bold text-hm-ink tracking-tight">
                        Telematik & GPS-Flottenortung in Vorbereitung
                    </h2>
                    <p className="text-xs font-mono text-hm-muted leading-relaxed max-w-xl mx-auto">
                        Dieses Modul wird derzeit an die OBD-II Tracker und Telematik-Hardware der Fahrzeugflotte angebunden.
                    </p>
                </div>

                {/* Planned Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left font-mono">
                    <div className="p-4 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule space-y-1.5">
                        <div className="flex items-center gap-1.5 text-hm-ink font-bold text-xs uppercase">
                            <Satellite className="w-3.5 h-3.5 text-hm-accent" />
                            <span>Live Ortung</span>
                        </div>
                        <p className="text-[11px] text-hm-muted leading-relaxed">
                            Echtzeit-Standort und Geschwindigkeitsüberwachung auf OpenStreetMap.
                        </p>
                    </div>

                    <div className="p-4 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule space-y-1.5">
                        <div className="flex items-center gap-1.5 text-hm-ink font-bold text-xs uppercase">
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Geofencing</span>
                        </div>
                        <p className="text-[11px] text-hm-muted leading-relaxed">
                            Automatischer Alarm beim Verlassen von Vorarlberg / Österreich oder unerlaubter Grenzüberfahrt.
                        </p>
                    </div>

                    <div className="p-4 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule space-y-1.5">
                        <div className="flex items-center gap-1.5 text-hm-ink font-bold text-xs uppercase">
                            <Navigation className="w-3.5 h-3.5 text-blue-500" />
                            <span>KM-Synchronisation</span>
                        </div>
                        <p className="text-[11px] text-hm-muted leading-relaxed">
                            Automatischer Abgleich des realen Kilometerstandes direkt aus dem Motorsteuergerät ins Fahrtenbuch.
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-hm-rule flex items-center justify-center gap-4 text-xs font-mono text-hm-muted">
                    <span className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-600" /> Integration aktiv
                    </span>
                    <span>·</span>
                    <span>Ansprechpartner: IT & Flottenmanagement</span>
                </div>
            </div>
        </div>
    );
}
