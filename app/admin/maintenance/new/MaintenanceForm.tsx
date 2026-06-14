'use client';

import { createMaintenance } from '@/app/actions';
import { 
    Wrench, 
    Calendar, 
    DollarSign, 
    Save, 
    FileText, 
    Activity, 
    Search, 
    FileUp, 
    ChevronDown, 
    Car as CarIcon, 
    Settings as SettingsIcon, 
    AlertTriangle,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';

type Car = {
    id: number;
    brand: string;
    model: string;
    plate: string;
    currentMileage: number | null;
};

const maintenanceTypes = [
    { id: 'Oil Change', name: 'Ölwechsel', description: 'Motoröl & Filter', icon: Wrench, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' },
    { id: 'Tire Change', name: 'Reifenwechsel', description: 'Saisonaler Wechsel', icon: Activity, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' },
    { id: 'Inspection', name: 'Inspektion', description: 'TÜV/§57a Überprüfung', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' },
    { id: 'Repair', name: 'Reparatur', description: 'Verschleiß/Defekt', icon: AlertTriangle, color: 'text-red-500 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900/50' },
    { id: 'Service', name: 'Service', description: 'Regulärer Service', icon: SettingsIcon, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200 dark:border-purple-900/50' },
    { id: 'Other', name: 'Sonstiges', description: 'Andere Arbeiten', icon: FileText, color: 'text-gray-500 bg-gray-50 dark:bg-gray-950/30 dark:text-gray-400 border-gray-200 dark:border-gray-900/50' }
];

export default function MaintenanceForm({ cars }: { cars: Car[] }) {
    const [carSearch, setCarSearch] = useState('');
    const [selectedCarId, setSelectedCarId] = useState<number | string>('');
    const [invoiceUrl, setInvoiceUrl] = useState('');
    const [selectedType, setSelectedType] = useState('Oil Change');
    const [performedDate, setPerformedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [cost, setCost] = useState('');
    const [mileage, setMileage] = useState('');
    const [performedBy, setPerformedBy] = useState('');
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');

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

    // Validate Mileage
    const isMileageInvalid = useMemo(() => {
        if (!selectedCar || !mileage) return false;
        const current = selectedCar.currentMileage || 0;
        return Number(mileage) < current;
    }, [selectedCar, mileage]);

    return (
        <form action={async (formData) => { await createMaintenance(formData); }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left side: Form Inputs */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Primary Vehicle Selection & Type selection */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50 space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/50 pb-4">
                            <Wrench className="w-5 h-5 text-blue-500" />
                            Wartungsdetails
                        </h2>

                        {/* Vehicle Selector */}
                        <div className="space-y-3">
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
                                    <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-950 rounded-xl py-1 focus:outline-none">
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
                                                    {car.currentMileage !== null && (
                                                        <span className="text-xs text-gray-400 font-mono shrink-0">
                                                            {car.currentMileage.toLocaleString('de-AT')} km
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                                <input type="hidden" name="carId" value={selectedCarId} required />
                            </div>
                        </div>

                        {/* Maintenance Type click cards */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Art der Wartung *</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {maintenanceTypes.map(type => {
                                    const TypeIcon = type.icon;
                                    const isSelected = selectedType === type.id;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setSelectedType(type.id)}
                                            className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                                                isSelected 
                                                    ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 dark:bg-blue-950/20 dark:border-blue-400' 
                                                    : 'bg-white dark:bg-gray-900 border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700'
                                            }`}
                                        >
                                            <div className={`p-1.5 rounded-lg w-8 h-8 flex items-center justify-center mb-2.5 border ${type.color}`}>
                                                <TypeIcon className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{type.name}</span>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{type.description}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <input type="hidden" name="maintenanceType" value={selectedType} />
                        </div>
                    </div>

                    {/* Operational parameters, Description & Cost info */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/50 pb-4 mb-6">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                            Kosten & Durchführung
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Datum der Durchführung *</label>
                                <input 
                                    name="performedDate" 
                                    type="date" 
                                    required 
                                    value={performedDate}
                                    onChange={(e) => setPerformedDate(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white outline-none" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kilometerstand (bei Wartung) *</label>
                                <input 
                                    name="mileage" 
                                    type="number" 
                                    required
                                    value={mileage}
                                    onChange={(e) => setMileage(e.target.value)}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none font-mono font-bold text-gray-900 dark:text-white ${
                                        isMileageInvalid 
                                            ? 'border-red-500 focus:ring-red-500/20' 
                                            : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
                                    }`} 
                                    placeholder={selectedCar?.currentMileage ? `Aktuell: ${selectedCar.currentMileage} km` : "z.B. 45000"}
                                />
                                {selectedCar && (
                                    <p className={`text-[10px] mt-1.5 font-semibold ${isMileageInvalid ? 'text-red-500' : 'text-gray-400'}`}>
                                        {isMileageInvalid 
                                            ? `Warnung: Der Kilometerstand darf nicht unter dem aktuellen Stand (${selectedCar.currentMileage} km) liegen.`
                                            : `Aktueller Stand des Fahrzeugs: ${selectedCar.currentMileage?.toLocaleString('de-AT') ?? 0} km`
                                        }
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kosten (€)</label>
                                <input 
                                    name="cost" 
                                    type="number" 
                                    step="0.01" 
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    placeholder="z.B. 180.00"
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white outline-none font-mono font-bold" 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Durchgeführt von (Werkstatt/Person)</label>
                                <input 
                                    name="performedBy" 
                                    type="text" 
                                    value={performedBy}
                                    onChange={(e) => setPerformedBy(e.target.value)}
                                    placeholder="z.B. ATU Feldkirch"
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white outline-none" 
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Beschreibung *</label>
                                <input 
                                    name="description" 
                                    type="text" 
                                    required 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white outline-none" 
                                    placeholder="z.B. Bremsbeläge vorne gewechselt" 
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notizen</label>
                                <textarea 
                                    name="notes" 
                                    rows={3} 
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white outline-none resize-none"
                                    placeholder="Spezielle Anmerkungen zur Wartung..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Sticky Upload Invoice & Summary invoice card */}
                <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-900/40 px-6 py-4 border-b border-gray-200/50 dark:border-gray-800/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Wartungsbeleg</h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Rechnung oder Quittung</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] px-2 py-0.5 font-bold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 uppercase tracking-tighter">Nachweis</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Invoice Upload without URL text input fallback */}
                            <ImageUpload 
                                name="invoiceUrl" 
                                label="Rechnung / Beleg (PDF oder Bild)" 
                                uploadUrl="/api/admin/maintenance/upload"
                                accept="image/*,.pdf"
                                hideUrlInput={true}
                                onUploadSuccess={(url) => setInvoiceUrl(url)}
                            />
                            <input type="hidden" name="invoiceUrl" value={invoiceUrl} />

                            {/* Summary Invoice Details */}
                            {selectedCar && (
                                <div className="border-t border-gray-150 dark:border-gray-700/60 pt-4 space-y-3">
                                    <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Zusammenfassung</h4>
                                    
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">Fahrzeug</span>
                                        <span className="font-bold text-gray-800 dark:text-gray-200 text-right">{selectedCar.brand} {selectedCar.model}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">Platte</span>
                                        <span className="font-mono font-bold text-gray-850 dark:text-gray-200 bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded">{selectedCar.plate}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">Typ</span>
                                        <span className="font-bold text-gray-800 dark:text-gray-200">
                                            {maintenanceTypes.find(t => t.id === selectedType)?.name ?? selectedType}
                                        </span>
                                    </div>
                                    {mileage && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 dark:text-gray-400">Kilometerstand</span>
                                            <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">{Number(mileage).toLocaleString('de-AT')} km</span>
                                        </div>
                                    )}

                                    {cost && (
                                        <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-100 dark:border-gray-700/50">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">Gesamtkosten</span>
                                            <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                                                €{Number(cost).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 p-6 flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={isMileageInvalid || !selectedCarId || !performedDate || !description}
                            className={`flex items-center justify-center gap-2 w-full py-3.5 px-4 text-white font-bold rounded-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isMileageInvalid || !selectedCarId || !performedDate || !description
                                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:scale-[1.01] active:scale-95'
                            }`}
                        >
                            <Save className="w-5 h-5" />
                            Eintrag speichern
                        </button>
                        
                        <Link
                            href="/admin/maintenance"
                            className="flex items-center justify-center w-full py-3.5 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-semibold transition-colors border border-gray-200 dark:border-gray-750 text-sm"
                        >
                            Abbrechen
                        </Link>
                    </div>
                </div>
            </div>
        </form>
    );
}
