/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
'use client';

import {
    User,
    Moon,
    CheckCircle2,
    ChevronRight,
    Save,
    Loader2,
    FileText,
    Wallet,
    Zap,
    ExternalLink,
    Upload,
    ShieldCheck,
    Globe
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useTransition, useRef } from 'react';
import Image from 'next/image';
import { updateSystemSetting } from '@/app/actions';
import { registerKasseWithBMF } from '@/app/actions/admin';
import { toast } from 'sonner';

const sections = [
    { id: 'profile', label: 'Profil & Stammdaten', icon: User },
    { id: 'appearance', label: 'Erscheinungsbild', icon: Moon },
    { id: 'registrierkassa', label: 'Registrierkassa (BMF)', icon: Wallet },
];

interface SettingsViewProps {
    initialSettings: Record<string, string>;
}

export default function SettingsView({ initialSettings }: SettingsViewProps) {
    const [activeSection, setActiveSection] = useState('profile');
    const [settings, setSettings] = useState(initialSettings);
    const [isPending, startTransition] = useTransition();
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = (key: string, value: string) => {
        startTransition(async () => {
            const result = await updateSystemSetting(key, value);
            if (result.success) {
                setSettings(prev => ({ ...prev, [key]: value }));
                toast.success('Einstellung gespeichert');
            } else {
                toast.error('Fehler beim Speichern');
            }
        });
    };

    const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            await updateSystemSetting('admin_firstname', formData.get('firstname') as string);
            await updateSystemSetting('admin_lastname', formData.get('lastname') as string);
            await updateSystemSetting('admin_email', formData.get('email') as string);

            setSettings(prev => ({
                ...prev,
                admin_firstname: formData.get('firstname') as string,
                admin_lastname: formData.get('lastname') as string,
                admin_email: formData.get('email') as string,
            }));

            toast.success('Profil erfolgreich gespeichert!');
        });
    };

    const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingPicture(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/admin/profile-picture/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.error || 'Upload-Fehler');
                return;
            }

            const data = await response.json();
            setSettings(prev => ({ ...prev, admin_profile_picture: data.imageUrl }));
            toast.success('Profilbild erfolgreich aktualisiert!');
        } catch (error) {
            console.error('Picture upload error:', error);
            toast.error('Fehler beim Hochladen des Bildes');
        } finally {
            setIsUploadingPicture(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            System · Einstellungen & Konfiguration
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Systemeinstellungen
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Administratorprofil, BMF FinanzOnline & Systemparameter
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row items-start">
                {/* Sidebar Nav */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule p-3 space-y-1">
                        <p className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-hm-muted">
                            Kategorien
                        </p>
                        {sections.map((item) => {
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={clsx(
                                        'flex w-full items-center justify-between rounded-[var(--hm-radius-input)] px-3 py-2 text-xs font-mono font-semibold transition-colors',
                                        isActive
                                            ? 'bg-hm-accent text-hm-accent-ink shadow-xs'
                                            : 'text-hm-muted hover:bg-hm-paper-2 hover:text-hm-ink'
                                    )}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        <span>{item.label}</span>
                                    </div>
                                    {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule p-3 space-y-1">
                        <p className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-hm-muted">
                            Systemmodule
                        </p>
                        <a
                            href="/admin/locations"
                            className="flex w-full items-center justify-between rounded-[var(--hm-radius-input)] px-3 py-2 text-xs font-mono text-hm-muted hover:bg-hm-paper-2 hover:text-hm-ink transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <Globe className="h-4 w-4 text-hm-muted" />
                                <span>Standorte</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </a>

                        <a
                            href="/admin/options"
                            className="flex w-full items-center justify-between rounded-[var(--hm-radius-input)] px-3 py-2 text-xs font-mono text-hm-muted hover:bg-hm-paper-2 hover:text-hm-ink transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <Zap className="h-4 w-4 text-hm-muted" />
                                <span>Zusatzoptionen</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </a>

                        <a
                            href="/admin/agb"
                            className="flex w-full items-center justify-between rounded-[var(--hm-radius-input)] px-3 py-2 text-xs font-mono text-hm-muted hover:bg-hm-paper-2 hover:text-hm-ink transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <FileText className="h-4 w-4 text-hm-muted" />
                                <span>AGB Versionen</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </a>

                        <a
                            href="/admin/settings/pdf-mapping"
                            className="flex w-full items-center justify-between rounded-[var(--hm-radius-input)] px-3 py-2 text-xs font-mono text-hm-muted hover:bg-hm-paper-2 hover:text-hm-ink transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <FileText className="h-4 w-4 text-hm-muted" />
                                <span>PDF Mapping</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </a>

                        <a
                            href="/admin/settings/2fa"
                            className="flex w-full items-center justify-between rounded-[var(--hm-radius-input)] px-3 py-2 text-xs font-mono text-hm-muted hover:bg-hm-paper-2 hover:text-hm-ink transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <ShieldCheck className="h-4 w-4 text-hm-muted" />
                                <span>Zwei-Faktor (2FA)</span>
                            </div>
                            <ChevronRight className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </div>

                {/* Main Settings Content */}
                <div className="flex-1 rounded-[var(--hm-radius-card)] bg-hm-paper border border-hm-rule p-6 lg:p-8">
                    {activeSection === 'profile' && (
                        <div className="space-y-6">
                            <div className="pb-4 border-b border-hm-rule">
                                <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">Profilinformationen</h2>
                                <p className="text-xs font-mono text-hm-muted uppercase tracking-wider mt-0.5">Administrator-Konto und Kontaktdaten</p>
                            </div>

                            <div className="flex items-center gap-5">
                                <div className="h-20 w-20 rounded-full bg-hm-paper-2 border border-hm-rule flex items-center justify-center overflow-hidden shrink-0">
                                    {settings['admin_profile_picture'] ? (
                                        <Image
                                            src={settings['admin_profile_picture']}
                                            alt="Profil"
                                            width={80}
                                            height={80}
                                            className="h-20 w-20 object-cover"
                                        />
                                    ) : (
                                        <span className="text-hm-ink font-mono text-xl font-bold">
                                            {settings['admin_firstname']?.[0] || 'A'}{settings['admin_lastname']?.[0] || 'D'}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingPicture}
                                        className="rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 hover:bg-hm-paper-3 px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-hm-ink disabled:opacity-50 flex items-center gap-2 transition-colors"
                                    >
                                        {isUploadingPicture ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Wird hochgeladen...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-3.5 w-3.5" />
                                                Bild ändern
                                            </>
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePictureUpload}
                                        className="hidden"
                                    />
                                    <p className="text-[10px] font-mono text-hm-muted">Max. 5MB (PNG/JPG)</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="grid gap-4 sm:grid-cols-2 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider">Vorname</label>
                                    <input
                                        type="text"
                                        name="firstname"
                                        defaultValue={settings['admin_firstname'] || 'Admin'}
                                        className="w-full rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 px-3 py-2 text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider">Nachname</label>
                                    <input
                                        type="text"
                                        name="lastname"
                                        defaultValue={settings['admin_lastname'] || 'User'}
                                        className="w-full rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 px-3 py-2 text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider">E-Mail</label>
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={settings['admin_email'] || 'info@rent-ex.at'}
                                        className="w-full rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 px-3 py-2 text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    />
                                </div>

                                <div className="sm:col-span-2 flex justify-end pt-3 border-t border-hm-rule">
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="rounded-[var(--hm-radius-input)] bg-hm-accent hover:bg-hm-accent-hover px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-hm-accent-ink disabled:opacity-50 flex items-center gap-2 transition-colors shadow-xs"
                                    >
                                        {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                        Speichern
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeSection === 'appearance' && (
                        <div className="space-y-6">
                            <div className="pb-4 border-b border-hm-rule">
                                <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">Erscheinungsbild</h2>
                                <p className="text-xs font-mono text-hm-muted uppercase tracking-wider mt-0.5">Farbschema & Anzeigeoptionen</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper-2 text-left space-y-2">
                                    <div className="h-16 rounded-[var(--hm-radius-input)] bg-white border border-hm-rule"></div>
                                    <span className="font-mono text-xs font-semibold text-hm-ink">Hell (Hallmark Paper)</span>
                                </div>
                                <div className="p-4 rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper-2 text-left space-y-2">
                                    <div className="h-16 rounded-[var(--hm-radius-input)] bg-[#141414] border border-hm-rule"></div>
                                    <span className="font-mono text-xs font-semibold text-hm-ink">Dunkel (Dark Mode)</span>
                                </div>
                                <div className="p-4 rounded-[var(--hm-radius-card)] border border-hm-accent bg-hm-paper-2 text-left space-y-2 relative">
                                    <div className="h-16 rounded-[var(--hm-radius-input)] bg-gradient-to-r from-white to-[#141414] border border-hm-rule"></div>
                                    <span className="font-mono text-xs font-semibold text-hm-ink">System</span>
                                    <div className="absolute top-3 right-3 text-hm-accent">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'registrierkassa' && (
                        <div className="space-y-6">
                            <div className="pb-4 border-b border-hm-rule">
                                <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">FinanzOnline & Registrierkassa (BMF)</h2>
                                <p className="text-xs font-mono text-hm-muted uppercase tracking-wider mt-0.5">Schnittstelle zum österreichischen Bundesministerium für Finanzen</p>
                            </div>

                            <div className="bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-card)] p-4 flex gap-3 text-hm-ink">
                                <Zap className="h-4 w-4 text-hm-accent shrink-0 mt-0.5" />
                                <div className="text-xs font-mono space-y-1">
                                    <p className="font-bold uppercase tracking-wider text-hm-ink">Einrichtungshinweis</p>
                                    <p className="text-hm-muted">
                                        Für die automatische RKSV-Signaturprüfung wird ein Webservice-Benutzer in FinanzOnline benötigt (Benutzerverwaltung &gt; Neuen Webservice-Benutzer anlegen).
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider">Teilnehmer-Identifikation (TID)</label>
                                    <input
                                        type="text"
                                        onBlur={(e) => handleSave('bmf_tid', e.target.value)}
                                        defaultValue={settings['bmf_tid'] || ''}
                                        placeholder="z.B. 12345678"
                                        className="w-full rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 px-3 py-2 text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider">Benutzer-Identifikation (BENID)</label>
                                    <input
                                        type="text"
                                        onBlur={(e) => handleSave('bmf_benid', e.target.value)}
                                        defaultValue={settings['bmf_benid'] || ''}
                                        placeholder="Webservice Benutzer"
                                        className="w-full rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 px-3 py-2 text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider">Webservice-PIN</label>
                                    <input
                                        type="password"
                                        onBlur={(e) => handleSave('bmf_pin', e.target.value)}
                                        defaultValue={settings['bmf_pin'] || ''}
                                        className="w-full rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 px-3 py-2 text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider">Modus</label>
                                    <select
                                        onChange={(e) => handleSave('bmf_mode', e.target.value)}
                                        defaultValue={settings['bmf_mode'] || 'T'}
                                        className="w-full rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 px-3 py-2 text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    >
                                        <option value="T">Testumgebung (T)</option>
                                        <option value="P">Produktivumgebung (P)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-hm-rule">
                                <h3 className="text-xs font-mono font-bold text-hm-ink uppercase tracking-wider mb-3">Registrierkassen-Parameter</h3>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider">Kassen-ID</label>
                                        <input
                                            type="text"
                                            onBlur={(e) => handleSave('bmf_kassen_id', e.target.value)}
                                            defaultValue={settings['bmf_kassen_id'] || 'K1'}
                                            className="w-full rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 px-3 py-2 text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider">AES-256 Schlüssel (Base64)</label>
                                        <input
                                            type="text"
                                            onBlur={(e) => handleSave('bmf_aes_key', e.target.value)}
                                            defaultValue={settings['bmf_aes_key'] || ''}
                                            placeholder="Automatisch generieren..."
                                            className="w-full rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 px-3 py-2 text-xs font-mono text-hm-ink focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-hm-rule flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "w-9 h-9 rounded-[var(--hm-radius-input)] flex items-center justify-center shrink-0 border",
                                        settings['bmf_registered_at']
                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                            : "bg-hm-paper-2 border-hm-rule text-hm-muted"
                                    )}>
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono font-bold uppercase tracking-wider text-hm-ink">
                                            Status: {settings['bmf_registered_at'] ? 'Registriert' : 'Nicht registriert'}
                                        </p>
                                        <p className="text-[11px] font-mono text-hm-muted">
                                            {settings['bmf_registered_at']
                                                ? `Zuletzt synchronisiert: ${new Date(settings['bmf_registered_at']).toLocaleString('de-AT')}`
                                                : 'Kasse muss initial beim BMF angemeldet werden.'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (confirm('Registrierkasse jetzt beim BMF anmelden?')) {
                                            startTransition(async () => {
                                                const res = await registerKasseWithBMF();
                                                if (res.success) {
                                                    toast.success(res.message);
                                                    window.location.reload();
                                                } else {
                                                    toast.error(res.error);
                                                }
                                            });
                                        }
                                    }}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50"
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                                    Jetzt beim BMF registrieren
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
