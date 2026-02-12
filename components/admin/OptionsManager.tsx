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
    Edit2,
    FolderPlus,
    Car
} from 'lucide-react';
import { deleteOption, createOption, updateOption, createOptionGroup, deleteOptionGroup } from '@/app/actions';
import { Option as OptionType, OptionGroup as GroupType } from '@prisma/client';
import { clsx } from 'clsx';

interface ExtendedOption extends OptionType {
    group?: GroupType;
}

interface OptionsManagerProps {
    options: ExtendedOption[];
    groups: GroupType[];
}

export default function OptionsManager({ options, groups }: OptionsManagerProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<ExtendedOption | null>(null);
    const [isPending, startTransition] = useTransition();
    const [filterType, setFilterType] = useState<string>('all');
    const [filterGroup, setFilterGroup] = useState<string>('all');

    const handleDelete = (id: number) => {
        if (!confirm('Option löschen?')) return;
        startTransition(async () => {
            await deleteOption(id);
        });
    };

    const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await createOptionGroup(formData);
            if (result.success) setIsGroupModalOpen(false);
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

    const filteredOptions = options.filter(o => {
        const typeMatch = filterType === 'all' || o.type === filterType;
        const groupMatch = filterGroup === 'all' || (filterGroup === 'none' ? !o.groupId : o.groupId === Number(filterGroup));
        return typeMatch && groupMatch;
    });

    const carCategories = ['Kleinwagen', 'Mittelklasse', 'Limousine', 'SUV', 'Van', 'Sportwagen', 'Cabrio', 'Kombi', 'Bus', 'Kastenwagen'];

    return (
        <div className="space-y-6 px-4 sm:px-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Globale Zusatzoptionen</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Erstellen Sie Vorlagen, die Sie später für einzelne Autos auswählen können.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsGroupModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FolderPlus className="w-4 h-4" />
                        Gruppe erstellen
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Neue Vorlage
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                    {['all', 'package', 'insurance', 'extra', 'driver'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={clsx(
                                "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                                filterType === type
                                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            )}
                        >
                            {type === 'all' ? 'Alle' : type === 'package' ? 'Pakete' : type === 'insurance' ? 'Schutz' : type === 'extra' ? 'Extras' : 'Fahrer'}
                        </button>
                    ))}
                </div>

                <select
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="all">Alle Gruppen</option>
                    <option value="none">Keine Gruppe</option>
                    {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
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
                                <button onClick={() => setEditingOption(option)} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(option.id)} className="p-2 text-gray-400 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">{option.name}</h3>
                        <div className="flex flex-wrap gap-1 mb-3">
                            {option.group && (
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-400 rounded">
                                    {option.group.name}
                                </span>
                            )}
                            {option.carCategory && (
                                <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-[10px] font-medium text-red-600 dark:text-red-400 rounded flex items-center gap-1">
                                    <Car className="w-3 h-3" /> {option.carCategory}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 h-8">
                            {option.description || 'Keine Beschreibung.'}
                        </p>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Preis</span>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(option.price))}
                                    {option.isPerDay && <span className="text-xs font-normal text-gray-500 ml-1">/ Tag</span>}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Group Modal */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h2 className="text-xl font-bold dark:text-white">Neue Gruppe</h2>
                            <button onClick={() => setIsGroupModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-semibold dark:text-gray-300">Gruppenname</label>
                                <input name="name" type="text" required className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsGroupModalOpen(false)} className="px-6 py-2.5 text-sm dark:text-gray-400">Abbrechen</button>
                                <button type="submit" disabled={isPending} className="px-8 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold">Gruppe erstellen</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add/Edit Option Modal */}
            {(isAddModalOpen || editingOption) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                            <h2 className="text-xl font-bold dark:text-white">{editingOption ? 'Option bearbeiten' : 'Neue Vorlage'}</h2>
                            <button onClick={() => { setIsAddModalOpen(false); setEditingOption(null); }}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form action={async (fd) => {
                            if (editingOption) {
                                await updateOption(editingOption.id, fd);
                                setEditingOption(null);
                            } else {
                                await createOption(fd);
                                setIsAddModalOpen(false);
                            }
                        }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-semibold dark:text-gray-300">Name *</label>
                                    <input name="name" type="text" required defaultValue={editingOption?.name} className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold dark:text-gray-300">Typ</label>
                                    <select name="type" defaultValue={editingOption?.type || 'extra'} className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                        <option value="extra">Ekstara</option>
                                        <option value="package">Kilometer-Paket</option>
                                        <option value="insurance">Schutz</option>
                                        <option value="driver">Fahrer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold dark:text-gray-300">Preis (€)</label>
                                    <input name="price" type="number" step="0.01" required defaultValue={editingOption ? Number(editingOption.price) : ''} className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold dark:text-gray-300">Gruppe</label>
                                    <select name="groupId" defaultValue={editingOption?.groupId || ''} className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                        <option value="">Keine Gruppe</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold dark:text-gray-300">Auto-Kategorie</label>
                                    <select name="carCategory" defaultValue={editingOption?.carCategory || ''} className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                        <option value="">Alle Kategorien</option>
                                        {carCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border dark:border-gray-700 cursor-pointer">
                                <input name="isPerDay" type="checkbox" defaultChecked={editingOption?.isPerDay} className="w-5 h-5 text-red-600 rounded" />
                                <span className="text-sm font-bold dark:text-gray-300">Pro Tag berechnen</span>
                            </label>
                            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingOption(null); }} className="px-6 py-2.5 text-sm dark:text-gray-400">Abbrechen</button>
                                <button type="submit" className="px-8 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold">Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
