'use client';

import { useState, useTransition } from 'react';
import {
    Plus,
    Trash2,
    Tag,
    ShieldCheck,
    CheckCircle,
    Gift,
    Loader2,
    X,
    Edit2
} from 'lucide-react';
import { deleteOption, createOption, updateOption } from '@/app/actions';
import { Option as OptionType } from '@prisma/client';
import { clsx } from 'clsx';

interface OptionsManagerProps {
    options: OptionType[];
}

export default function OptionsManager({ options }: OptionsManagerProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<OptionType | null>(null);
    const [isPending, startTransition] = useTransition();
    const [filterType, setFilterType] = useState<string>('all');

    const handleDelete = (id: number) => {
        if (!confirm('Möchten Sie diese Option wirklich löschen?')) return;

        startTransition(async () => {
            const result = await deleteOption(id);
            if (!result.success) {
                alert(result.error);
            }
        });
    };

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await createOption(formData);
            if (result.success) {
                setIsAddModalOpen(false);
            } else {
                alert(result.error);
            }
        });
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingOption) return;
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await updateOption(editingOption.id, formData);
            if (result.success) {
                setEditingOption(null);
            } else {
                alert(result.error);
            }
        });
    };

    const getTypeIcon = (type: string | null) => {
        switch (type) {
            case 'package': return <Gift className="w-4 h-4" />;
            case 'insurance': return <ShieldCheck className="w-4 h-4" />;
            case 'driver': return <CheckCircle className="w-4 h-4" />;
            default: return <Tag className="w-4 h-4" />;
        }
    };

    const filteredOptions = filterType === 'all'
        ? options
        : options.filter(o => o.type === filterType);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Zusatzoptionen verwalten</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Erstellen ve verwalten Sie Kilometer-Pakete, Versicherungen und Extra-Zubehör.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20"
                >
                    <Plus className="w-4 h-4" />
                    Neue Option
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                {[
                    { id: 'all', label: 'Alle' },
                    { id: 'package', label: 'Pakete' },
                    { id: 'insurance', label: 'Schutz' },
                    { id: 'extra', label: 'Extras' },
                    { id: 'driver', label: 'Sürücü' }
                ].map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setFilterType(type.id)}
                        className={clsx(
                            "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                            filterType === type.id
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        )}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredOptions.map((option) => (
                    <div key={option.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={clsx(
                                "p-2.5 rounded-xl",
                                option.type === 'package' ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600" :
                                    option.type === 'insurance' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" :
                                        option.type === 'driver' ? "bg-green-50 dark:bg-green-900/20 text-green-600" :
                                            "bg-zinc-50 dark:bg-zinc-900/20 text-zinc-600"
                            )}>
                                {getTypeIcon(option.type)}
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setEditingOption(option)}
                                    className="p-2 text-gray-400 hover:text-blue-600 transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(option.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{option.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-8">
                            {option.description || 'Keine Beschreibung verfügbar.'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Preis</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(option.price))}
                                    {option.isPerDay && <span className="text-xs font-normal text-gray-500 ml-1">/ Tag</span>}
                                </span>
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">
                                {option.type === 'package' ? 'Kilometer' : 'Extras'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Neue Option erstellen</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name der Option *</label>
                                <input name="name" type="text" required placeholder="z.B. Mehrkilometer 500 km Paket"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Beschreibung</label>
                                <textarea name="description" rows={3} placeholder="Optionale Details zur Option..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Typ *</label>
                                    <select name="type" required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500">
                                        <option value="extra">Ekstara (Zubehör)</option>
                                        <option value="package">Kilometer-Paket</option>
                                        <option value="insurance">Schutz/Versicherung</option>
                                        <option value="driver">Sürücü Ayarları</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Preis (€) *</label>
                                    <input name="price" type="number" step="0.01" required placeholder="0.00"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer">
                                <input name="isPerDay" type="checkbox" className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">Pro Tag berechnen</span>
                                    <span className="text-xs text-gray-500">Wenn deaktiviert, wird der Preis einmalig berechnet.</span>
                                </div>
                            </label>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button type="button" onClick={() => setIsAddModalOpen(false)}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                                    Abbrechen
                                </button>
                                <button type="submit" disabled={isPending}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20">
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Option erstellen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingOption && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Option bearbeiten</h2>
                            <button onClick={() => setEditingOption(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name der Option *</label>
                                <input name="name" type="text" required defaultValue={editingOption.name}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Beschreibung</label>
                                <textarea name="description" rows={3} defaultValue={editingOption.description || ''}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Typ *</label>
                                    <select name="type" required defaultValue={editingOption.type || 'extra'} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500">
                                        <option value="extra">Ekstara (Zubehör)</option>
                                        <option value="package">Kilometer-Paket</option>
                                        <option value="insurance">Schutz/Versicherung</option>
                                        <option value="driver">Sürücü Ayarları</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Preis (€) *</label>
                                    <input name="price" type="number" step="0.01" required defaultValue={Number(editingOption.price)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500" />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 cursor-pointer">
                                <input name="isPerDay" type="checkbox" defaultChecked={editingOption.isPerDay} className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">Pro Tag berechnen</span>
                                    <span className="text-xs text-gray-500">Wenn deaktiviert, wird der Preis einmalig berechnet.</span>
                                </div>
                            </label>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button type="button" onClick={() => setEditingOption(null)}
                                    className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
                                    Abbrechen
                                </button>
                                <button type="submit" disabled={isPending}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20">
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Änderungen speichern
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function Save(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    );
}
