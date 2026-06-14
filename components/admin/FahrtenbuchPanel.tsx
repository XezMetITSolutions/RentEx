'use client';

import { useState, useTransition } from 'react';
import { 
    Search, FileSpreadsheet, FileDown, Edit2, Trash2, 
    AlertCircle, CheckCircle, HelpCircle, ArrowLeft, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import FahrtenbuchForm from '@/app/admin/fahrtenbuch/FahrtenbuchForm';
import { deleteFahrtenbuchEntry } from '@/app/actions/admin';
import { toast } from 'sonner';

type Car = { id: number; brand: string; model: string; plate: string };
type Entry = {
    id: number;
    carId: number;
    rentalId: number | null;
    datum: string | Date;
    startKm: number;
    endKm: number;
    zweck: string;
    fahrtzweck: string | null;
    car: Car;
};

interface FahrtenbuchPanelProps {
    cars: Car[];
    initialEntries: Entry[];
}

export default function FahrtenbuchPanel({ cars, initialEntries }: FahrtenbuchPanelProps) {
    const [entries, setEntries] = useState<Entry[]>(initialEntries);
    const [editEntry, setEditEntry] = useState<Entry | null>(null);
    const [isPending, startTransition] = useTransition();

    // Filters state
    const [search, setSearch] = useState('');
    const [selectedCar, setSelectedCar] = useState('all');
    const [selectedZweck, setSelectedZweck] = useState('all');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Filter logic
    const filteredEntries = entries.filter(e => {
        const matchesCar = selectedCar === 'all' || e.carId === parseInt(selectedCar, 10);
        const matchesZweck = selectedZweck === 'all' || e.zweck === selectedZweck;
        const matchesSearch = !search || 
            `${e.car.brand} ${e.car.model} ${e.car.plate}`.toLowerCase().includes(search.toLowerCase()) ||
            (e.fahrtzweck || '').toLowerCase().includes(search.toLowerCase());
        
        return matchesCar && matchesZweck && matchesSearch;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

    // Delete handler
    const handleDelete = (id: number) => {
        if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return;
        
        startTransition(async () => {
            const res = await deleteFahrtenbuchEntry(id);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success('Eintrag gelöscht');
                setEntries(prev => prev.filter(e => e.id !== id));
                if (editEntry?.id === id) {
                    setEditEntry(null);
                }
            }
        });
    };

    // Export query parameters
    const getExportUrl = (formatType: 'csv' | 'pdf') => {
        let url = `/api/admin/fahrtenbuch-export?format=${formatType}`;
        if (selectedCar !== 'all') url += `&carId=${selectedCar}`;
        if (selectedZweck !== 'all') url += `&zweck=${selectedZweck}`;
        return url;
    };

    return (
        <div className="space-y-6">
            {/* Action Bar (Filters & Exports) */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Zweck, Plakette oder Modell..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                        />
                    </div>

                    <select
                        value={selectedCar}
                        onChange={e => { setSelectedCar(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                    >
                        <option value="all">Alle Fahrzeuge</option>
                        {cars.map(c => (
                            <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.plate})</option>
                        ))}
                    </select>

                    <select
                        value={selectedZweck}
                        onChange={e => { setSelectedZweck(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
                    >
                        <option value="all">Alle Zwecke</option>
                        <option value="DIENSTFAHRT">Dienstfahrt</option>
                        <option value="PRIVATFAHRT">Privatfahrt</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <a
                        href={getExportUrl('csv')}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-250 rounded-lg text-sm font-medium transition-colors"
                        title="Als CSV exportieren"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        CSV Export
                    </a>
                    <a
                        href={getExportUrl('pdf')}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-250 rounded-lg text-sm font-medium transition-colors"
                        title="Als PDF exportieren"
                    >
                        <FileDown className="w-4 h-4 text-red-650" />
                        PDF Export
                    </a>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Side */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {editEntry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
                        </h2>
                        <FahrtenbuchForm 
                            cars={cars} 
                            editEntry={editEntry}
                            onCancelEdit={() => setEditEntry(null)}
                        />
                    </div>
                </div>

                {/* Table Side */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-950 text-gray-500 tracking-wider border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <th className="px-6 py-3">Datum</th>
                                        <th className="px-6 py-3">Fahrzeug</th>
                                        <th className="px-6 py-3">Anfang/Ende km</th>
                                        <th className="px-6 py-3 text-right">Strecke</th>
                                        <th className="px-6 py-3">Zweck</th>
                                        <th className="px-6 py-3">Fahrtzweck</th>
                                        <th className="px-6 py-3 text-right">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {paginatedEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                                                Keine Einträge für die aktuellen Filter vorhanden.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedEntries.map((e) => (
                                            <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white shrink-0">
                                                    {format(new Date(e.datum), 'dd.MM.yyyy', { locale: de })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{e.car.brand} {e.car.model}</div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5 font-mono">{e.car.plate}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-650 dark:text-gray-350">
                                                    {e.startKm} km <br />
                                                    <span className="text-gray-400">→ {e.endKm} km</span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                                    {e.endKm - e.startKm} km
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={e.zweck === 'DIENSTFAHRT' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-600 dark:text-gray-400'}>
                                                        {e.zweck === 'DIENSTFAHRT' ? 'Dienst' : 'Privat'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={e.fahrtzweck || ''}>
                                                    {e.fahrtzweck || '–'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => setEditEntry(e)}
                                                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-blue-600"
                                                            title="Bearbeiten"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(e.id)}
                                                            disabled={isPending}
                                                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-600 disabled:opacity-50"
                                                            title="Löschen"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-950/20 border-t border-gray-205 dark:border-gray-800 flex items-center justify-between">
                                <span className="text-xs text-gray-550">
                                    Seite {currentPage} von {totalPages} ({filteredEntries.length} Einträge)
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        <ArrowLeft className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        <ArrowRight className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
