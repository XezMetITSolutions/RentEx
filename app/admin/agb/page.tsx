"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, CheckCircle, Send, Clock, AlertCircle, X, Eye } from "lucide-react";

interface AgbVersion {
    id: number;
    version: string;
    content: string;
    publishedAt: string;
    notifiedAt: string | null;
    isActive: boolean;
    createdAt: string;
}

export default function AgbPage() {
    const [versions, setVersions] = useState<AgbVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNew, setShowNew] = useState(false);
    const [previewContent, setPreviewContent] = useState<AgbVersion | null>(null);
    const [form, setForm] = useState({ version: "", content: "" });
    const [saving, setSaving] = useState(false);
    const [activating, setActivating] = useState<number | null>(null);

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        const data = await fetch("/api/admin/agb").then(r => r.json());
        setVersions(Array.isArray(data) ? data : []);
        setLoading(false);
    }

    async function create() {
        setSaving(true);
        await fetch("/api/admin/agb", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setSaving(false);
        setShowNew(false);
        setForm({ version: "", content: "" });
        load();
    }

    async function activate(id: number) {
        if (!confirm("Diese Version aktivieren und alle Kunden per E-Mail benachrichtigen?")) return;
        setActivating(id);
        const res = await fetch(`/api/admin/agb/${id}/activate`, { method: "POST" });
        const data = await res.json();
        setActivating(null);
        if (data.notifiedCustomers !== undefined) {
            alert(`✅ Version aktiviert! ${data.notifiedCustomers} Kunden wurden benachrichtigt.`);
        }
        load();
    }

    return (
        <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-500" />
                        AGB Versionen
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        Allgemeine Geschäftsbedingungen verwalten und Kunden benachrichtigen
                    </p>
                </div>
                <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors">
                    <Plus className="w-4 h-4" />
                    Neue Version
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Laden...</div>
            ) : (
                <div className="space-y-4">
                    {versions.map(v => (
                        <div key={v.id} className={`bg-white dark:bg-white/5 border rounded-2xl p-6 ${v.isActive ? "border-blue-500/40" : "border-gray-200 dark:border-white/10"}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    {v.isActive ? (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                                            <CheckCircle className="w-3.5 h-3.5" /> Aktiv
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 rounded-full text-xs">
                                            Inaktiv
                                        </span>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Version {v.version}</h3>
                                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Erstellt: {new Date(v.createdAt).toLocaleDateString("de-AT")}
                                            </span>
                                            {v.notifiedAt && (
                                                <span className="flex items-center gap-1 text-green-500">
                                                    <Send className="w-3 h-3" />
                                                    Benachrichtigt: {new Date(v.notifiedAt).toLocaleDateString("de-AT")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setPreviewContent(v)} className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                        <Eye className="w-3.5 h-3.5" />
                                        Vorschau
                                    </button>
                                    {!v.isActive && (
                                        <button
                                            onClick={() => activate(v.id)}
                                            disabled={activating === v.id}
                                            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                                        >
                                            {activating === v.id ? (
                                                <><Clock className="w-3.5 h-3.5 animate-spin" />Aktiviere...</>
                                            ) : (
                                                <><Send className="w-3.5 h-3.5" />Aktivieren & Versenden</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl">
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 font-mono whitespace-pre-line">
                                    {v.content.substring(0, 300)}...
                                </p>
                            </div>
                        </div>
                    ))}
                    {versions.length === 0 && (
                        <div className="text-center py-20 text-gray-500">Noch keine AGB-Versionen vorhanden.</div>
                    )}
                </div>
            )}

            {/* New Version Modal */}
            {showNew && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Neue AGB-Version</h2>
                            <button onClick={() => setShowNew(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Versionsnummer *</label>
                                <input value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))}
                                    placeholder="z.B. 3.0" className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AGB-Inhalt *</label>
                                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                                    rows={12} placeholder="§ 1 Geltungsbereich..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono resize-none" />
                            </div>
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-white/10">
                            <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Abbrechen</button>
                            <button onClick={create} disabled={saving || !form.version || !form.content} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                                {saving ? "Speichern..." : "Version erstellen"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewContent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AGB Version {previewContent.version}</h2>
                            <button onClick={() => setPreviewContent(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{previewContent.content}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
