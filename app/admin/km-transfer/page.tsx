"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, ArrowRight, Search, TrendingUp, AlertCircle, History } from "lucide-react";

interface KmBalance {
    id: number;
    customerId: number;
    balance: number;
    customer: { id: number; firstName: string; lastName: string; email: string };
}

interface KmTransferRecord {
    id: number;
    fromId: number;
    toId: number;
    amount: number;
    note: string | null;
    createdAt: string;
    from: { id: number; firstName: string; lastName: string };
    to: { id: number; firstName: string; lastName: string };
}

export default function KmTransferPage() {
    const [balances, setBalances] = useState<KmBalance[]>([]);
    const [history, setHistory] = useState<KmTransferRecord[]>([]);
    const [historyCustomerId, setHistoryCustomerId] = useState("");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({ fromId: "", toId: "", amount: "", note: "" });
    const [transferring, setTransferring] = useState(false);
    const [transferError, setTransferError] = useState("");
    const [transferSuccess, setTransferSuccess] = useState("");

    useEffect(() => { loadBalances(); }, []);

    async function loadBalances() {
        setLoading(true);
        const data = await fetch("/api/admin/km-transfer").then(r => r.json());
        setBalances(Array.isArray(data) ? data : []);
        setLoading(false);
    }

    const loadHistory = useCallback(async () => {
        if (!historyCustomerId) return;
        const data = await fetch(`/api/admin/km-transfer?customerId=${historyCustomerId}`).then(r => r.json());
        setHistory(data.history ?? []);
    }, [historyCustomerId]);

    useEffect(() => { loadHistory(); }, [loadHistory]);

    const filteredBalances = balances.filter(b =>
        !search || `${b.customer.firstName} ${b.customer.lastName} ${b.customer.email}`.toLowerCase().includes(search.toLowerCase())
    );

    async function doTransfer() {
        setTransferError(""); setTransferSuccess("");
        if (!form.fromId || !form.toId || !form.amount) {
            setTransferError("Bitte alle Pflichtfelder ausfüllen."); return;
        }
        setTransferring(true);
        const res = await fetch("/api/admin/km-transfer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fromId: parseInt(form.fromId), toId: parseInt(form.toId), amount: parseInt(form.amount), note: form.note }),
        });
        const data = await res.json();
        setTransferring(false);
        if (!res.ok) { setTransferError(data.error || "Fehler"); return; }
        setTransferSuccess(`✅ ${form.amount} km erfolgreich übertragen!`);
        setForm({ fromId: "", toId: "", amount: "", note: "" });
        loadBalances();
    }

    return (
        <div className="p-6 md:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    Kilometre-Guthaben & Transfer
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Freie Kilometer zwischen Kunden übertragen</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transfer Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-yellow-500" />
                            Transfer durchführen
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Von (Kunden-ID) *</label>
                                <input type="number" value={form.fromId} onChange={e => setForm(p => ({ ...p, fromId: e.target.value }))}
                                    placeholder="z.B. 42"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
                            </div>
                            <div className="flex justify-center"><ArrowRight className="w-5 h-5 text-yellow-500" /></div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">An (Kunden-ID) *</label>
                                <input type="number" value={form.toId} onChange={e => setForm(p => ({ ...p, toId: e.target.value }))}
                                    placeholder="z.B. 17"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Kilometre *</label>
                                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                                    placeholder="z.B. 500"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Notiz</label>
                                <input type="text" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                                    placeholder="Grund des Transfers"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none" />
                            </div>
                            {transferError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{transferError}
                                </div>
                            )}
                            {transferSuccess && (
                                <div className="p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-xs">
                                    {transferSuccess}
                                </div>
                            )}
                            <button onClick={doTransfer} disabled={transferring}
                                className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-semibold rounded-xl text-sm transition-colors">
                                {transferring ? "Übertrage..." : "Transfer ausführen"}
                            </button>
                        </div>

                        {/* History lookup */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Transfer-Historie
                            </h3>
                            <input type="number" value={historyCustomerId} onChange={e => setHistoryCustomerId(e.target.value)}
                                placeholder="Kunden-ID eingeben"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none mb-3" />
                            {history.length > 0 && (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {history.map(h => (
                                        <div key={h.id} className="p-3 bg-gray-50 dark:bg-black/20 rounded-xl text-xs">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                    {h.from.firstName} → {h.to.firstName}
                                                </span>
                                                <span className="font-bold text-yellow-500">{h.amount} km</span>
                                            </div>
                                            {h.note && <p className="text-gray-500 mt-0.5">{h.note}</p>}
                                            <p className="text-gray-400 mt-0.5">{new Date(h.createdAt).toLocaleDateString("de-AT")}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Balance Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center gap-3">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Kunden suchen..."
                                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none" />
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {balances.length} Kunden
                            </div>
                        </div>
                        {loading ? (
                            <div className="text-center py-16 text-gray-500">Laden...</div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-white/10">
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kunde</th>
                                        <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kunden-ID</th>
                                        <th className="text-right p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guthaben</th>
                                        <th className="p-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBalances.map(b => (
                                        <tr key={b.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {b.customer.firstName} {b.customer.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">{b.customer.email}</div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">#{b.customer.id}</td>
                                            <td className="p-4 text-right">
                                                <span className={`font-bold text-sm ${b.balance > 0 ? "text-yellow-500" : "text-gray-400"}`}>
                                                    {b.balance.toLocaleString("de-AT")} km
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button onClick={() => { setHistoryCustomerId(b.customer.id.toString()); }}
                                                    className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                                    <History className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!loading && filteredBalances.length === 0 && (
                            <div className="text-center py-16 text-gray-500 text-sm">Keine Kunden mit km-Guthaben gefunden.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
