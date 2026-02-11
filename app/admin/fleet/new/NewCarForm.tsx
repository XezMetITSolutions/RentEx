'use client';

import { createCar } from '@/app/actions';
import { ArrowLeft, Car, Save, Tag, ShieldCheck, Wrench, DollarSign, Settings as SettingsIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Option as OptionType } from '@prisma/client';

export default function NewCarForm({ allOptions }: { allOptions: OptionType[] }) {
    const [activeTab, setActiveTab] = useState('basic');

    const tabs = [
        { id: 'basic', label: 'Basis & Design', icon: Car },
        { id: 'technical', label: 'Technische Daten', icon: SettingsIcon },
        { id: 'features', label: 'Ausstattung', icon: CheckCircle },
        { id: 'options', label: 'Zusatzoptionen', icon: Tag },
        { id: 'pricing', label: 'Preise & Kampagnen', icon: Tag },
        { id: 'insurance', label: 'Versicherung & Dokumente', icon: ShieldCheck },
        { id: 'maintenance', label: 'Wartung & Service', icon: Wrench },
        { id: 'financial', label: 'Finanzielle Daten', icon: DollarSign },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Neues Fahrzeug erfassen</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vollständige Verwaltung inklusive Wartungshistorie und Kampagnen</p>
                </div>
                <Link
                    href="/admin/fleet"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Abbrechen
                </Link>
            </div>

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

            <form action={createCar} className="space-y-8">
                {/* Tab: Basis & Design */}
                <div className={activeTab === 'basic' ? 'block' : 'hidden'}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Grundinformationen</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Marke *</label>
                                        <input name="brand" type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="z.B. BMW" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modell *</label>
                                        <input name="model" type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="z.B. 320i" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Baujahr *</label>
                                        <input name="year" type="number" required defaultValue={2024} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Farbe *</label>
                                        <input name="color" type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="Schwarz" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kennzeichen *</label>
                                        <input name="plate" type="text" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="M-AB 1234" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategorie</label>
                                        <select name="category" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                            <option>Kleinwagen</option>
                                            <option>Mittelklasse</option>
                                            <option>Limousine</option>
                                            <option>SUV</option>
                                            <option>Van</option>
                                            <option>Sportwagen</option>
                                            <option>Cabrio</option>
                                            <option>Kombi</option>
                                            <option>Elektro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                        <select name="status" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
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
                                    <input name="vin" type="text" maxLength={17} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="17-stellig" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fahrzeugfoto (URL)</label>
                                    <input name="imageUrl" type="url" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="/assets/cars/beispiel.jpg oder https://…" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Standort</label>
                                    <select name="locationId" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                        <option value="">– Kein Standort –</option>
                                        <option value="1">Hauptfiliale Feldkirch</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Beschreibung</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Öffentliche Beschreibung</label>
                                    <textarea name="description" rows={6} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white resize-none" placeholder="Highlight-Features, Fahrgefühl..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interne Notizen</label>
                                    <textarea name="internalNotes" rows={4} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white resize-none" placeholder="Schäden, Besonderheiten..."></textarea>
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
                                <select name="fuelType" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                    <option>Benzin</option>
                                    <option>Diesel</option>
                                    <option>Elektro</option>
                                    <option>Hybrid</option>
                                    <option>Plug-in Hybrid</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Getriebe</label>
                                <select name="transmission" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                    <option>Automatik</option>
                                    <option>Manuell</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motorhubraum</label>
                                <input name="engineSize" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="z.B. 2.0L" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Leistung (PS)</label>
                                <input name="horsePower" type="number" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="184" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verbrauch (L/100km)</label>
                                <input name="fuelConsumption" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="6.2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CO₂-Emission (g/km)</label>
                                <input name="co2Emission" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="142" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Türen</label>
                                <input name="doors" type="number" defaultValue={4} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sitzplätze</label>
                                <input name="seats" type="number" defaultValue={5} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kilometerstand</label>
                                <input name="currentMileage" type="number" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="15000" />
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
                                    <input type="checkbox" name={feature.name} className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature.label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Weitere Ausstattung (kommasepariert)</label>
                            <input name="features" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="LED-Scheinwerfer, Ledersitze, Panoramadach" />
                        </div>
                    </div>
                </div>

                {/* Tab: Zusatzoptionen (Extras & Packages) */}
                <div className={activeTab === 'options' ? 'block' : 'hidden'}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Zusatzoptionen & Kilometer-Pakete</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Wählen Sie die verfügbaren Optionen für dieses neue Fahrzeug.</span>
                        </div>

                        <div className="space-y-8">
                            {/* Packages (Kilometer) */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 border-b dark:border-gray-700 pb-2">Mehrkilometer-Pakete</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allOptions?.filter(o => o.type === 'package').map((option: any) => (
                                        <label key={option.id} className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all">
                                            <input
                                                type="checkbox"
                                                name="options"
                                                value={option.id}
                                                className="mt-1 w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                            />
                                            <div>
                                                <span className="block text-sm font-bold text-gray-900 dark:text-white">{option.name}</span>
                                                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(option.price))}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Extras & Insurance */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 border-b dark:border-gray-700 pb-2">Zusatzoptionen & Schutz</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {allOptions?.filter(o => o.type !== 'package').map((option: any) => (
                                        <label key={option.id} className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all">
                                            <input
                                                type="checkbox"
                                                name="options"
                                                value={option.id}
                                                className="mt-1 w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                            />
                                            <div>
                                                <span className="block text-sm font-bold text-gray-900 dark:text-white">{option.name}</span>
                                                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(option.price))} {option.isPerDay ? '/ Tag' : ''}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab: Pricing & Campaigns */}
                <div className={activeTab === 'pricing' ? 'block' : 'hidden'}>
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Mietpreise</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tagespreis (€) *</label>
                                    <input name="dailyRate" type="number" step="0.01" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="150.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Wochenpreis (€)</label>
                                    <input name="weeklyRate" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="900.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monatspreis (€)</label>
                                    <input name="monthlyRate" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="3200.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kaution (€)</label>
                                    <input name="depositAmount" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="500.00" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">🎉 Kampagnen & Sonderaktionen</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aktionspreis (€/Tag)</label>
                                    <input name="promoPrice" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="99.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gültig von</label>
                                    <input name="promoStartDate" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gültig bis</label>
                                    <input name="promoEndDate" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
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
                                <input name="insuranceCompany" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="Allianz" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Versicherungsnummer</label>
                                <input name="insurancePolicyNumber" type="text" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Versicherung gültig bis</label>
                                <input name="insuranceValidUntil" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Erstzulassung</label>
                                <input name="registrationDate" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nächste TÜV/HU</label>
                                <input name="nextInspection" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vignette gültig bis</label>
                                <input name="vignetteValidUntil" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
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
                                <input name="lastOilChange" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nächster Ölwechsel</label>
                                <input name="nextOilChange" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Letzter Reifenwechsel</label>
                                <input name="lastTireChange" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reifentyp</label>
                                <select name="tireType" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white">
                                    <option>Sommerreifen</option>
                                    <option>Winterreifen</option>
                                    <option>Allwetter</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Letzter Service</label>
                                <input name="lastServiceDate" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nächster Service</label>
                                <input name="nextServiceDate" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
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
                                <input name="purchasePrice" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="45000.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Anschaffungsdatum</label>
                                <input name="purchaseDate" type="date" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aktueller Wert (€)</label>
                                <input name="currentValue" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="38000.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kilometerstand bei Kauf</label>
                                <input name="purchaseMileage" type="number" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 dark:text-white" placeholder="0" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                        href="/admin/fleet"
                        className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                    >
                        Abbrechen
                    </Link>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/30 transition-all hover:scale-105"
                    >
                        <Save className="w-5 h-5" />
                        Fahrzeug speichern
                    </button>
                </div>
            </form>
        </div>
    );
}
