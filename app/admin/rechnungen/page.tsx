import React from 'react';
import Link from 'next/link';
import { Hammer, Clock, ArrowLeft, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminRechnungenPage() {
    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-16 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-hm-rule">
                <div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Rechnungsverwaltung
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider mt-1">
                        Automatisierte Fakturierung & Buchhaltungs-Export
                    </p>
                </div>
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule px-4 py-2 text-xs font-semibold uppercase tracking-wider text-hm-ink transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 text-hm-muted" /> Zurück zum Dashboard
                </Link>
            </div>

            {/* In Bearbeitung Banner Stage */}
            <div className="rounded-[var(--hm-radius-card)] border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.06] to-transparent p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-sm space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 grid place-items-center mx-auto shadow-inner">
                    <Hammer className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 text-xs font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" /> Modul in Bearbeitung
                    </span>
                    <h2 className="text-2xl font-bold text-hm-ink">
                        Rechnungswesen wird aktuell überarbeitet
                    </h2>
                    <p className="text-sm text-hm-ink-2 leading-relaxed max-w-md mx-auto">
                        Dieses Modul wird an das österreichische Finanzamts-Format (RKSV-konform, USt.-Aufschlüsselung und automatischer PDF-Export) angepasst und steht in Kürze zur Verfügung.
                    </p>
                </div>

                <div className="pt-6 border-t border-amber-500/15 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs text-hm-ink-2">
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-amber-500/10">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Automatische Generierung nach Buchungsabschluss aktiv im Hintergrund.</span>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-amber-500/10">
                        <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>Monatlicher CSV- & DATEV-Export wird integriert.</span>
                    </div>
                </div>

                <div className="pt-4">
                    <Link
                        href="/admin/reservations"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                    >
                        Zu den Reservierungen
                    </Link>
                </div>
            </div>
        </div>
    );
}
