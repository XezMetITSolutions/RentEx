/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
"use client";

import { useState, useEffect } from "react";
import {
    AlertTriangle, Plus, Edit2, Check, X, Car, FileText,
    Clock, DollarSign, Filter, Upload, Trash2, Loader2
} from "lucide-react";
import { detectStrafzettelData } from "@/lib/ocr";
import { toast } from "sonner";
import { clsx } from "clsx";

type Status = "OPEN" | "FORWARDED" | "PAID" | "DISPUTED";

const STATUS_CONFIG: Record<Status, { label: string; badgeClass: string }> = {
    OPEN: { label: "Offen", badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
    FORWARDED: { label: "Weitergeleitet", badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
    PAID: { label: "Bezahlt", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
    DISPUTED: { label: "Bestritten", badgeClass: "bg-hm-paper-2 text-hm-muted border-hm-rule" },
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
                    setForm(p => ({ 
                        ...p, 
                        plate: car ? car.plate : data.plate!, 
                        carId: car ? car.id.toString() : "" 
                    }));
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
                    issuedTime: data.time || p.issuedTime,
                    referenceNumber: data.referenceNumber || p.referenceNumber,
                    incidentLocation: data.incidentLocation || p.incidentLocation,
                    authority: data.authority || p.authority,
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
                toast.error(err.error || 'Fehler beim Speichern');
            }
        } catch (e) {
            console.error(e);
            toast.error('Ein unerwarteter Fehler ist aufgetreten');
        } finally {
            setSaving(false);
        }
    }

    const totalOpen = records.filter(r => r.status === "OPEN").reduce((s, r) => s + Number(r.amount ?? 0), 0);
    const totalPaid = records.filter(r => r.status === "PAID").reduce((s, r) => s + Number(r.amount ?? 0), 0);

    const filteredRecords = records.filter(r => {
        if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
        if (!searchQuery) return true;
        
        const q = searchQuery.toLowerCase();
        return (
            r.plate.toLowerCase().includes(q) ||
            r.referenceNumber?.toLowerCase().includes(q) ||
            (r.car.brand + " " + r.car.model).toLowerCase().includes(q) ||
            (r.rental?.customer.firstName + " " + r.rental?.customer.lastName).toLowerCase().includes(q)
        );
    });

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            Flotte · Bußgeld- & Strafenmanagement
                        </span>
                    </div>
                    <h1 className="hm-display text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Strafzettel & Bußgelder
                    </h1>
                    <p className="text-xs font-mono text-hm-muted uppercase tracking-wider">
                        Radar-, Park- und Anonymverfügungen mit OCR & Mieterzuordnung
                    </p>
                </div>
                <button 
                    onClick={openNew} 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Strafzettel erfassen
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Gesamte Fälle", value: records.length.toString(), icon: FileText },
                    { label: "Offene Fälle", value: records.filter(r => r.status === "OPEN").length.toString(), icon: AlertTriangle },
                    { label: "Offener Betrag", value: `€ ${totalOpen.toFixed(0)}`, icon: DollarSign },
                    { label: "Bezahlt gesamt", value: `€ ${totalPaid.toFixed(0)}`, icon: Check },
                ].map(stat => (
                    <div key={stat.label} className="bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-card)] p-4 sm:p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">{stat.label}</span>
                            <stat.icon className="w-4 h-4 text-hm-muted" />
                        </div>
                        <p className="hm-display text-2xl font-bold text-hm-ink mt-3 hm-tnum">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5 bg-hm-paper-2 rounded-[var(--hm-radius-input)] p-1 border border-hm-rule">
                    {["ALL", ...Object.keys(STATUS_CONFIG)].map(s => (
                        <button 
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={clsx(
                                "px-3 py-1.5 rounded-[calc(var(--hm-radius-input)-2px)] font-mono text-xs font-semibold uppercase tracking-wider transition-all",
                                statusFilter === s 
                                    ? "bg-hm-paper text-hm-ink shadow-xs border border-hm-rule" 
                                    : "text-hm-muted hover:text-hm-ink"
                            )}
                        >
                            {s === "ALL" ? "Alle" : STATUS_CONFIG[s as Status].label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hm-muted" />
                    <input 
                        type="text" 
                        placeholder="Kennzeichen, Mieter, Aktenzahl..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-input)] text-xs font-mono text-hm-ink placeholder:text-hm-muted focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                {loading ? (
                    <div className="text-center py-20 font-mono text-xs text-hm-muted uppercase tracking-wider">Laden...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-hm-paper-2 text-[11px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Kennzeichen</th>
                                    <th className="px-6 py-3 font-semibold">Datum & Zeit</th>
                                    <th className="px-6 py-3 font-semibold">Ort & Behörde</th>
                                    <th className="px-6 py-3 font-semibold">Mieter</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold text-right">Betrag</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {filteredRecords.map(r => (
                                    <tr key={r.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-hm-ink font-mono text-xs">{r.plate}</div>
                                            <div className="text-[11px] text-hm-muted font-mono">{r.car.brand} {r.car.model}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            <div className="text-hm-ink">{new Date(r.issuedDate).toLocaleDateString("de-AT")}</div>
                                            {r.issuedTime && <div className="text-[11px] text-hm-muted flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{r.issuedTime}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-hm-ink font-medium">{r.incidentLocation ?? "—"}</div>
                                            {r.authority && <div className="text-[11px] font-mono text-hm-muted">{r.authority}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {r.rental ? (
                                                <div>
                                                    <div className="text-xs font-semibold text-hm-ink">
                                                        {r.rental.customer.firstName} {r.rental.customer.lastName}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-hm-muted">{r.rental.contractNumber ?? `#${r.rental.id}`}</div>
                                                </div>
                                            ) : <span className="text-[11px] font-mono text-hm-muted italic">Kein Mieter</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                'inline-flex items-center px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] text-[10px] font-mono font-bold uppercase tracking-wider border',
                                                STATUS_CONFIG[r.status].badgeClass
                                            )}>
                                                {STATUS_CONFIG[r.status].label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-hm-ink text-right hm-tnum">
                                            {r.amount != null ? `€ ${Number(r.amount).toFixed(2)}` : "—"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => openEdit(r)} 
                                                className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && filteredRecords.length === 0 && (
                    <div className="text-center py-16 font-mono text-xs text-hm-muted uppercase tracking-wider">
                        Keine Strafzettel gefunden.
                    </div>
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-hm-ink/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-xl w-full max-w-lg border border-hm-rule text-hm-ink max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-hm-rule sticky top-0 bg-hm-paper z-10">
                            <h2 className="hm-display text-sm font-bold text-hm-ink tracking-tight">
                                {editTarget ? "Strafzettel bearbeiten" : "Neuer Strafzettel"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-1 text-hm-muted hover:text-hm-ink transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Car Selection */}
                            <div>
                                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Fahrzeug (Kennzeichen) *</label>
                                <input 
                                    type="text"
                                    list="car-plates"
                                    placeholder="Kennzeichen suchen..."
                                    value={form.plate}
                                    onChange={e => {
                                        const plate = e.target.value;
                                        const car = cars.find(c => c.plate === plate);
                                        setForm(p => ({ ...p, plate, carId: car ? car.id.toString() : "" }));
                                    }}
                                    className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                />
                                <datalist id="car-plates">
                                    {cars.map(c => (
                                        <option key={c.id} value={c.plate}>{c.brand} {c.model}</option>
                                    ))}
                                </datalist>
                                {!form.carId && form.plate.length > 0 && (
                                    <p className="text-[10px] font-mono text-red-600 mt-1">Fahrzeug nicht gefunden. Bitte aus der Liste wählen.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Tatdatum *</label>
                                    <input type="date" value={form.issuedDate}
                                        onChange={e => setForm(p => ({ ...p, issuedDate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Tatzeit</label>
                                    <input type="time" value={form.issuedTime}
                                        onChange={e => setForm(p => ({ ...p, issuedTime: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                                </div>
                            </div>

                            {/* Identified Rental */}
                            <div className="p-3.5 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-hm-muted">Identifizierter Mieter</span>
                                    {identifying && <Clock className="w-3 h-3 animate-spin text-hm-muted" />}
                                </div>
                                {identifiedRental ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-hm-paper border border-hm-rule flex items-center justify-center text-hm-ink">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-hm-ink">{identifiedRental.customer.firstName} {identifiedRental.customer.lastName}</p>
                                            <div className="mt-0.5">
                                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-hm-paper border border-hm-rule text-hm-ink-2">
                                                    Vertrag: {identifiedRental.contractNumber ?? `#${identifiedRental.id}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[11px] font-mono text-hm-muted italic">
                                        {identifying ? "Suche läuft..." : "Kein Mieter für diesen Zeitraum gefunden."}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Betrag (€)</label>
                                    <input type="number" value={form.amount}
                                        onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Status</label>
                                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Status }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors">
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
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">{f.label}</label>
                                    <input type={f.type} value={(form as any)[f.key]}
                                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors" />
                                </div>
                            ))}

                            {/* Service Fee Toggle */}
                            <div className="p-3.5 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded bg-hm-paper border border-hm-rule flex items-center justify-center text-hm-ink">
                                        <DollarSign className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-hm-ink">Bearbeitungsgebühr (25€)</p>
                                        <p className="text-[10px] font-mono text-hm-muted">Automatisch zur Miete hinzufügen</p>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, addServiceFee: !p.addServiceFee }))}
                                    className={clsx(
                                        "w-10 h-5 rounded-full transition-colors relative border border-hm-rule",
                                        form.addServiceFee ? 'bg-hm-accent' : 'bg-hm-paper-3'
                                    )}
                                >
                                    <div className={clsx(
                                        "absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all",
                                        form.addServiceFee ? 'left-5' : 'left-0.5'
                                    )} />
                                </button>
                            </div>

                            {/* File Upload Section */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider">Dokument (Foto / Scan)</label>
                                <div className={clsx(
                                    "border border-dashed rounded-[var(--hm-radius-input)] p-4 text-center transition-colors",
                                    selectedFile ? "border-hm-rule-strong bg-hm-paper-2" : "border-hm-rule hover:border-hm-rule-strong"
                                )}>
                                    {selectedFile ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5 truncate">
                                                <FileText className="w-4 h-4 text-hm-ink shrink-0" />
                                                <div className="truncate text-left font-mono">
                                                    <p className="text-xs font-medium text-hm-ink truncate">{selectedFile.name}</p>
                                                    <p className="text-[10px] text-hm-muted">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedFile(null)} className="p-1 text-hm-muted hover:text-red-600 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center gap-1.5 cursor-pointer py-2">
                                            <Upload className="w-5 h-5 text-hm-muted" />
                                            <p className="text-xs font-mono text-hm-muted">Klicken zum Hochladen (PDF / Bild)</p>
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
                                    <div className="space-y-1.5">
                                        {uploading && (
                                            <div className="flex items-center gap-2 text-xs font-mono text-hm-ink p-2 bg-hm-paper-2 rounded">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Dokument wird analysiert...
                                            </div>
                                        )}
                                        <button 
                                            type="button"
                                            onClick={() => analyzeFile()}
                                            disabled={uploading}
                                            className="w-full py-1.5 bg-hm-paper-2 hover:bg-hm-paper-3 text-hm-ink border border-hm-rule rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors"
                                        >
                                            Erneut per OCR analysieren
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2.5 p-5 border-t border-hm-rule bg-hm-paper">
                            <button 
                                onClick={() => setShowForm(false)} 
                                className="flex-1 px-4 py-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider hover:bg-hm-paper-2 transition-colors"
                            >
                                Abbrechen
                            </button>
                            <button 
                                onClick={save} 
                                disabled={saving} 
                                className="flex-1 px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                                {saving ? "Speichern..." : "Speichern"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
