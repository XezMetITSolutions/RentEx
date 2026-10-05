/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: custom (brand red) · tokens: /tokens.css · pre-emit critique: P5 H5 E5 S5 R4 V4 */
"use client";

import React, { useState, useMemo } from "react";
import {
    Shield, Check, X, RotateCcw, Save, Lock, Search,
    SlidersHorizontal, CheckSquare, Square, Info, AlertCircle
} from "lucide-react";
import { clsx } from "clsx";
import {
    AdminModuleItem,
    CONFIGURABLE_ROLES,
    DEFAULT_ROLE_PERMISSIONS
} from "@/lib/rolePermissions";

interface PermissionsManagerProps {
    initialPermissions: Record<string, string[]>;
    modules: AdminModuleItem[];
}

export default function PermissionsManager({
    initialPermissions,
    modules
}: PermissionsManagerProps) {
    const [permissions, setPermissions] = useState<Record<string, string[]>>(initialPermissions);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [saving, setSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Categories
    const categories = useMemo(() => {
        const set = new Set<string>();
        modules.forEach(m => set.add(m.category));
        return Array.from(set);
    }, [modules]);

    // Check if dirty
    const isDirty = useMemo(() => {
        return JSON.stringify(permissions) !== JSON.stringify(initialPermissions);
    }, [permissions, initialPermissions]);

    // Filter modules
    const filteredModules = useMemo(() => {
        return modules.filter(m => {
            const matchesCat = selectedCategory === "all" || m.category === selectedCategory;
            const matchesSearch = !search ||
                m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.description.toLowerCase().includes(search.toLowerCase()) ||
                m.href.toLowerCase().includes(search.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [modules, selectedCategory, search]);

    // Group filtered modules
    const groupedModules = useMemo(() => {
        const groups: Record<string, AdminModuleItem[]> = {};
        filteredModules.forEach(m => {
            if (!groups[m.category]) groups[m.category] = [];
            groups[m.category].push(m);
        });
        return groups;
    }, [filteredModules]);

    // Toggle single permission
    const togglePermission = (role: string, moduleId: string) => {
        setPermissions(prev => {
            const currentList = prev[role] || [];
            const hasModule = currentList.includes(moduleId) || currentList.includes("all");

            let nextList: string[];
            if (currentList.includes("all")) {
                // expand 'all' into explicit modules minus this one
                nextList = modules.map(m => m.id).filter(id => id !== moduleId);
            } else if (hasModule) {
                nextList = currentList.filter(id => id !== moduleId);
            } else {
                nextList = [...currentList, moduleId];
            }

            return {
                ...prev,
                [role]: nextList
            };
        });
        setStatusMsg(null);
    };

    // Toggle entire category for a role
    const toggleCategoryForRole = (role: string, category: string, enable: boolean) => {
        const catModules = modules.filter(m => m.category === category).map(m => m.id);
        setPermissions(prev => {
            const currentList = (prev[role] || []).filter(id => id !== "all");
            let nextList: string[];
            if (enable) {
                const combined = new Set([...currentList, ...catModules]);
                nextList = Array.from(combined);
            } else {
                nextList = currentList.filter(id => !catModules.includes(id));
            }
            return { ...prev, [role]: nextList };
        });
        setStatusMsg(null);
    };

    // Toggle all modules for a role
    const toggleAllForRole = (role: string, enable: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [role]: enable ? modules.map(m => m.id) : []
        }));
        setStatusMsg(null);
    };

    // Reset to defaults
    const handleReset = () => {
        if (confirm("Möchten Sie die Berechtigungen wirklich auf den Standard zurücksetzen?")) {
            setPermissions(DEFAULT_ROLE_PERMISSIONS);
            setStatusMsg({ type: "success", text: "Berechtigungen auf Standardwerte zurückgesetzt. Bitte speichern nicht vergessen!" });
        }
    };

    // Save permissions
    const handleSave = async () => {
        setSaving(true);
        setStatusMsg(null);
        try {
            const res = await fetch("/api/admin/permissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ permissions })
            });
            const data = await res.json();
            if (res.ok) {
                setStatusMsg({ type: "success", text: "Berechtigungen erfolgreich in der Datenbank gespeichert!" });
                setTimeout(() => window.location.reload(), 1200);
            } else {
                setStatusMsg({ type: "error", text: data.error || "Fehler beim Speichern der Berechtigungen." });
            }
        } catch (e: any) {
            setStatusMsg({ type: "error", text: e.message || "Netzwerkfehler beim Speichern." });
        } finally {
            setSaving(false);
        }
    };

    // Check if role has module
    const hasPerm = (role: string, moduleId: string) => {
        const list = permissions[role] || [];
        return list.includes("all") || list.includes(moduleId);
    };

    return (
        <div className="max-w-[1440px] mx-auto space-y-6 pb-20 text-hm-ink">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-hm-rule">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent" />
                        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-hm-muted">
                            System & Sicherheit · RBAC Matrix
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-hm-ink">
                        Rollen & Berechtigungen
                    </h1>
                    <p className="text-sm text-hm-muted max-w-2xl">
                        Legen Sie exakt fest, welche Module und Menüpunkte für welche Rolle in der Sidebar sichtbar und zugänglich sind.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-[var(--hm-radius-control)] border border-hm-rule bg-hm-paper text-hm-ink hover:bg-hm-paper-2 transition-colors"
                        title="Auf Werkseinstellungen zurücksetzen"
                    >
                        <RotateCcw className="h-3.5 w-3.5 text-hm-muted" />
                        <span>Standard zurücksetzen</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className={clsx(
                            "inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-[var(--hm-radius-control)] transition-all shadow-sm",
                            isDirty
                                ? "bg-hm-accent text-white hover:opacity-95 shadow-red-500/20 animate-pulse"
                                : "bg-hm-rule text-hm-muted cursor-not-allowed"
                        )}
                    >
                        <Save className="h-4 w-4" />
                        <span>{saving ? "Wird gespeichert..." : isDirty ? "Änderungen speichern *" : "Gespeichert"}</span>
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {statusMsg && (
                <div className={clsx(
                    "p-4 rounded-[var(--hm-radius-card)] border flex items-center gap-3 text-sm transition-all",
                    statusMsg.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"
                )}>
                    {statusMsg.type === "success" ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                    <span>{statusMsg.text}</span>
                </div>
            )}

            {/* Role Overview Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Superadmin Card */}
                <div className="bg-hm-paper border border-purple-500/30 rounded-[var(--hm-radius-card)] p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold">
                            Administrator / Superadmin
                        </span>
                        <Lock className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-hm-ink">
                        {modules.length} <span className="text-xs font-normal text-hm-muted">/ {modules.length}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        Vollzugriff (Universell & Gesperrt)
                    </div>
                </div>

                {/* Configurable Roles */}
                {CONFIGURABLE_ROLES.map(({ role, label }) => {
                    const count = (permissions[role] || []).includes("all")
                        ? modules.length
                        : (permissions[role] || []).length;
                    const percent = Math.round((count / modules.length) * 100);

                    return (
                        <div key={role} className="bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-card)] p-4 sm:p-5 flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-mono uppercase tracking-wider text-hm-muted">
                                    {label}
                                </span>
                                <span className="text-[11px] font-mono font-semibold text-hm-ink">
                                    {percent}%
                                </span>
                            </div>
                            <div className="text-2xl font-bold font-mono text-hm-ink">
                                {count} <span className="text-xs font-normal text-hm-muted">/ {modules.length}</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <button
                                    onClick={() => toggleAllForRole(role, true)}
                                    className="text-[10px] text-hm-muted hover:text-hm-ink underline underline-offset-2"
                                >
                                    Alle
                                </button>
                                <span className="text-hm-rule text-[10px]">·</span>
                                <button
                                    onClick={() => toggleAllForRole(role, false)}
                                    className="text-[10px] text-hm-muted hover:text-hm-ink underline underline-offset-2"
                                >
                                    Keine
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-hm-paper p-3 rounded-[var(--hm-radius-card)] border border-hm-rule">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-hm-muted" />
                    <input
                        type="text"
                        placeholder="Modul oder Beschreibung suchen..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs bg-hm-paper-2 border border-hm-rule rounded-[var(--hm-radius-control)] text-hm-ink placeholder-hm-muted focus:outline-none focus:border-hm-accent"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className={clsx(
                            "px-3 py-1.5 text-xs font-semibold rounded-[var(--hm-radius-control)] transition-colors whitespace-nowrap",
                            selectedCategory === "all"
                                ? "bg-hm-accent text-white"
                                : "text-hm-muted hover:text-hm-ink bg-hm-paper-2 border border-hm-rule"
                        )}
                    >
                        Alle ({modules.length})
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={clsx(
                                "px-3 py-1.5 text-xs font-semibold rounded-[var(--hm-radius-control)] transition-colors whitespace-nowrap",
                                selectedCategory === cat
                                    ? "bg-hm-accent text-white"
                                    : "text-hm-muted hover:text-hm-ink bg-hm-paper-2 border border-hm-rule"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Permission Matrix Table */}
            <div className="bg-hm-paper border border-hm-rule rounded-[var(--hm-radius-card)] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-hm-rule bg-hm-paper-2 text-hm-muted font-mono uppercase tracking-wider text-[11px]">
                                <th className="p-4 sm:w-1/3">Modul & Pfad</th>
                                <th className="p-4 text-center w-36 text-purple-600 dark:text-purple-400">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Lock className="h-3 w-3" />
                                        <span>Superadmin</span>
                                    </div>
                                </th>
                                {CONFIGURABLE_ROLES.map(({ role, label }) => (
                                    <th key={role} className="p-4 text-center w-36">
                                        <div className="flex flex-col items-center gap-1">
                                            <span>{label.split(" ")[0]}</span>
                                            <div className="flex items-center gap-1.5 normal-case font-sans text-[10px] text-hm-muted font-normal">
                                                <button
                                                    onClick={() => toggleAllForRole(role, true)}
                                                    className="hover:text-hm-ink hover:underline"
                                                    title="Alle an"
                                                >
                                                    Alle
                                                </button>
                                                <span>/</span>
                                                <button
                                                    onClick={() => toggleAllForRole(role, false)}
                                                    className="hover:text-hm-ink hover:underline"
                                                    title="Alle aus"
                                                >
                                                    Keine
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-hm-rule">
                            {Object.entries(groupedModules).map(([category, catModules]) => (
                                <React.Fragment key={category}>
                                    {/* Category Sub-Header */}
                                    <tr className="bg-hm-paper-2/70 border-y border-hm-rule">
                                        <td colSpan={2 + CONFIGURABLE_ROLES.length} className="px-4 py-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-hm-ink">
                                                    {category}
                                                </span>
                                                <div className="flex items-center gap-4 text-[10px] font-medium text-hm-muted">
                                                    {CONFIGURABLE_ROLES.map(({ role, label }) => (
                                                        <div key={role} className="flex items-center gap-1">
                                                            <span className="text-hm-muted">{label.split(" ")[0]}:</span>
                                                            <button
                                                                onClick={() => toggleCategoryForRole(role, category, true)}
                                                                className="text-hm-ink hover:underline"
                                                            >
                                                                +Alle
                                                            </button>
                                                            <span>·</span>
                                                            <button
                                                                onClick={() => toggleCategoryForRole(role, category, false)}
                                                                className="text-hm-ink hover:underline"
                                                            >
                                                                -Keine
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Modules in Category */}
                                    {catModules.map(item => (
                                        <tr key={item.id} className="hover:bg-hm-paper-2/40 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-hm-ink text-sm flex items-center gap-2">
                                                    <span>{item.name}</span>
                                                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-hm-paper-2 text-hm-muted border border-hm-rule font-normal">
                                                        {item.href}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-hm-muted mt-0.5">{item.description}</p>
                                            </td>

                                            {/* Superadmin: Always ON (Disabled) */}
                                            <td className="p-4 text-center">
                                                <div className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                                                    <Check className="h-4 w-4" />
                                                </div>
                                            </td>

                                            {/* Configurable Roles */}
                                            {CONFIGURABLE_ROLES.map(({ role }) => {
                                                const active = hasPerm(role, item.id);
                                                return (
                                                    <td key={role} className="p-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePermission(role, item.id)}
                                                            className={clsx(
                                                                "inline-flex items-center justify-center h-7 w-7 rounded-lg transition-all border",
                                                                active
                                                                    ? "bg-hm-accent text-white border-hm-accent shadow-sm shadow-red-500/20"
                                                                    : "bg-hm-paper-2 text-hm-muted border-hm-rule hover:border-hm-ink hover:text-hm-ink"
                                                            )}
                                                            aria-label={`${item.name} für ${role} umschalten`}
                                                        >
                                                            {active ? <Check className="h-4 w-4" /> : <X className="h-3 w-3 opacity-40" />}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sticky Save Banner when isDirty */}
            {isDirty && (
                <div className="fixed bottom-6 right-6 left-6 max-w-xl mx-auto z-40 bg-hm-ink text-hm-paper px-5 py-3.5 rounded-[var(--hm-radius-card)] shadow-2xl border border-hm-rule flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2.5">
                        <span className="inline-block h-2 w-2 rounded-full bg-hm-accent animate-ping" />
                        <span className="text-xs font-medium">Sie haben ungespeicherte Berechtigungsänderungen.</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPermissions(initialPermissions)}
                            className="px-3 py-1.5 text-xs rounded-[var(--hm-radius-control)] hover:bg-white/10 transition-colors"
                        >
                            Verwerfen
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-1.5 text-xs font-semibold rounded-[var(--hm-radius-control)] bg-hm-accent text-white hover:opacity-95 transition-all shadow-sm"
                        >
                            {saving ? "Speichern..." : "Jetzt speichern"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
