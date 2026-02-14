'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { getCarCategories, createCarCategory, updateCarCategory, deleteCarCategory } from '@/app/actions';
import { useRouter } from 'next/navigation';

type CarCategory = { id: number; name: string; sortOrder: number };

interface CategoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CategoriesModal({ isOpen, onClose }: CategoriesModalProps) {
    const router = useRouter();
    const [categories, setCategories] = useState<CarCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        const list = await getCarCategories();
        setCategories(list as CarCategory[]);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) load();
    }, [isOpen]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newName.trim();
        if (!name) return;
        setAdding(true);
        try {
            await createCarCategory(name);
            setNewName('');
            await load();
            router.refresh();
        } finally {
            setAdding(false);
        }
    };

    const startEdit = (cat: CarCategory) => {
        setEditingId(cat.id);
        setEditName(cat.name);
    };

    const saveEdit = async () => {
        if (editingId == null || !editName.trim()) return;
        await updateCarCategory(editingId, editName.trim());
        setEditingId(null);
        setEditName('');
        await load();
        router.refresh();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Diese Kategorie wirklich löschen? Fahrzeuge mit dieser Kategorie behalten den Namen.')) return;
        setDeletingId(id);
        try {
            await deleteCarCategory(id);
            await load();
            router.refresh();
        } finally {
            setDeletingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Kategorien</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Neue Kategorie"
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={adding || !newName.trim()}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                        >
                            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Hinzufügen
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                        </div>
                    ) : categories.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-6">Noch keine Kategorien. Fügen Sie eine hinzu.</p>
                    ) : (
                        <ul className="space-y-2">
                            {categories.map((cat) => (
                                <li
                                    key={cat.id}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700"
                                >
                                    {editingId === cat.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg dark:text-white text-sm"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={saveEdit}
                                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                                            >
                                                Speichern
                                            </button>
                                            <button type="button" onClick={cancelEdit} className="px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm">
                                                Abbrechen
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 font-medium text-gray-900 dark:text-white">{cat.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => startEdit(cat)}
                                                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                title="Bearbeiten"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(cat.id)}
                                                disabled={deletingId === cat.id}
                                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 disabled:opacity-50"
                                                title="Löschen"
                                            >
                                                {deletingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
