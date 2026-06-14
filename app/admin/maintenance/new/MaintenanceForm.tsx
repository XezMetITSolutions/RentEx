'use client';

import { createMaintenance } from '@/app/actions';
import { Wrench, Calendar, DollarSign, Save, FileText, Activity, Search, FileUp, ChevronDown, Car as CarIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

type Car = {
    id: number;
    brand: string;
    model: string;
    plate: string;
};
export default function MaintenanceForm({ cars }: { cars: Car[] }) {
    const [carSearch, setCarSearch] = useState('');
    const [selectedCarId, setSelectedCarId] = useState<number | string>('');
    const [invoiceUrl, setInvoiceUrl] = useState('');
    const [isCarDropdownOpen, setIsCarDropdownOpen] = useState(false);
    const carContainerRef = useRef<HTMLDivElement>(null);

    const selectedCar = useMemo(() => cars.find(c => c.id === Number(selectedCarId)), [selectedCarId, cars]);

    useEffect(() => {
        if (selectedCar) {
            setCarSearch(`${selectedCar.brand} ${selectedCar.model} [${selectedCar.plate}]`);
        } else {
            setCarSearch('');
        }
    }, [selectedCar, cars]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (carContainerRef.current && !carContainerRef.current.contains(event.target as Node)) {
                setIsCarDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredCars = useMemo(() => {
        const search = carSearch.toLowerCase();
        const selectedCarText = selectedCar ? `${selectedCar.brand} ${selectedCar.model} [${selectedCar.plate}]`.toLowerCase() : '';
        if (!carSearch || search === selectedCarText) {
            return cars;
        }
        return cars.filter(car => 
            car.brand.toLowerCase().includes(search) || 
            car.model.toLowerCase().includes(search) || 
            car.plate.toLowerCase().includes(search)
        );
    }, [cars, carSearch, selectedCar]);

    return (
        <form action={async (formData) => { await createMaintenance(formData); }} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-gray-400" />
                    Wartungsdetails
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-3">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Fahrzeug auswählen *</label>
                        <div ref={carContainerRef} className="relative">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <CarIcon className="w-4 h-4" />
                                </span>
                                <input 
                                    type="text"
                                    placeholder="Nach Kennzeichen, Marke... suchen"
                                    className="w-full pl-9 pr-10 py-3 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm text-gray-900 dark:text-white font-medium"
                                    value={carSearch}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCarSearch(val);
                                        if (!val) setSelectedCarId('');
                                        setIsCarDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsCarDropdownOpen(true)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                                    onClick={() => setIsCarDropdownOpen(prev => !prev)}
                                >
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCarDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            
                            {isCarDropdownOpen && (
                                <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-955 rounded-xl py-1 focus:outline-none">
                                    {filteredCars.length === 0 ? (
                                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                                            Keine Fahrzeuge gefunden
                                        </div>
                                    ) : (
                                        filteredCars.map(car => (
                                            <div
                                                key={car.id}
                                                onClick={() => {
                                                    setSelectedCarId(car.id);
                                                    setCarSearch(`${car.brand} ${car.model} [${car.plate}]`);
                                                    setIsCarDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                                    selectedCarId === car.id ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {car.brand} {car.model}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono shrink-0">
                                                        {car.plate}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            <input type="hidden" name="carId" value={selectedCarId} required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Art der Wartung *</label>
                        <select name="maintenanceType" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                            <option value="Oil Change">Ölwechsel</option>
                            <option value="Tire Change">Reifenwechsel</option>
                            <option value="Inspection">Inspektion</option>
                            <option value="Repair">Reparatur</option>
                            <option value="Service">Service</option>
                            <option value="Other">Sonstiges</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Datum der Durchführung *</label>
                        <input name="performedDate" type="date" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Beschreibung *</label>
                        <input name="description" type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder="z.B. Bremsbeläge vorne gewechselt" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    Kosten & Zusätzliche Infos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kosten (€)</label>
                        <input name="cost" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kilometerstand (bei Wartung)</label>
                        <input name="mileage" type="number" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Durchgeführt von (Werkstatt/Person)</label>
                        <input name="performedBy" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notizen</label>
                        <textarea name="notes" rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"></textarea>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <FileUp className="w-5 h-5 text-gray-400" />
                    Rechnung hochladen
                </h2>
                <ImageUpload 
                    name="invoiceUrl" 
                    label="Rechnung / Beleg (PDF oder Bild)" 
                    uploadUrl="/api/admin/maintenance/upload"
                    accept="image/*,.pdf"
                    onUploadSuccess={(url) => setInvoiceUrl(url)}
                />
                <input type="hidden" name="invoiceUrl" value={invoiceUrl} />
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Link
                    href="/admin/maintenance"
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                >
                    Abbrechen
                </Link>
                <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                >
                    <Save className="w-5 h-5" />
                    Eintrag speichern
                </button>
            </div>
        </form>
    );
}
