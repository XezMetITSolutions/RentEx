'use client';

import { updateCar, deleteOption, createOption, updateOption } from '@/app/actions';
import {
    Car as CarIcon,
    Save,
    Tag,
    ShieldCheck,
    Wrench,
    DollarSign,
    Settings as SettingsIcon,
    CheckCircle,
    Plus,
    Trash2,
    Edit2,
    X,
    Loader2
} from 'lucide-react';
import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Car as CarType, Option as OptionType, OptionGroup as GroupType } from '@prisma/client';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

function SaveCarButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            title="Änderungen speichern"
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/30 transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Speichern…
                </>
            ) : (
                <>
                    <Save className="w-5 h-5" />
                    Änderungen speichern
                </>
            )}
        </button>
    );
}

interface ExtendedCar extends CarType {
    options?: OptionType[];
}

interface ExtendedOption extends OptionType {
    group?: GroupType;
}

interface LocationType { id: number; name: string; code?: string | null; }
interface CarCategoryType { id: number; name: string; sortOrder: number; }

export default function CarEditForm({ car, allOptions, groups, locations = [], categories = [] }: { car: ExtendedCar, allOptions: ExtendedOption[], groups: GroupType[], locations?: LocationType[], categories?: CarCategoryType[] }) {
    const [activeTab, setActiveTab] = useState('basic');
    const [isPending, startTransition] = useTransition();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<OptionType | null>(null);

    const updateCarWithId = updateCar.bind(null, car.id);

    const handleDeleteOption = (id: number) => {
        if (!confirm('Diesen Zusatz löschen?')) return;
        startTransition(async () => {
            await deleteOption(id);
        });
    };

    const handleCreateOption = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await createOption(formData);
            if (result.success) setIsAddModalOpen(false);
        });
    };

    const handleUpdateOption = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingOption) return;
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await updateOption(editingOption.id, formData);
            if (result.success) setEditingOption(null);
        });
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        return new Date(date).toISOString().split('T')[0];
    };

    const tabs = [
        { id: 'basic', label: 'Basis & Design', icon: CarIcon },
        { id: 'technical', label: 'Technische Daten', icon: SettingsIcon },
        { id: 'features', label: 'Ausstattung', icon: CheckCircle },
        { id: 'options', label: 'Zusatzoptionen', icon: Tag },
        { id: 'pricing', label: 'Preise & Kampagnen', icon: Tag },
        { id: 'insurance', label: 'Versicherung & Dokumente', icon: ShieldCheck },
        { id: 'maintenance', label: 'Wartung & Service', icon: Wrench },
        { id: 'financial', label: 'Finanzielle Daten', icon: DollarSign },
    ];

    return (
        <>
            {/* Tabs */}
            <div className="mb-8 overflow-x-auto">
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <form action={updateCarWithId} className="space-y-8">
                {/* Tab: Basis & Design */}
                <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grundinformationen</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Marke *</label>
                                        <input name="brand" type="text" required defaultValue={car.brand} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modell *</label>
                                        <input name="model" type="text" required defaultValue={car.model} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Baujahr *</label>
                                        <input name="year" type="number" required defaultValue={car.year} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Farbe *</label>
                                        <input name="color" type="text" required defaultValue={car.color} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kennzeichen *</label>
                                        <input name="plate" type="text" required defaultValue={car.plate} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategorie</label>
                                        <select name="category" defaultValue={car.category || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                            <option value="">—</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                        <select name="status" defaultValue={car.status} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                            <option value="Active">Verfügbar</option>
                                            <option value="Maintenance">Wartung</option>
                                            <option value="Rented">Vermietet</option>
                                            <option value="Reserved">Reserviert</option>
                                            <option value="Inactive">Inaktiv</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">VIN (Fahrgestellnummer)</label>
                                    <input name="vin" type="text" maxLength={17} defaultValue={car.vin || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chassis-Nr. / Fahrgestellnummer</label>
                                    <input name="chassisNumber" type="text" defaultValue={car.chassisNumber || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" name="isActive" defaultChecked={car.isActive !== false} className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500" />
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Fahrzeug aktiv</label>
                                </div>
                                <ImageUpload defaultValue={car.imageUrl || ''} name="imageUrl" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Beschreibung</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Öffentliche Beschreibung</label>
                                    <textarea name="description" rows={6} defaultValue={car.description || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white resize-none"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interne Notizen</label>
                                    <textarea name="internalNotes" rows={4} defaultValue={car.internalNotes || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white resize-none"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schadenverlauf (JSON/Text)</label>
                                    <textarea name="damageHistory" rows={2} defaultValue={car.damageHistory || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white resize-none"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weitere Bilder (URLs, kommasepariert)</label>
                                    <input name="images" type="text" defaultValue={car.images || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab: Technical Data */}
                <div className={activeTab === 'technical' ? 'block' : 'hidden'}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Technische Spezifikationen</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kraftstoffart</label>
                                <select name="fuelType" defaultValue={car.fuelType} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                    <option>Benzin</option>
                                    <option>Diesel</option>
                                    <option>Elektro</option>
                                    <option>Hybrid</option>
                                    <option>Plug-in Hybrid</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Getriebe</label>
                                <select name="transmission" defaultValue={car.transmission || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                    <option>Automatik</option>
                                    <option>Manuell</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motorhubraum</label>
                                <input name="engineSize" type="text" defaultValue={car.engineSize || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Leistung (PS)</label>
                                <input name="horsePower" type="number" defaultValue={car.horsePower || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verbrauch (L/100km)</label>
                                <input name="fuelConsumption" type="text" defaultValue={car.fuelConsumption || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CO₂-Emission (g/km)</label>
                                <input name="co2Emission" type="text" defaultValue={car.co2Emission || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Türen</label>
                                <input name="doors" type="number" defaultValue={car.doors || 4} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sitzplätze</label>
                                <input name="seats" type="number" defaultValue={car.seats || 5} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kilometerstand</label>
                                <input name="currentMileage" type="number" defaultValue={car.currentMileage || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max. km/Tag (Miete)</label>
                                <input name="maxMileagePerDay" type="number" defaultValue={car.maxMileagePerDay || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Breite (GPS)</label>
                                <input name="latitude" type="number" step="any" defaultValue={car.latitude ?? ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="z.B. 47.2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Länge (GPS)</label>
                                <input name="longitude" type="number" step="any" defaultValue={car.longitude ?? ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="z.B. 9.6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab: Features */}
                <div className={activeTab === 'features' ? 'block' : 'hidden'}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Fahrzeugausstattung</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[
                                { name: 'hasAirConditioning', label: 'Klimaanlage' },
                                { name: 'hasGPS', label: 'GPS Navigation' },
                                { name: 'hasHeatedSeats', label: 'Sitzheizung' },
                                { name: 'hasParkingSensors', label: 'Parksensoren' },
                                { name: 'hasBackupCamera', label: 'Rückfahrkamera' },
                                { name: 'hasCruiseControl', label: 'Tempomat' },
                                { name: 'hasBluetoothAudio', label: 'Bluetooth' },
                                { name: 'hasUSBPorts', label: 'USB-Anschlüsse' },
                                { name: 'hasChildSeatAnchors', label: 'Kindersitz-Befestigung' },
                                { name: 'hasSkiRack', label: 'Skiträger' },
                                { name: 'hasTowHitch', label: 'Anhängerkupplung' },
                            ].map((feature) => (
                                <label key={feature.name} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                    <input type="checkbox" name={feature.name} defaultChecked={!!car[feature.name as keyof CarType]} className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature.label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weitere Ausstattung (kommasepariert)</label>
                            <input name="features" type="text" defaultValue={car.features || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                        </div>
                    </div>
                </div>

                {/* Tab: Zusatzoptionen (Extras & Packages) */}
                <div className={activeTab === 'options' ? 'block' : 'hidden'}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Zusatzoptionen & Kilometer-Pakete</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hier können Sie festlegen, welche Optionen für dieses Fahrzeug verfügbar sind.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Neue Option
                            </button>
                        </div>

                        {/* Filter based on group/category for quick selection if needed */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Schnellwahl nach Gruppen</h4>
                            <div className="flex flex-wrap gap-2">
                                {groups?.map(g => (
                                    <button
                                        key={g.id}
                                        type="button"
                                        onClick={() => {
                                            const groupOptionIds = allOptions.filter(o => o.groupId === g.id).map(o => o.id);
                                            const checkboxes = document.querySelectorAll('input[name="options"]');
                                            checkboxes.forEach((cb: any) => {
                                                if (groupOptionIds.includes(Number(cb.value))) cb.checked = true;
                                            });
                                        }}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[11px] font-bold hover:bg-red-50 hover:border-red-200 transition-all"
                                    >
                                        {g.name} wählen
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Packages (Kilometer) */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Mehrkilometer-Pakete
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allOptions?.filter(o => (o.carId === null || o.carId === car.id) && o.type === 'package').map((option) => (
                                        <div key={option.id} className="relative group p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    name="options"
                                                    value={option.id}
                                                    defaultChecked={car.options?.some(o => o.id === option.id)}
                                                    className="mt-1 w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                                                />
                                                <div className="flex-1">
                                                    <span className="block text-sm font-bold text-gray-900 dark:text-white">{option.name}</span>
                                                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(option.price))}
                                                    </span>
                                                </div>
                                                {option.carId === car.id && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button type="button" onClick={() => setEditingOption(option)} className="p-1.5 text-gray-400 hover:text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                                                        <button type="button" onClick={() => handleDeleteOption(option.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Extras & Insurance */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    Zusatzoptionen & Schutz
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allOptions?.filter(o => (o.carId === null || o.carId === car.id) && o.type !== 'package').map((option) => {
                                        const isExtra = option.type === 'extra';
                                        const isInsurance = option.type === 'insurance';
                                        const isDriver = option.type === 'driver';

                                        return (
                                            <div key={option.id} className="relative group p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        name="options"
                                                        value={option.id}
                                                        defaultChecked={car.options?.some(o => o.id === option.id)}
                                                        className="mt-1 w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{option.name}</span>
                                                            {isInsurance && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                                                            {isDriver && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                                                            {isExtra && <Tag className="w-3.5 h-3.5 text-orange-500" />}
                                                        </div>
                                                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(option.price))} {option.isPerDay ? '/ Tag' : ''}
                                                        </span>
                                                    </div>
                                                    {option.carId === car.id && (
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button type="button" onClick={() => setEditingOption(option)} className="p-1.5 text-gray-400 hover:text-blue-500"><Edit2 className="w-3.5 h-3.5" /></button>
                                                            <button type="button" onClick={() => handleDeleteOption(option.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals for Options */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Neue Option erstellen</h2>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateOption} className="p-6 space-y-4">
                                <input type="hidden" name="carId" value={car.id} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input name="name" type="text" required className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gruppe</label>
                                    <select name="groupId" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                        <option value="">Keine Gruppe</option>
                                        {groups?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ</label>
                                        <select name="type" className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                            <option value="package">Kilometer-Paket</option>
                                            <option value="extra">Extra</option>
                                            <option value="insurance">Versicherung</option>
                                            <option value="driver">Fahrer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preis (€)</label>
                                        <input name="price" type="number" step="0.01" required className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input name="isPerDay" type="checkbox" className="w-4 h-4 text-red-600 rounded" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Pro Tag berechnen</span>
                                </label>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm text-gray-500">Abbrechen</button>
                                    <button type="submit" disabled={isPending} className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">
                                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Erstellen
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {editingOption && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Option bearbeiten</h2>
                                <button type="button" onClick={() => setEditingOption(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateOption} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input name="name" type="text" required defaultValue={editingOption.name} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ</label>
                                        <select name="type" defaultValue={editingOption.type || 'extra'} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white">
                                            <option value="package">Kilometer-Paket</option>
                                            <option value="extra">Extra</option>
                                            <option value="insurance">Versicherung</option>
                                            <option value="driver">Fahrer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preis (€)</label>
                                        <input name="price" type="number" step="0.01" required defaultValue={Number(editingOption.price)} className="w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input name="isPerDay" type="checkbox" defaultChecked={editingOption.isPerDay} className="w-4 h-4 text-red-600 rounded" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">Pro Tag berechnen</span>
                                </label>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setEditingOption(null)} className="px-4 py-2 text-sm text-gray-500">Abbrechen</button>
                                    <button type="submit" disabled={isPending} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">
                                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Speichern
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tab: Pricing & Campaigns */}
                <div className={activeTab === 'pricing' ? 'block' : 'hidden'}>
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Mietpreise</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tagespreis (€) *</label>
                                    <input name="dailyRate" type="number" step="0.01" required defaultValue={Number(car.dailyRate)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Wochenpreis (€)</label>
                                    <input name="weeklyRate" type="number" step="0.01" defaultValue={Number(car.weeklyRate) || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monatspreis (€)</label>
                                    <input name="monthlyRate" type="number" step="0.01" defaultValue={Number(car.monthlyRate) || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kaution (€)</label>
                                    <input name="depositAmount" type="number" step="0.01" defaultValue={Number(car.depositAmount) || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Langzeitpreis (€)</label>
                                    <input name="longTermRate" type="number" step="0.01" defaultValue={Number(car.longTermRate) || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min. Tage Langzeit</label>
                                    <input name="minDaysForLongTerm" type="number" defaultValue={car.minDaysForLongTerm ?? ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">🎉 Kampagnen & Sonderaktionen</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aktionspreis (€/Tag)</label>
                                    <input name="promoPrice" type="number" step="0.01" defaultValue={Number(car.promoPrice) || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gültig von</label>
                                    <input name="promoStartDate" type="date" defaultValue={formatDate(car.promoStartDate)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gültig bis</label>
                                    <input name="promoEndDate" type="date" defaultValue={formatDate(car.promoEndDate)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab: Insurance & Documents */}
                <div className={activeTab === 'insurance' ? 'block' : 'hidden'}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Versicherung & Dokumente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Versicherungsgesellschaft</label>
                                <input name="insuranceCompany" type="text" defaultValue={car.insuranceCompany || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Versicherungsnummer</label>
                                <input name="insurancePolicyNumber" type="text" defaultValue={car.insurancePolicyNumber || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Versicherung gültig bis</label>
                                <input name="insuranceValidUntil" type="date" defaultValue={formatDate(car.insuranceValidUntil)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Erstzulassung</label>
                                <input name="registrationDate" type="date" defaultValue={formatDate(car.registrationDate)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nächste TÜV/HU</label>
                                <input name="nextInspection" type="date" defaultValue={formatDate(car.nextInspection)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vignette gültig bis</label>
                                <input name="vignetteValidUntil" type="date" defaultValue={formatDate(car.vignetteValidUntil)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vignetten-Typ</label>
                                <select name="vignetteType" defaultValue={car.vignetteType || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                    <option value="">—</option>
                                    <option>Jahresvignette</option>
                                    <option>2-Monatsvignette</option>
                                    <option>10-Tage-Vignette</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Standort</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Aktueller Standort</label>
                                        <select name="locationId" defaultValue={car.locationId ?? ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                            <option value="">— Keiner —</option>
                                            {locations.map((loc) => (
                                                <option key={loc.id} value={loc.id}>{loc.name}{loc.code ? ` (${loc.code})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Heimatstandort</label>
                                        <select name="homeLocationId" defaultValue={car.homeLocationId ?? ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                            <option value="">— Keiner —</option>
                                            {locations.map((loc) => (
                                                <option key={loc.id} value={loc.id}>{loc.name}{loc.code ? ` (${loc.code})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab: Maintenance */}
                <div className={activeTab === 'maintenance' ? 'block' : 'hidden'}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Wartung & Service</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Letzter Ölwechsel</label>
                                <input name="lastOilChange" type="date" defaultValue={formatDate(car.lastOilChange)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nächster Ölwechsel</label>
                                <input name="nextOilChange" type="date" defaultValue={formatDate(car.nextOilChange)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Letzter Reifenwechsel</label>
                                <input name="lastTireChange" type="date" defaultValue={formatDate(car.lastTireChange)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reifentyp</label>
                                <select name="tireType" defaultValue={car.tireType || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                    <option>Sommerreifen</option>
                                    <option>Winterreifen</option>
                                    <option>Allwetter</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Letzter Service</label>
                                <input name="lastServiceDate" type="date" defaultValue={formatDate(car.lastServiceDate)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nächster Service</label>
                                <input name="nextServiceDate" type="date" defaultValue={formatDate(car.nextServiceDate)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab: Financial */}
                <div className={activeTab === 'financial' ? 'block' : 'hidden'}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Finanzielle Daten</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Anschaffungspreis (€)</label>
                                <input name="purchasePrice" type="number" step="0.01" defaultValue={Number(car.purchasePrice) || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Anschaffungsdatum</label>
                                <input name="purchaseDate" type="date" defaultValue={formatDate(car.purchaseDate)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aktueller Wert (€)</label>
                                <input name="currentValue" type="number" step="0.01" defaultValue={Number(car.currentValue) || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kilometerstand bei Kauf</label>
                                <input name="purchaseMileage" type="number" defaultValue={Number(car.purchaseMileage) || ''} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href={`/admin/fleet/${car.id}`}
                        className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                        Abbrechen
                    </Link>
                    <SaveCarButton />
                </div>
            </form>
        </>
    );
}
