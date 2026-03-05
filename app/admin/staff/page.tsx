"use client";

import { useState, useEffect } from "react";
import {
    Users, Plus, Edit2, Trash2, Shield, Check, X,
    MapPin, Mail, Key, ToggleLeft, ToggleRight, AlertCircle
} from "lucide-react";

const ROLES = ["SUPERADMIN", "MANAGER", "AGENT", "DRIVER"] as const;
type Role = typeof ROLES[number];

const ROLE_COLORS: Record<Role, string> = {
    SUPERADMIN: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    MANAGER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    AGENT: "bg-green-500/10 text-green-400 border-green-500/20",
    DRIVER: "bg-orange-500/10 text-orange-400 border-orange-500/20",
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
    const [formData, setFormData] = useState({ name: "", email: "", role: "AGENT" as Role, locationId: "", password: "", isActive: true });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        const [s, l] = await Promise.all([
            fetch("/api/admin/staff").then(r => r.json()),
            fetch("/api/admin/locations").then(r => r.json()).catch(() => []),
        ]);
        setStaff(Array.isArray(s) ? s : []);
        setLocations(Array.isArray(l) ? l : []);
        setLoading(false);
    }

    function openNew() {
        setEditTarget(null);
        setFormData({ name: "", email: "", role: "AGENT", locationId: "", password: "", isActive: true });
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
        <div className="p-6 md:p-8 min-h-screen bg-gray-50 dark:bg-black/50">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="w-6 h-6 text-red-500" />
                        Mitarbeiterverwaltung
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        Personal, Rollen und Zugänge verwalten
                    </p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Mitarbeiter hinzufügen
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {ROLES.map(role => (
                    <div key={role} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{role}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {staff.filter(s => s.role === role).length}
                        </p>
                    </div>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Laden...</div>
            ) : (
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-white/10">
                                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rolle</th>
                                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Standort</th>
                                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Letzter Login</th>
                                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((s) => (
                                <tr key={s.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <Mail className="w-3 h-3" />
                                            {s.email}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_COLORS[s.role]}`}>
                                            <Shield className="w-3 h-3 mr-1" />
                                            {s.role}
                                        </span>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        {s.location ? (
                                            <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                <MapPin className="w-3 h-3" />
                                                {s.location.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <span className="text-xs text-gray-500">
                                            {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString("de-AT") : "Noch nie"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => toggleActive(s)} title="Status umschalten">
                                            {s.isActive ? (
                                                <ToggleRight className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 justify-end">
                                            <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                                <Edit2 className="w-4 h-4 text-gray-500" />
                                            </button>
                                            <button onClick={() => deleteStaff(s.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {staff.length === 0 && (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                            Noch keine Mitarbeiter hinzugefügt.
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editTarget ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                                <input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Max Mustermann" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-Mail *</label>
                                <input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="max@rentex.at" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rolle *</label>
                                <select value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value as Role }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none">
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Standort</label>
                                <select value={formData.locationId} onChange={e => setFormData(p => ({ ...p, locationId: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none">
                                    <option value="">Kein Standort</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                    <Key className="w-3 h-3" />
                                    {editTarget ? "Neues Passwort (leer lassen = ungeändert)" : "Passwort *"}
                                </label>
                                <input type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="••••••••" />
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-white/10">
                            <button onClick={() => setShowForm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                Abbrechen
                            </button>
                            <button onClick={save} disabled={saving}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                {saving ? "Speichern..." : <><Check className="w-4 h-4" />{editTarget ? "Aktualisieren" : "Erstellen"}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
