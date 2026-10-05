/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
"use client";

import { useState, useEffect } from "react";
import {
    Users, Plus, Edit2, Trash2, Shield, Check, X,
    MapPin, Mail, Key, ToggleLeft, ToggleRight, AlertCircle
} from "lucide-react";
import { clsx } from "clsx";

const ROLES = ["ADMINISTRATOR", "SUPERADMIN", "FILIALLEITER", "MITARBEITER", "FAHRER"] as const;
type Role = typeof ROLES[number];

const ROLE_BADGES: Record<Role, string> = {
    ADMINISTRATOR: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    SUPERADMIN: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    FILIALLEITER: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    MITARBEITER: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    FAHRER: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
};

interface StaffMember {
    id: number;
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    locationId: number | null;
    location?: { id: number; name: string } | null;
    lastLoginAt: string | null;
    createdAt: string;
}

interface Location { id: number; name: string; }

export default function StaffPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
    const [formData, setFormData] = useState({ name: "", email: "", role: "MITARBEITER" as Role, locationId: "", password: "", isActive: true });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        const [s, l] = await Promise.all([
            fetch("/api/admin/staff").then(r => r.json()),
            fetch("/api/locations").then(r => r.json()).catch(() => []),
        ]);
        setStaff(Array.isArray(s) ? s : []);
        setLocations(Array.isArray(l) ? l : []);
        setLoading(false);
    }

    function openNew() {
        setEditTarget(null);
        setFormData({ name: "", email: "", role: "MITARBEITER", locationId: "", password: "", isActive: true });
        setError("");
        setShowForm(true);
    }

    function openEdit(s: StaffMember) {
        setEditTarget(s);
        setFormData({ name: s.name, email: s.email, role: s.role, locationId: s.locationId?.toString() ?? "", password: "", isActive: s.isActive });
        setError("");
        setShowForm(true);
    }

    async function save() {
        setSaving(true);
        setError("");
        try {
            const url = editTarget ? `/api/admin/staff/${editTarget.id}` : "/api/admin/staff";
            const method = editTarget ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Fehler"); return; }
            setShowForm(false);
            load();
        } finally {
            setSaving(false);
        }
    }

    async function deleteStaff(id: number) {
        if (!confirm("Mitarbeiter wirklich löschen?")) return;
        await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
        load();
    }

    async function toggleActive(s: StaffMember) {
        await fetch(`/api/admin/staff/${s.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...s, isActive: !s.isActive }),
        });
        load();
    }

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            System · Benutzer & Rollenrechte
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Mitarbeiterverwaltung
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Personal, Zugriffsberechtigungen & Standortzuweisungen
                    </p>
                </div>
                <button
                    onClick={openNew}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Mitarbeiter anlegen
                </button>
            </div>

            {/* Role distribution row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ROLES.map(role => (
                    <div key={role} className="bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-card)] p-4 sm:p-5 flex flex-col justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">{role}</span>
                        <p className="hm-display text-2xl font-bold text-hm-ink mt-3 hm-tnum">
                            {staff.filter(s => s.role === role).length}
                        </p>
                    </div>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20 font-mono text-xs text-hm-muted uppercase tracking-wider">Laden...</div>
            ) : (
                <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-hm-paper-2 text-[11px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Name & E-Mail</th>
                                    <th className="px-6 py-3 font-semibold">Rolle</th>
                                    <th className="px-6 py-3 font-semibold hidden md:table-cell">Standort</th>
                                    <th className="px-6 py-3 font-semibold hidden md:table-cell">Letzter Login</th>
                                    <th className="px-6 py-3 font-semibold">Aktiv</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {staff.map((s) => (
                                    <tr key={s.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-hm-ink">{s.name}</div>
                                            <div className="text-[11px] font-mono text-hm-muted flex items-center gap-1 mt-0.5">
                                                <Mail className="w-3 h-3 text-hm-muted" />
                                                {s.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] text-[10px] font-mono font-bold uppercase tracking-wider border',
                                                ROLE_BADGES[s.role]
                                            )}>
                                                <Shield className="w-3 h-3" />
                                                {s.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell text-xs font-mono text-hm-ink">
                                            {s.location ? (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-hm-muted" />
                                                    {s.location.name}
                                                </span>
                                            ) : (
                                                <span className="text-hm-muted">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell font-mono text-xs text-hm-muted">
                                            {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString("de-AT") : "Noch nie"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleActive(s)} title="Status umschalten" className="transition-opacity">
                                                {s.isActive ? (
                                                    <ToggleRight className="w-6 h-6 text-emerald-600" />
                                                ) : (
                                                    <ToggleLeft className="w-6 h-6 text-hm-muted" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button 
                                                    onClick={() => openEdit(s)} 
                                                    className="p-1.5 hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] text-hm-muted hover:text-hm-ink transition-colors"
                                                    title="Bearbeiten"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => deleteStaff(s.id)} 
                                                    className="p-1.5 hover:bg-red-500/10 rounded-[var(--hm-radius-input)] text-hm-muted hover:text-red-600 transition-colors"
                                                    title="Löschen"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {staff.length === 0 && (
                            <div className="text-center py-16 font-mono text-xs text-hm-muted uppercase tracking-wider">
                                Noch keine Mitarbeiter hinzugefügt.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-hm-ink/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-xl w-full max-w-md border border-hm-rule text-hm-ink overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-hm-rule bg-hm-paper">
                            <h2 className="hm-display text-sm font-bold text-hm-ink tracking-tight">
                                {editTarget ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-1 text-hm-muted hover:text-hm-ink transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); save(); }}>
                            <div className="p-5 space-y-4">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-[var(--hm-radius-input)] text-red-600 font-mono text-xs">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Name *</label>
                                    <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                        placeholder="Max Mustermann" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">E-Mail *</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                        placeholder="max@rent-ex.at" required />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Rolle *</label>
                                    <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value as Role }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors">
                                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Standort</label>
                                    <select value={formData.locationId} onChange={e => setFormData(p => ({ ...p, locationId: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors">
                                        <option value="">Alle Standorte</option>
                                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                        <Key className="w-3 h-3 text-hm-muted" />
                                        {editTarget ? "Neues Passwort (leer lassen = ungeändert)" : "Passwort *"}
                                    </label>
                                    <input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                        placeholder="••••••••" autoComplete="new-password" />
                                </div>
                            </div>

                            <div className="flex gap-2.5 p-5 border-t border-hm-rule bg-hm-paper">
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider hover:bg-hm-paper-2 transition-colors">
                                    Abbrechen
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover disabled:opacity-50 text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                                    {saving ? "Speichern..." : <><Check className="w-3.5 h-3.5" />{editTarget ? "Aktualisieren" : "Erstellen"}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
