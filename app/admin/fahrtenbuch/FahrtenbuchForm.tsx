'use client';

import { getCarCurrentMileage, createFahrtenbuchEntry, updateFahrtenbuchEntry } from '@/app/actions/admin';
import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';

type Car = { id: number; brand: string; model: string; plate: string };
type EditEntry = {
    id: number;
    carId: number;
    datum: string | Date;
    startKm: number;
    endKm: number;
    zweck: string;
    fahrtzweck?: string | null;
};

interface FahrtenbuchFormProps {
    cars: Car[];
    editEntry?: EditEntry | null;
    onCancelEdit?: () => void;
}

export default function FahrtenbuchForm({ cars, editEntry, onCancelEdit }: FahrtenbuchFormProps) {
    const [isPending, startTransition] = useTransition();
    const [carId, setCarId] = useState(editEntry?.carId ? String(editEntry.carId) : '');
    const [datum, setDatum] = useState('');
    const [startKm, setStartKm] = useState(editEntry?.startKm ? String(editEntry.startKm) : '');
    const [endKm, setEndKm] = useState(editEntry?.endKm ? String(editEntry.endKm) : '');
    const [zweck, setZweck] = useState(editEntry?.zweck || 'DIENSTFAHRT');
    const [fahrtzweck, setFahrtzweck] = useState(editEntry?.fahrtzweck || '');

    // Format date for inputs
    useEffect(() => {
        if (editEntry) {
            setCarId(String(editEntry.carId));
            setStartKm(String(editEntry.startKm));
            setEndKm(String(editEntry.endKm));
            setZweck(editEntry.zweck);
            setFahrtzweck(editEntry.fahrtzweck || '');
            
            const dateObj = new Date(editEntry.datum);
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            setDatum(`${yyyy}-${mm}-${dd}`);
        } else {
            setCarId('');
            setStartKm('');
            setEndKm('');
            setZweck('DIENSTFAHRT');
            setFahrtzweck('');
            
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            setDatum(`${yyyy}-${mm}-${dd}`);
        }
    }, [editEntry]);

    // Handle car change and mileage auto-fill
    const handleCarChange = async (selectedId: string) => {
        setCarId(selectedId);
        if (!selectedId || editEntry) return;

        try {
            const mileage = await getCarCurrentMileage(parseInt(selectedId));
            setStartKm(String(mileage));
            // Pre-fill endKm to startKm as a helper
            setEndKm(String(mileage));
        } catch (error) {
            console.error('Failed to load mileage:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('carId', carId);
        formData.append('datum', datum);
        formData.append('startKm', startKm);
        formData.append('endKm', endKm);
        formData.append('zweck', zweck);
        formData.append('fahrtzweck', fahrtzweck);

        startTransition(async () => {
            let res;
            if (editEntry) {
                res = await updateFahrtenbuchEntry(editEntry.id, formData);
            } else {
                res = await createFahrtenbuchEntry(formData);
            }

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(editEntry ? 'Eintrag erfolgreich aktualisiert!' : 'Eintrag erfolgreich erstellt!');
                if (!editEntry) {
                    setCarId('');
                    setStartKm('');
                    setEndKm('');
                    setFahrtzweck('');
                } else if (onCancelEdit) {
                    onCancelEdit();
                }
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fahrzeug *</label>
                <select 
                    value={carId} 
                    onChange={e => handleCarChange(e.target.value)} 
                    required 
                    disabled={isPending}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white"
                >
                    <option value="">— wählen —</option>
                    {cars.map((c) => (
                        <option key={c.id} value={c.id}>{c.brand} {c.model} ({c.plate})</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Datum *</label>
                <input 
                    type="date" 
                    value={datum} 
                    onChange={e => setDatum(e.target.value)} 
                    required 
                    disabled={isPending}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" 
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start km *</label>
                    <input 
                        type="number" 
                        value={startKm} 
                        onChange={e => setStartKm(e.target.value)} 
                        required 
                        min={0} 
                        disabled={isPending}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ende km *</label>
                    <input 
                        type="number" 
                        value={endKm} 
                        onChange={e => setEndKm(e.target.value)} 
                        required 
                        min={Number(startKm) || 0} 
                        disabled={isPending}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" 
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zweck *</label>
                <select 
                    value={zweck} 
                    onChange={e => setZweck(e.target.value)} 
                    disabled={isPending}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white"
                >
                    <option value="DIENSTFAHRT">Dienstfahrt</option>
                    <option value="PRIVATFAHRT">Privatfahrt</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fahrtzweck (z.B. Strecke)</label>
                <input 
                    type="text" 
                    value={fahrtzweck} 
                    onChange={e => setFahrtzweck(e.target.value)} 
                    disabled={isPending}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" 
                    placeholder="z.B. Feldkirch – Wien" 
                />
            </div>
            <div className="flex gap-2">
                <button 
                    type="submit" 
                    disabled={isPending}
                    className="flex-1 rounded-lg bg-red-655 bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-750 transition-colors disabled:opacity-50"
                >
                    {isPending ? 'Verarbeitung...' : editEntry ? 'Änderungen speichern' : 'Eintrag speichern'}
                </button>
                {editEntry && (
                    <button 
                        type="button" 
                        onClick={onCancelEdit}
                        disabled={isPending}
                        className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                        Abbrechen
                    </button>
                )}
            </div>
        </form>
    );
}
