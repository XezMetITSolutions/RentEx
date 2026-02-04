'use client';

import { createRental } from '@/app/actions';
import { Calendar, MapPin, User, Car as CarIcon, DollarSign, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { differenceInDays } from 'date-fns';

type Car = {
    id: number;
    brand: string;
    model: string;
    plate: string;
    dailyRate: number; // Prisma Decimal is serialized to string or number depending on config, but usually string in JSON, let's assume number for passed prop or handle conversion
};

type Customer = {
    id: number;
    firstName: string;
    lastName: string;
};

type Location = {
    id: number;
    name: string;
};

export default function ReservationForm({ cars, customers, locations }: { cars: any[], customers: Customer[], locations: Location[] }) {
    const [selectedCarId, setSelectedCarId] = useState<number | string>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const selectedCar = useMemo(() => cars.find(c => c.id === Number(selectedCarId)), [selectedCarId, cars]);

    const estimatedTotal = useMemo(() => {
        if (!selectedCar || !startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = differenceInDays(end, start);
        if (days <= 0) return 0;
        return Number(selectedCar.dailyRate) * days;
    }, [selectedCar, startDate, endDate]);

    return (
        <form action={createRental} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <CarIcon className="w-5 h-5 text-gray-400" />
                    Fahrzeug & Kunde
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fahrzeug auswählen *</label>
                        <select
                            name="carId"
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                            onChange={(e) => setSelectedCarId(e.target.value)}
                        >
                            <option value="">Bitte wählen...</option>
                            {cars.map(car => (
                                <option key={car.id} value={car.id}>
                                    {car.brand} {car.model} ({car.plate}) - €{Number(car.dailyRate)}/Tag
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kunde auswählen *</label>
                        <select name="customerId" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                            <option value="">Bitte wählen...</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.firstName} {customer.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    Zeitraum & Ort
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Abholdatum *</label>
                        <input
                            name="startDate"
                            type="date"
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rückgabedatum *</label>
                        <input
                            name="endDate"
                            type="date"
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Abholort</label>
                        <select name="pickupLocationId" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                            <option value="">Kein Ort ausgewählt</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rückgabeort</label>
                        <select name="returnLocationId" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                            <option value="">Kein Ort ausgewählt</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                    Kosten & Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vorauszahlung / Kaution</label>
                        <input name="depositPaid" type="number" step="0.01" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tankregelung</label>
                        <select name="fuelLevelPickup" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white">
                            <option value="Full">Voll</option>
                            <option value="3/4">3/4</option>
                            <option value="1/2">1/2</option>
                            <option value="1/4">1/4</option>
                            <option value="Empty">Leer</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notizen</label>
                        <textarea name="notes" rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"></textarea>
                    </div>
                </div>

                {estimatedTotal > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex justify-between items-center">
                        <span className="text-blue-900 dark:text-blue-100 font-medium">Geschätzter Gesamtpreis:</span>
                        <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(estimatedTotal)}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
                <Link
                    href="/admin/reservations"
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                >
                    Abbrechen
                </Link>
                <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                >
                    <Save className="w-5 h-5" />
                    Reservierung erstellen
                </button>
            </div>
        </form>
    );
}
