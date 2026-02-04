'use client';

import { createMaintenance } from '@/app/actions';
import { Wrench, Calendar, DollarSign, Save, FileText, Activity } from 'lucide-react';
import Link from 'next/link';

type Car = {
    id: number;
    brand: string;
    model: string;
    plate: string;
};

export default function MaintenanceForm({ cars }: { cars: Car[] }) {
    return (
        <form action={createMaintenance} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-gray-400" />
                    Wartungsdetails
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fahrzeug auswählen *</label>
                        <select name="carId" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                            <option value="">Bitte wählen...</option>
                            {cars.map(car => (
                                <option key={car.id} value={car.id}>
                                    {car.brand} {car.model} ({car.plate})
                                </option>
                            ))}
                        </select>
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
