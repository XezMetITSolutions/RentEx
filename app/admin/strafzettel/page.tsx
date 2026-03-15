"use client";

import { useState, useEffect } from "react";
import {
    AlertTriangle, Plus, Edit2, Check, X, Car, FileText,
    ExternalLink, Clock, DollarSign, Filter, User
} from "lucide-react";

type Status = "OPEN" | "FORWARDED" | "PAID" | "DISPUTED";

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
    OPEN: { label: "Offen", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    FORWARDED: { label: "Weitergeleitet", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    PAID: { label: "Bezahlt", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    DISPUTED: { label: "Bestritten", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
};

interface StrafzettelRecord {
    id: number;
    carId: number;
    rentalId: number | null;
    plate: string;
    issuedDate: string;
    issuedTime: string | null;
    incidentLocation: string | null;
    amount: number | null;
    authority: string | null;
    referenceNumber: string | null;
    status: Status;
    forwardedToCustomerAt: string | null;
    paidAt: string | null;
    paidBy: string | null;
    notes: string | null;
    documentUrl: string | null;
    car: { id: number; brand: string; model: string; plate: string };
    rental: { id: number; contractNumber: string | null; customer: { id: number; firstName: string; lastName: string; email: string } } | null;
}

export default function StrafzettelPage() {
    const [records, setRecords] = useState<StrafzettelRecord[]>([]);
    const [cars, setCars] = useState<{ id: number; plate: string; brand: string; model: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState<StrafzettelRecord | null>(null);
    const [form, setForm] = useState({
        carId: "", rentalId: "", plate: "", issuedDate: "", issuedTime: "",
        incidentLocation: "", amount: "", authority: "", referenceNumber: "",
        notes: "", status: "OPEN", paidBy: "",
    });
    const [saving, setSaving] = useState(false);
    const [identifiedRental, setIdentifiedRental] = useState<any>(null);
    const [identifying, setIdentifying] = useState(false);

    useEffect(() => { load(); loadCars(); }, [statusFilter]);

    async function load() {
        setLoading(true);
        const url = `/api/admin/strafzettel${statusFilter !== "ALL" ? `?status=${statusFilter}` : ""}`;
        const data = await fetch(url).then(r => r.json());
        setRecords(Array.isArray(data) ? data : []);
        setLoading(false);
    }

    async function loadCars() {
        const data = await fetch("/api/admin/strafzettel/cars").then(r => r.json());
        setCars(data);
    }

    async function identifyRental(cid: string, d: string, t: string) {
        if (!cid || !d) return;
        setIdentifying(true);
        try {
            const url = `/api/admin/strafzettel/lookup?carId=${cid}&date=${d}${t ? `&time=${t}` : ""}`;
            const res = await fetch(url);
            if (res.ok) {
                const rental = await res.json();
                setIdentifiedRental(rental);
                setForm(p => ({ ...p, rentalId: rental.id.toString() }));
            } else {
                setIdentifiedRental(null);
                setForm(p => ({ ...p, rentalId: "" }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIdentifying(false);
        }
    }

    // Effect to auto-identify when car, date or time changes
    useEffect(() => {
        if (form.carId && form.issuedDate) {
            const timer = setTimeout(() => {
                identifyRental(form.carId, form.issuedDate, form.issuedTime);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [form.carId, form.issuedDate, form.issuedTime]);

    function openEdit(r: StrafzettelRecord) {
        setEditTarget(r);
        setForm({
            carId: r.carId.toString(), rentalId: r.rentalId?.toString() ?? "",
            plate: r.plate, issuedDate: r.issuedDate.split("T")[0],
            issuedTime: r.issuedTime ?? "", incidentLocation: r.incidentLocation ?? "",
            amount: r.amount?.toString() ?? "", authority: r.authority ?? "",
            referenceNumber: r.referenceNumber ?? "", notes: r.notes ?? "",
            status: r.status, paidBy: r.paidBy ?? "",
        });
        setIdentifiedRental(r.rental);
        setShowForm(true);
    }

    function openNew() {
        setEditTarget(null);
        setForm({ carId: "", rentalId: "", plate: "", issuedDate: "", issuedTime: "", incidentLocation: "", amount: "", authority: "", referenceNumber: "", notes: "", status: "OPEN", paidBy: "" });
        setIdentifiedRental(null);
        setShowForm(true);
    }

    async function save() {
        setSaving(true);
        const url = editTarget ? `/api/admin/strafzettel/${editTarget.id}` : "/api/admin/strafzettel";
        const method = editTarget ? "PUT" : "POST";
        await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        setSaving(false);
        setShowForm(false);
        load();
    }

    const totalOpen = records.filter(r => r.status === "OPEN").reduce((s, r) => s + (r.amount ?? 0), 0);
    const totalPaid = records.filter(r => r.status === "PAID").reduce((s, r) => s + (r.amount ?? 0), 0);

    return (
        <div className="p-6 md:p-8 min-h-screen bg-gray-50 dark:bg-black/50">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        Strafzettel & Bußgelder
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        Radar-, Park- und sonstige Strafen verwalten
                    </p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors text-sm">
                    <Plus className="w-4 h-4" />
                    Strafzettel erfassen
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Gesamt", value: records.length, icon: FileText, color: "text-gray-400" },
                    { label: "Offen", value: records.filter(r => r.status === "OPEN").length, icon: AlertTriangle, color: "text-red-400" },
                    { label: "Offener Betrag", value: `€ ${totalOpen.toFixed(0)}`, icon: DollarSign, color: "text-red-400" },
                    { label: "Bezahlt gesamt", value: `€ ${totalPaid.toFixed(0)}`, icon: Check, color: "text-green-400" },
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-gray-400" />
                {["ALL", ...Object.keys(STATUS_CONFIG)].map(s => (
                    <button key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-red-600 text-white" : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"}`}>
                        {s === "ALL" ? "Alle" : STATUS_CONFIG[s as Status].label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="text-center py-20 text-gray-500">Laden...</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-white/10">
                                {["Kennzeichen", "Datum", "Ort & Behörde", "Betrag", "Mieter", "Status", ""].map(h => (
                                    <th key={h} className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Car className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{r.plate}</div>
                                                <div className="text-xs text-gray-500">{r.car.brand} {r.car.model}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-900 dark:text-white">{new Date(r.issuedDate).toLocaleDateString("de-AT")}</div>
                                        {r.issuedTime && <div className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{r.issuedTime}</div>}
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-gray-900 dark:text-white">{r.incidentLocation ?? "—"}</div>
                                        {r.authority && <div className="text-xs text-gray-500">{r.authority}</div>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`font-semibold text-sm ${r.status === "OPEN" ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>
                                            {r.amount != null ? `€ ${Number(r.amount).toFixed(2)}` : "—"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {r.rental ? (
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {r.rental.customer.firstName} {r.rental.customer.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">{r.rental.contractNumber ?? `#${r.rental.id}`}</div>
                                            </div>
                                        ) : <span className="text-xs text-gray-400">Kein Mieter</span>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[r.status].color}`}>
                                            {STATUS_CONFIG[r.status].label}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && records.length === 0 && (
                    <div className="text-center py-16 text-gray-500">Keine Strafzettel gefunden.</div>
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-zinc-900 z-10">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editTarget ? "Strafzettel bearbeiten" : "Neuer Strafzettel"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Car/Plate Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fahrzeug (Kennzeichen) *</label>
                                <select 
                                    value={form.carId}
                                    onChange={e => {
                                        const cid = e.target.value;
                                        const car = cars.find(c => c.id.toString() === cid);
                                        setForm(p => ({ ...p, carId: cid, plate: car?.plate ?? "" }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option value="">Fahrzeug auswählen...</option>
                                    {cars.map(c => (
                                        <option key={c.id} value={c.id}>{c.plate} ({c.brand} {c.model})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tatdatum *</label>
                                    <input type="date" value={form.issuedDate}
                                        onChange={e => setForm(p => ({ ...p, issuedDate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tatzeit</label>
                                    <input type="time" value={form.issuedTime}
                                        onChange={e => setForm(p => ({ ...p, issuedTime: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                            </div>

                            {/* Identified Rental Display */}
                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Identifizierter Mieter</span>
                                    {identifying && <Clock className="w-3 h-3 animate-spin text-blue-500" />}
                                </div>
                                {identifiedRental ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{identifiedRental.customer.firstName} {identifiedRental.customer.lastName}</p>
                                            <p className="text-xs text-gray-500">Vertrag: {identifiedRental.contractNumber ?? `#${identifiedRental.id}`}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">
                                        {identifying ? "Suche läuft..." : "Kein Mieter für diesen Zeitraum gefunden."}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Betrag (€)</label>
                                    <input type="number" value={form.amount}
                                        onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none">
                                        {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {[
                                { label: "Tatort", key: "incidentLocation", type: "text" },
                                { label: "Behörde", key: "authority", type: "text" },
                                { label: "Aktenzeichen", key: "referenceNumber", type: "text" },
                                { label: "Notizen", key: "notes", type: "text" },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                                    <input type={f.type} value={(form as Record<string, string>)[f.key]}
                                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-white/10">
                            <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Abbrechen</button>
                            <button onClick={save} disabled={saving} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
                                {saving ? "Speichern..." : "Speichern"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
