"use client";

import { useState, useEffect } from "react";
import {
    AlertTriangle, Plus, Edit2, Check, X, Car, FileText,
    ExternalLink, Clock, DollarSign, Filter, User, Upload, Trash2, Loader2
} from "lucide-react";
import { detectStrafzettelData } from "@/lib/ocr";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState<StrafzettelRecord | null>(null);
    const [form, setForm] = useState({
        carId: "", rentalId: "", plate: "", issuedDate: "", issuedTime: "",
        incidentLocation: "", amount: "", authority: "", referenceNumber: "",
        notes: "", status: "OPEN", paidBy: "", addServiceFee: false,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
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
            status: r.status, paidBy: r.paidBy ?? "", addServiceFee: false,
        });
        setIdentifiedRental(r.rental);
        setSelectedFile(null);
        setShowForm(true);
    }

    function openNew() {
        setEditTarget(null);
        setForm({ carId: "", rentalId: "", plate: "", issuedDate: "", issuedTime: "", incidentLocation: "", amount: "", authority: "", referenceNumber: "", notes: "", status: "OPEN", paidBy: "", addServiceFee: true });
        setIdentifiedRental(null);
        setSelectedFile(null);
        setShowForm(true);
    }

    async function analyzeFile(file?: File) {
        const f = file || selectedFile;
        if (!f) return;
        setUploading(true);
        try {
            const data = await detectStrafzettelData(f);
            if (data) {
                if (data.plate) {
                    const car = cars.find(c => c.plate.toLowerCase().includes(data.plate!.toLowerCase()));
                    if (car) {
                        setForm(p => ({ ...p, carId: car.id.toString(), plate: car.plate }));
                    }
                }
                let formattedDate = "";
                if (data.date) {
                    const parts = data.date.split('.');
                    if (parts.length === 3) formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                setForm(p => ({ 
                    ...p, 
                    amount: data.amount || p.amount,
                    issuedDate: formattedDate || p.issuedDate,
                    referenceNumber: data.referenceNumber || p.referenceNumber,
                }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    }

    async function save() {
        setSaving(true);
        try {
            let documentUrl = editTarget?.documentUrl || null;

            // Upload file if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploadRes = await fetch('/api/admin/strafzettel/upload', {
                    method: 'POST',
                    body: formData
                });
                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    documentUrl = uploadData.url;
                } else {
                    console.error('Upload failed');
                }
            }

            const url = editTarget ? `/api/admin/strafzettel/${editTarget.id}` : "/api/admin/strafzettel";
            const method = editTarget ? "PUT" : "POST";
            const payload = { ...form, documentUrl };
            
            const res = await fetch(url, { 
                method, 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify(payload) 
            });

            if (res.ok) {
                setShowForm(false);
                load();
            } else {
                const err = await res.json();
                alert(err.error || 'Fehler beim Speichern');
            }
        } catch (e) {
            console.error(e);
            alert('Ein unerwarteter Fehler ist aufgetreten');
        } finally {
            setSaving(false);
        }
    }

    const totalOpen = records.filter(r => r.status === "OPEN").reduce((s, r) => s + (r.amount ?? 0), 0);
    const totalPaid = records.filter(r => r.status === "PAID").reduce((s, r) => s + (r.amount ?? 0), 0);

    const filteredRecords = records.filter(r => 
        r.plate.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    {["ALL", ...Object.keys(STATUS_CONFIG)].map(s => (
                        <button key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-red-600 text-white" : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"}`}>
                            {s === "ALL" ? "Alle" : STATUS_CONFIG[s as Status].label}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 max-w-sm">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Kennzeichen suchen..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all dark:text-white"
                    />
                </div>
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
                            {filteredRecords.map(r => (
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
                                            <div className="mt-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                                                    Vertrag: {identifiedRental.contractNumber ?? `#${identifiedRental.id}`}
                                                </span>
                                            </div>
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
                                    <input type={f.type} value={(form as any)[f.key]}
                                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                                </div>
                            ))}

                            {/* Service Fee Toggle */}
                            <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <DollarSign className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">Bearbeitungsgebühr (25€)</p>
                                        <p className="text-[10px] text-gray-500">Diese Gebühr automatisch zur Miete hinzufügen.</p>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, addServiceFee: !p.addServiceFee }))}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${form.addServiceFee ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.addServiceFee ? 'left-7' : 'left-1'}`} />
                                </button>
                                <input type="hidden" name="addServiceFee" value={form.addServiceFee ? "true" : "false"} />
                            </div>

                            {/* File Upload Section */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dokument (Foto/Scan)</label>
                                <div className={`border-2 border-dashed rounded-xl p-6 transition-all ${selectedFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-gray-300 dark:border-white/10 hover:border-red-500/50'}`}>
                                    {selectedFile ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-emerald-500" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{selectedFile.name}</p>
                                                    <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-red-500/10 text-red-500 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                                            <Upload className="w-8 h-8 text-gray-400" />
                                            <p className="text-xs text-gray-500">Klicken zum Hochladen oder Drag & Drop</p>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*,.pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] || null;
                                                    setSelectedFile(file);
                                                    if (file && file.type.startsWith('image/')) analyzeFile(file);
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                                {selectedFile && (
                                    <div className="space-y-2">
                                        {uploading && (
                                            <div className="flex items-center gap-2 text-blue-500 text-xs font-medium p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Dokument wird analysiert...
                                            </div>
                                        )}
                                        <button 
                                            type="button"
                                            onClick={() => analyzeFile()}
                                            disabled={uploading}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            ERNEUT ANALYSIEREN
                                        </button>
                                    </div>
                                )}
                            </div>
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
