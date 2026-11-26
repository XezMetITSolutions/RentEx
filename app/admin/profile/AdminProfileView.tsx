'use client';

import { useState } from 'react';
import {
    User,
    Mail,
    Lock,
    Shield,
    ShieldCheck,
    Save,
    Loader2,
    Building2,
    Calendar,
    KeyRound,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { updateAdminProfile } from '@/app/actions/auth';
import { toast } from 'sonner';
import Link from 'next/link';

interface StaffProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    location: string;
    twoFactorEnabled: boolean;
    createdAt: string | null;
}

export default function AdminProfileView({ staff }: { staff: StaffProfile }) {
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState(staff.name);
    const [email, setEmail] = useState(staff.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData(e.currentTarget);
        try {
            const res = await updateAdminProfile(formData);
            if (res.success) {
                toast.success(res.message || 'Profil erfolgreich aktualisiert!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(res.error || 'Fehler beim Speichern');
            }
        } catch (err: any) {
            toast.error(err.message || 'Systemfehler');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-16 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header */}
            <div className="pb-6 border-b border-hm-rule">
                <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                    Mein Profil
                </h1>
                <p className="text-xs font-mono text-hm-muted mt-1 uppercase tracking-wider">
                    Persönliche Kontodaten, Login-E-Mail und Passwortsicherheit
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Snapshot Card */}
                <div className="bg-hm-paper p-6 rounded-[var(--hm-radius-card)] border border-hm-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[var(--hm-radius-input)] bg-hm-stage-ink flex items-center justify-center text-white font-mono text-xl font-bold">
                            {staff.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-hm-ink">{staff.name}</h2>
                                <span className="font-mono text-[10px] px-2 py-0.5 rounded-[var(--hm-radius-pill)] bg-hm-accent/10 text-hm-accent font-bold uppercase border border-hm-accent/20">
                                    {staff.role}
                                </span>
                            </div>
                            <p className="text-xs font-mono text-hm-muted flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" /> {staff.email}
                            </p>
                            <p className="text-xs font-mono text-hm-muted flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-hm-accent" /> {staff.location}
                            </p>
                        </div>
                    </div>

                    <div className="text-xs font-mono space-y-1 text-right self-end sm:self-auto">
                        <Link
                            href="/admin/settings/2fa"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper-2 hover:bg-hm-paper border border-hm-rule text-xs font-semibold uppercase tracking-wider text-hm-ink transition-colors"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>2FA: {staff.twoFactorEnabled ? 'Aktiviert' : 'Nicht aktiv'}</span>
                        </Link>
                    </div>
                </div>

                {/* Personal Data */}
                <div className="bg-hm-paper p-6 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted pb-2 border-b border-hm-rule flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-hm-accent" />
                        Stammdaten & Anmelde-E-Mail
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Vollständiger Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs text-hm-ink font-medium outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Login E-Mail-Adresse *
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div className="bg-hm-paper p-6 rounded-[var(--hm-radius-card)] border border-hm-rule space-y-4">
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-hm-muted pb-2 border-b border-hm-rule flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-hm-accent" />
                        Passwort ändern (optional)
                    </h3>
                    <p className="text-xs text-hm-muted">
                        Lassen Sie diese Felder leer, wenn Sie Ihr bestehendes Passwort behalten möchten.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Aktuelles Passwort
                            </label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Neues Passwort
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                minLength={8}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 8 Zeichen"
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-mono font-medium text-hm-muted">
                                Passwort bestätigen
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                minLength={8}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Min. 8 Zeichen"
                                className="w-full px-3.5 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink outline-none focus:ring-1 focus:ring-hm-accent"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-hm-ink text-hm-paper font-mono text-xs font-semibold uppercase tracking-wider rounded-[var(--hm-radius-input)] hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{saving ? 'Wird gespeichert…' : 'Änderungen speichern'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
