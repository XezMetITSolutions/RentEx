/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
"use client";

import { useState, useEffect, useMemo } from "react";
import {
    AlertTriangle, Plus, Edit2, Check, X, Car, FileText,
    Clock, DollarSign, Upload, Trash2, Loader2, Download,
    Phone, Mail, Eye, ExternalLink, ChevronDown, CheckCircle2,
    Copy, Printer, ShieldAlert
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
    rental: {
        id: number;
        contractNumber: string | null;
        customer: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            phone?: string | null;
            address?: string | null;
            city?: string | null;
            postalCode?: string | null;
            country?: string | null;
            licenseNumber?: string | null;
            dateOfBirth?: string | null;
        };
    } | null;
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
        notes: "", status: "OPEN" as Status, paidBy: "", addServiceFee: false,
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [identifiedRental, setIdentifiedRental] = useState<any>(null);
    const [identifying, setIdentifying] = useState(false);

    // Document Lightbox
    const [viewingDocument, setViewingDocument] = useState<{ url: string; title: string } | null>(null);

    // Delete Record Modal
    const [recordToDelete, setRecordToDelete] = useState<StrafzettelRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Lenkerauskunft Modal
    const [lenkerauskunftRecord, setLenkerauskunftRecord] = useState<StrafzettelRecord | null>(null);

    // In-line Quick Status Switcher
    const [activeStatusMenuId, setActiveStatusMenuId] = useState<number | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    useEffect(() => {
        load();
        loadCars();
    }, [statusFilter]);

    async function load() {
        setLoading(true);
        const url = `/api/admin/strafzettel${statusFilter !== "ALL" ? `?status=${statusFilter}` : ""}`;
        try {
            const data = await fetch(url).then(r => r.json());
            setRecords(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            toast.error("Fehler beim Laden der Strafzettel");
        } finally {
            setLoading(false);
        }
    }

    async function loadCars() {
        try {
            const data = await fetch("/api/admin/strafzettel/cars").then(r => r.json());
            setCars(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
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
            carId: r.carId.toString(),
            rentalId: r.rentalId?.toString() ?? "",
            plate: r.plate,
            issuedDate: r.issuedDate.split("T")[0],
            issuedTime: r.issuedTime ?? "",
            incidentLocation: r.incidentLocation ?? "",
            amount: r.amount?.toString() ?? "",
            authority: r.authority ?? "",
            referenceNumber: r.referenceNumber ?? "",
            notes: r.notes ?? "",
            status: r.status,
            paidBy: r.paidBy ?? "",
            addServiceFee: false,
        });
        setIdentifiedRental(r.rental);
        setSelectedFile(null);
        setShowForm(true);
    }

    function openNew() {
        setEditTarget(null);
        setForm({
            carId: "",
            rentalId: "",
            plate: "",
            issuedDate: new Date().toISOString().split("T")[0],
            issuedTime: "",
            incidentLocation: "",
            amount: "",
            authority: "",
            referenceNumber: "",
            notes: "",
            status: "OPEN",
            paidBy: "",
            addServiceFee: true,
        });
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
                        carId: car ? car.id.toString() : "",
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
                toast.success("Daten erfolgreich aus Dokument erkannt!");
            }
        } catch (e) {
            console.error(e);
            toast.error("OCR Erkennung fehlgeschlagen");
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
                    body: formData,
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
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowForm(false);
                toast.success(editTarget ? "Strafzettel aktualisiert" : "Strafzettel erfolgreich erfasst");
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

    // In-line Quick Status Change
    async function handleQuickStatusChange(recordId: number, newStatus: Status) {
        setActiveStatusMenuId(null);
        setUpdatingStatusId(recordId);

        // Optimistic update
        setRecords(prev =>
            prev.map(r => (r.id === recordId ? { ...r, status: newStatus } : r))
        );

        try {
            const res = await fetch(`/api/admin/strafzettel/${recordId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                toast.success(`Status auf "${STATUS_CONFIG[newStatus].label}" gesetzt`);
            } else {
                toast.error("Fehler beim Aktualisieren des Status");
                load();
            }
        } catch {
            toast.error("Netzwerkfehler");
            load();
        } finally {
            setUpdatingStatusId(null);
        }
    }

    // Delete Record
    async function handleDeleteRecord() {
        if (!recordToDelete) return;
        setIsDeleting(true);

        try {
            const res = await fetch(`/api/admin/strafzettel/${recordToDelete.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Strafzettel gelöscht.");
                setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
                setRecordToDelete(null);
            } else {
                toast.error("Fehler beim Löschen des Strafzettels");
            }
        } catch {
            toast.error("Netzwerkfehler beim Löschen");
        } finally {
            setIsDeleting(false);
        }
    }

    // CSV Export
    function handleExportCSV() {
        if (filteredRecords.length === 0) {
            toast.error("Keine Strafzettel zum Exportieren vorhanden.");
            return;
        }

        const headers = [
            "ID",
            "Kennzeichen",
            "Fahrzeug",
            "Tatdatum",
            "Tatzeit",
            "Tatort",
            "Behoerde",
            "Aktenzeichen",
            "Mieter",
            "Vertragsnummer",
            "Betrag (EUR)",
            "Status",
            "Notizen"
        ];

        const rows = filteredRecords.map(r => [
            r.id,
            `"${r.plate}"`,
            `"${r.car.brand} ${r.car.model}"`,
            r.issuedDate ? r.issuedDate.split("T")[0] : "",
            `"${r.issuedTime || ""}"`,
            `"${(r.incidentLocation || "").replace(/"/g, '""')}"`,
            `"${(r.authority || "").replace(/"/g, '""')}"`,
            `"${(r.referenceNumber || "").replace(/"/g, '""')}"`,
            `"${r.rental ? `${r.rental.customer.firstName} ${r.rental.customer.lastName}` : "Kein Mieter"}"`,
            `"${r.rental?.contractNumber || (r.rental ? `#${r.rental.id}` : "")}"`,
            r.amount != null ? Number(r.amount).toFixed(2) : "0.00",
            `"${STATUS_CONFIG[r.status].label}"`,
            `"${(r.notes || "").replace(/"/g, '""')}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `rentex-strafzettel-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${filteredRecords.length} Strafzettel als CSV exportiert.`);
    }

    // Lenkerauskunft Text Generator
    const lenkerauskunftText = useMemo(() => {
        if (!lenkerauskunftRecord || !lenkerauskunftRecord.rental) return "";
        const r = lenkerauskunftRecord;
        const rental = lenkerauskunftRecord.rental;
        const c = rental.customer;
        const dateFormatted = new Date(r.issuedDate).toLocaleDateString("de-AT");

        return `An die Behörde: ${r.authority || "Zuständige Behörde"}
Geschäftszahl / Aktenzeichen: ${r.referenceNumber || "–"}
Betrifft: Lenkererhebung / Auskunft gemäß § 103 Abs. 2 KFG
Fahrzeug-Kennzeichen: ${r.plate} (${r.car.brand} ${r.car.model})
Tatzeit: ${dateFormatted}${r.issuedTime ? `, ${r.issuedTime} Uhr` : ""}
Tatort: ${r.incidentLocation || "–"}

Sehr geehrte Damen und Herren,

in Beantwortung Ihrer behördlichen Anfrage teilen wir Ihnen mit, dass das gegenständliche Fahrzeug zum angegebenen Tatzeitpunkt an folgende Person vermietet und übergeben war:

LENKERDATEN:
Name: ${c.firstName} ${c.lastName}
Geburtsdatum: ${c.dateOfBirth ? new Date(c.dateOfBirth).toLocaleDateString("de-AT") : "–"}
Wohnanschrift: ${c.address || "–"}, ${c.postalCode || ""} ${c.city || ""}, ${c.country || "Österreich"}
Führerschein-Nr.: ${c.licenseNumber || "–"}
Telefon: ${c.phone || "–"}
E-Mail: ${c.email}

MIETVERTRAG:
Vertragsnummer: ${rental.contractNumber || `#${rental.id}`}

Mit freundlichen Grüßen,
Rent-Ex Autovermietung
Admin-Dispositionsabteilung`;
    }, [lenkerauskunftRecord]);

    function handleCopyLenkerauskunft() {
        if (!lenkerauskunftText) return;
        navigator.clipboard.writeText(lenkerauskunftText);
        toast.success("Lenkerauskunft in die Zwischenablage kopiert!");
    }

    const totalOpen = records.filter(r => r.status === "OPEN").reduce((s, r) => s + Number(r.amount ?? 0), 0);
    const totalPaid = records.filter(r => r.status === "PAID").reduce((s, r) => s + Number(r.amount ?? 0), 0);

    const filteredRecords = records.filter(r => {
        if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
        if (!searchQuery) return true;

        const q = searchQuery.toLowerCase();
        return (
            r.plate.toLowerCase().includes(q) ||
            (r.referenceNumber && r.referenceNumber.toLowerCase().includes(q)) ||
            `${r.car.brand} ${r.car.model}`.toLowerCase().includes(q) ||
            (r.authority && r.authority.toLowerCase().includes(q)) ||
            (r.incidentLocation && r.incidentLocation.toLowerCase().includes(q)) ||
            (r.rental && `${r.rental.customer.firstName} ${r.rental.customer.lastName}`.toLowerCase().includes(q))
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
                        Radar-, Park- und Anonymverfügungen mit OCR, Lenkerauskunft & Mieterzuordnung
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-hm-paper hover:bg-hm-paper-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Download className="w-3.5 h-3.5 text-hm-muted" />
                        <span>CSV Export</span>
                    </button>
                    <button
                        onClick={openNew}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Strafzettel erfassen</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid (Clickable Filters) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Gesamte Fälle", value: records.length.toString(), icon: FileText, filterKey: "ALL" },
                    { label: "Offene Fälle", value: records.filter(r => r.status === "OPEN").length.toString(), icon: AlertTriangle, filterKey: "OPEN" },
                    { label: "Offener Betrag", value: `€ ${totalOpen.toFixed(2)}`, icon: DollarSign, filterKey: "OPEN" },
                    { label: "Bezahlt gesamt", value: `€ ${totalPaid.toFixed(2)}`, icon: Check, filterKey: "PAID" },
                ].map(stat => (
                    <div
                        key={stat.label}
                        onClick={() => setStatusFilter(stat.filterKey)}
                        className={clsx(
                            "bg-hm-paper border rounded-[var(--hm-radius-card)] p-4 sm:p-5 flex flex-col justify-between cursor-pointer transition-all select-none",
                            statusFilter === stat.filterKey
                                ? "border-hm-accent shadow-xs bg-hm-accent/5 ring-1 ring-hm-accent"
                                : "border-hm-rule hover:border-hm-rule-strong"
                        )}
                    >
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
                    {["ALL", ...Object.keys(STATUS_CONFIG)].map(s => {
                        const count = s === "ALL" ? records.length : records.filter(r => r.status === s).length;
                        return (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-[calc(var(--hm-radius-input)-2px)] font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5",
                                    statusFilter === s
                                        ? "bg-hm-paper text-hm-ink shadow-xs border border-hm-rule"
                                        : "text-hm-muted hover:text-hm-ink"
                                )}
                            >
                                <span>{s === "ALL" ? "Alle" : STATUS_CONFIG[s as Status].label}</span>
                                <span className="text-[10px] px-1 rounded bg-hm-paper-2 border border-hm-rule text-hm-muted font-bold">
                                    {count}
                                </span>
                            </button>
                        );
                    })}
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
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-hm-muted hover:text-hm-ink"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-hm-paper rounded-[var(--hm-radius-card)] border border-hm-rule overflow-hidden">
                {loading ? (
                    <div className="text-center py-20 font-mono text-xs text-hm-muted uppercase tracking-wider flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-hm-accent" />
                        <span>Lade Strafzettel...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-hm-paper-2 text-[11px] font-mono text-hm-muted uppercase tracking-wider border-b border-hm-rule">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Kennzeichen</th>
                                    <th className="px-6 py-3 font-semibold">Datum & Zeit</th>
                                    <th className="px-6 py-3 font-semibold">Ort & Behörde</th>
                                    <th className="px-6 py-3 font-semibold">Mieter & Kontakt</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold text-right">Betrag</th>
                                    <th className="px-6 py-3 font-semibold text-right">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-hm-rule">
                                {filteredRecords.map(r => {
                                    const isUpdatingThis = updatingStatusId === r.id;
                                    const isMenuOpen = activeStatusMenuId === r.id;

                                    return (
                                        <tr key={r.id} className="hover:bg-hm-paper-2/50 transition-colors">
                                            {/* Plate & Car */}
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-hm-ink font-mono text-xs">{r.plate}</div>
                                                <div className="text-[11px] text-hm-muted font-mono">{r.car.brand} {r.car.model}</div>
                                            </td>

                                            {/* Date & Time */}
                                            <td className="px-6 py-4 font-mono text-xs">
                                                <div className="text-hm-ink">{new Date(r.issuedDate).toLocaleDateString("de-AT")}</div>
                                                {r.issuedTime && (
                                                    <div className="text-[11px] text-hm-muted flex items-center gap-1 mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{r.issuedTime}</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Location & Authority */}
                                            <td className="px-6 py-4">
                                                <div className="text-xs text-hm-ink font-medium truncate max-w-xs">
                                                    {r.incidentLocation || "—"}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-hm-muted">
                                                    <span>{r.authority || "—"}</span>
                                                    {r.referenceNumber && <span>· GZ: {r.referenceNumber}</span>}
                                                </div>
                                            </td>

                                            {/* Customer & Contacts */}
                                            <td className="px-6 py-4">
                                                {r.rental ? (
                                                    <div>
                                                        <div className="text-xs font-semibold text-hm-ink">
                                                            {r.rental.customer.firstName} {r.rental.customer.lastName}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-hm-muted">
                                                            <span>{r.rental.contractNumber || `#${r.rental.id}`}</span>
                                                            {r.rental.customer.phone && (
                                                                <a
                                                                    href={`tel:${r.rental.customer.phone}`}
                                                                    className="text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                                                                    title="Kunden anrufen"
                                                                >
                                                                    <Phone className="w-3 h-3" />
                                                                </a>
                                                            )}
                                                            <a
                                                                href={`mailto:${r.rental.customer.email}`}
                                                                className="text-hm-muted hover:text-hm-ink inline-flex items-center gap-0.5"
                                                                title="E-Mail senden"
                                                            >
                                                                <Mail className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] font-mono text-hm-muted italic">Kein Mieter</span>
                                                )}
                                            </td>

                                            {/* Status Badge with Quick Switch */}
                                            <td className="px-6 py-4">
                                                <div className="relative inline-block">
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveStatusMenuId(isMenuOpen ? null : r.id)}
                                                        disabled={isUpdatingThis}
                                                        className={clsx(
                                                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--hm-radius-pill)] text-[10px] font-mono font-bold uppercase tracking-wider border transition-opacity hover:opacity-80',
                                                            STATUS_CONFIG[r.status].badgeClass,
                                                            isUpdatingThis && 'opacity-50'
                                                        )}
                                                        title="Status schnell ändern"
                                                    >
                                                        {isUpdatingThis ? (
                                                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                        ) : (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                        )}
                                                        <span>{STATUS_CONFIG[r.status].label}</span>
                                                        <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                                                    </button>

                                                    {isMenuOpen && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-20"
                                                                onClick={() => setActiveStatusMenuId(null)}
                                                            />
                                                            <div className="absolute left-0 top-full mt-1 w-40 bg-hm-paper rounded-[var(--hm-radius-input)] shadow-lg border border-hm-rule py-1 z-30">
                                                                <div className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-hm-muted border-b border-hm-rule">
                                                                    Status ändern
                                                                </div>
                                                                {(Object.keys(STATUS_CONFIG) as Status[]).map(st => (
                                                                    <button
                                                                        key={st}
                                                                        type="button"
                                                                        onClick={() => handleQuickStatusChange(r.id, st)}
                                                                        className={clsx(
                                                                            "w-full text-left px-2.5 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-hm-paper-2 transition-colors",
                                                                            r.status === st && "font-bold text-hm-accent"
                                                                        )}
                                                                    >
                                                                        <span>{STATUS_CONFIG[st].label}</span>
                                                                        {r.status === st && <CheckCircle2 className="w-3 h-3 text-hm-accent" />}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-6 py-4 font-mono font-bold text-hm-ink text-right hm-tnum">
                                                {r.amount != null ? `€ ${Number(r.amount).toFixed(2)}` : "—"}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Lenkerauskunft Button */}
                                                    {r.rental && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setLenkerauskunftRecord(r)}
                                                            className="p-1.5 text-hm-muted hover:text-hm-accent hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                                            title="Lenkerauskunft (Behördenschreiben) öffnen"
                                                        >
                                                            <ShieldAlert className="w-4 h-4 text-hm-accent" />
                                                        </button>
                                                    )}

                                                    {/* Document Viewer Button */}
                                                    {r.documentUrl && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setViewingDocument({
                                                                url: r.documentUrl!,
                                                                title: `Strafzettel-Beleg · ${r.plate} (${r.referenceNumber || 'Keine GZ'})`
                                                            })}
                                                            className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                                            title="Beleg / Radar-Foto ansehen"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => openEdit(r)}
                                                        className="p-1.5 text-hm-muted hover:text-hm-ink hover:bg-hm-paper-2 rounded-[var(--hm-radius-input)] transition-colors"
                                                        title="Bearbeiten"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => setRecordToDelete(r)}
                                                        className="p-1.5 text-hm-muted hover:text-red-600 hover:bg-red-500/10 rounded-[var(--hm-radius-input)] transition-colors"
                                                        title="Löschen"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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

            {/* ===== ADD / EDIT FORM MODAL ===== */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-2xl w-full max-w-lg border border-hm-rule text-hm-ink max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-hm-rule sticky top-0 bg-hm-paper z-10">
                            <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                {editTarget ? "Strafzettel bearbeiten" : "Neuer Strafzettel"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-1 text-hm-muted hover:text-hm-ink transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Car Selection */}
                            <div>
                                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">
                                    Fahrzeug (Kennzeichen) *
                                </label>
                                <input
                                    type="text"
                                    list="car-plates"
                                    placeholder="Kennzeichen suchen..."
                                    value={form.plate}
                                    onChange={e => {
                                        const plate = e.target.value;
                                        const car = cars.find(c => c.plate.toLowerCase() === plate.toLowerCase());
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
                                    <input
                                        type="date"
                                        value={form.issuedDate}
                                        onChange={e => setForm(p => ({ ...p, issuedDate: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Tatzeit</label>
                                    <input
                                        type="time"
                                        value={form.issuedTime}
                                        onChange={e => setForm(p => ({ ...p, issuedTime: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    />
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
                                            <FileText className="w-4 h-4 text-hm-accent" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-hm-ink">
                                                {identifiedRental.customer.firstName} {identifiedRental.customer.lastName}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-2">
                                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-hm-paper border border-hm-rule text-hm-ink-2">
                                                    Vertrag: {identifiedRental.contractNumber ?? `#${identifiedRental.id}`}
                                                </span>
                                                {identifiedRental.customer.phone && (
                                                    <span className="text-[10px] font-mono text-hm-muted">{identifiedRental.customer.phone}</span>
                                                )}
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
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm(p => ({ ...p, status: e.target.value as Status }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    >
                                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                            <option key={k} value={k}>{v.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {[
                                { label: "Tatort", key: "incidentLocation", type: "text" },
                                { label: "Behörde", key: "authority", type: "text" },
                                { label: "Aktenzeichen / GZ", key: "referenceNumber", type: "text" },
                                { label: "Notizen", key: "notes", type: "text" },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider mb-1.5">{f.label}</label>
                                    <input
                                        type={f.type}
                                        value={(form as any)[f.key]}
                                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        className="w-full px-3 py-2 border border-hm-rule rounded-[var(--hm-radius-input)] bg-hm-paper-2 text-hm-ink font-mono text-xs focus:outline-hidden focus:border-hm-rule-strong transition-colors"
                                    />
                                </div>
                            ))}

                            {/* Service Fee Toggle */}
                            <div className="p-3.5 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper-2 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded bg-hm-paper border border-hm-rule flex items-center justify-center text-hm-ink">
                                        <DollarSign className="w-3.5 h-3.5 text-hm-accent" />
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
                                <label className="block text-[11px] font-mono font-semibold text-hm-muted uppercase tracking-wider">
                                    Dokument (Foto / Scan)
                                </label>
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
                                                <Loader2 className="w-3.5 h-3.5 animate-spin text-hm-accent" />
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

            {/* ===== DELETE CONFIRMATION MODAL ===== */}
            {recordToDelete && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => !isDeleting && setRecordToDelete(null)}
                >
                    <div
                        className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-2xl w-full max-w-md border border-hm-rule text-hm-ink overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-5 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper-2">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-600 rounded-[var(--hm-radius-input)]">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                        Strafzettel löschen
                                    </h2>
                                    <p className="text-[11px] font-mono text-hm-muted">
                                        {recordToDelete.plate} · GZ: {recordToDelete.referenceNumber || 'Keine GZ'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => !isDeleting && setRecordToDelete(null)}
                                className="p-1 text-hm-muted hover:text-hm-ink transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <p className="text-xs text-hm-muted">
                                Möchten Sie diesen Strafzettel ({recordToDelete.authority || 'Behörde'} vom{' '}
                                {new Date(recordToDelete.issuedDate).toLocaleDateString("de-AT")}, Betrag: €{' '}
                                {recordToDelete.amount != null ? Number(recordToDelete.amount).toFixed(2) : '0.00'}) wirklich unwiderruflich löschen?
                            </p>

                            <div className="pt-3 border-t border-hm-rule flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setRecordToDelete(null)}
                                    disabled={isDeleting}
                                    className="px-3.5 py-2 rounded-[var(--hm-radius-input)] font-mono text-xs uppercase tracking-wider text-hm-muted hover:text-hm-ink transition-colors"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteRecord}
                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--hm-radius-input)] bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-xs transition-colors disabled:opacity-50"
                                >
                                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    <span>Endgültig löschen</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== DOCUMENT LIGHTBOX MODAL ===== */}
            {viewingDocument && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setViewingDocument(null)}
                >
                    <div
                        className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-2xl w-full max-w-3xl border border-hm-rule text-hm-ink overflow-hidden max-h-[85vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-5 py-3 border-b border-hm-rule flex items-center justify-between bg-hm-paper-2">
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-hm-ink truncate">
                                {viewingDocument.title}
                            </span>
                            <div className="flex items-center gap-2">
                                <a
                                    href={viewingDocument.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded text-hm-muted hover:text-hm-ink"
                                    title="In neuem Tab öffnen"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setViewingDocument(null)}
                                    className="p-1 rounded text-hm-muted hover:text-hm-ink"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-black/5 flex items-center justify-center flex-1 overflow-auto">
                            {viewingDocument.url.endsWith('.pdf') ? (
                                <iframe
                                    src={viewingDocument.url}
                                    className="w-full h-[65vh] rounded border border-hm-rule"
                                    title="PDF Strafzettel"
                                />
                            ) : (
                                <img
                                    src={viewingDocument.url}
                                    alt="Strafzettel-Beleg"
                                    className="max-h-[65vh] w-auto object-contain rounded"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== LENKERAUSKUNFT MODAL ===== */}
            {lenkerauskunftRecord && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setLenkerauskunftRecord(null)}
                >
                    <div
                        className="bg-hm-paper rounded-[var(--hm-radius-card)] shadow-2xl w-full max-w-2xl border border-hm-rule text-hm-ink overflow-hidden max-h-[85vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-5 py-4 border-b border-hm-rule flex items-center justify-between bg-hm-paper-2">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-hm-paper border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)]">
                                    <ShieldAlert className="w-5 h-5 text-hm-accent" />
                                </div>
                                <div>
                                    <h2 className="hm-display text-base font-bold text-hm-ink tracking-tight">
                                        Lenkerauskunft (§ 103 Abs. 2 KFG)
                                    </h2>
                                    <p className="text-[11px] font-mono text-hm-muted">
                                        Offizielle Behördenauskunft zur Fahreridentifikation
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setLenkerauskunftRecord(null)}
                                className="p-1 text-hm-muted hover:text-hm-ink transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 overflow-y-auto flex-1">
                            <div className="p-4 rounded-[var(--hm-radius-input)] bg-hm-paper-2 border border-hm-rule font-mono text-xs whitespace-pre-wrap text-hm-ink leading-relaxed select-all">
                                {lenkerauskunftText}
                            </div>
                        </div>

                        <div className="p-4 border-t border-hm-rule bg-hm-paper flex items-center justify-between">
                            <span className="text-[11px] font-mono text-hm-muted">
                                Bereit zum Versenden per Behörden-E-Mail oder Post.
                            </span>
                            <div className="flex items-center gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-3.5 py-2 border border-hm-rule text-hm-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-semibold uppercase tracking-wider hover:bg-hm-paper-2 transition-colors flex items-center gap-1.5"
                                >
                                    <Printer className="w-3.5 h-3.5 text-hm-muted" />
                                    <span>Drucken</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopyLenkerauskunft}
                                    className="px-4 py-2 bg-hm-accent hover:bg-hm-accent-hover text-hm-accent-ink rounded-[var(--hm-radius-input)] font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Text kopieren</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
