'use client';

import { createRental } from '@/app/actions';
import { Calendar, MapPin, User, Car as CarIcon, DollarSign, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { differenceInDays, format, isWithinInterval, parseISO } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import CarCalendar from '@/components/admin/CarCalendar';
import CustomerModal from '@/components/admin/CustomerModal';
import { AlertTriangle, CreditCard, Banknote, Landmark } from 'lucide-react';

type Car = {
    id: number;
    brand: string;
    model: string;
    plate: string;
    dailyRate: number;
    rentals?: { startDate: Date | string; endDate: Date | string }[];
};

type Customer = {
    id: number;
    firstName: string;
    lastName: string;
    country: string | null;
    licenseNumber: string | null;
    licenseExpiryDate: Date | null | string;
    licensePhotoUrl: string | null;
    rentalsCount: number;
};

type Location = {
    id: number;
    name: string;
};

type Option = {
    id: number;
    name: string;
    price: number;
    description: string | null;
};

export default function ReservationForm({ cars, customers, locations, options }: { cars: any[], customers: Customer[], locations: Location[], options: Option[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const carIdFromUrl = searchParams.get('carId');
    const startDateFromUrl = searchParams.get('startDate');
    const endDateFromUrl = searchParams.get('endDate');

    const [selectedCarId, setSelectedCarId] = useState<number | string>(carIdFromUrl || '');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | string>('');
    const [carSearch, setCarSearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [startDate, setStartDate] = useState(startDateFromUrl || '');
    const [endDate, setEndDate] = useState(endDateFromUrl || '');
    const [depositPaid, setDepositPaid] = useState<string>('');
    const [calendarData, setCalendarData] = useState<{ rentals: any[], maintenance: any[], tasks: any[] } | null>(null);
    const [isCalendarLoading, setIsCalendarLoading] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [localCustomers, setLocalCustomers] = useState<Customer[]>(customers);
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isConflict, setIsConflict] = useState(false);

    const todayStr = new Date().toISOString().split('T')[0];

    const selectedCar = useMemo(() => cars.find(c => c.id === Number(selectedCarId)), [selectedCarId, cars]);
    const selectedCustomer = useMemo(() => localCustomers.find(c => c.id === Number(selectedCustomerId)), [selectedCustomerId, localCustomers]);

    useEffect(() => {
        if (carIdFromUrl) setSelectedCarId(carIdFromUrl);
        if (startDateFromUrl) setStartDate(startDateFromUrl);
        if (endDateFromUrl) setEndDate(endDateFromUrl);
    }, [carIdFromUrl, startDateFromUrl, endDateFromUrl]);

    useEffect(() => {
        setLocalCustomers(customers);
    }, [customers]);

    // Fetch calendar data when car changes
    useEffect(() => {
        if (selectedCarId) {
            const fetchCalendar = async () => {
                setIsCalendarLoading(true);
                try {
                    const res = await fetch(`/api/admin/cars/${selectedCarId}/calendar`);
                    if (res.ok) {
                        const data = await res.json();
                        setCalendarData(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch calendar:', error);
                } finally {
                    setIsCalendarLoading(false);
                }
            };
            fetchCalendar();
        } else {
            setCalendarData(null);
        }
    }, [selectedCarId]);

    const filteredCars = useMemo(() => {
        const search = carSearch.toLowerCase();
        return cars.filter(c => 
            c.brand.toLowerCase().includes(search) || 
            c.model.toLowerCase().includes(search) || 
            c.plate.toLowerCase().includes(search)
        );
    }, [cars, carSearch]);

    const filteredCustomers = useMemo(() => {
        const search = customerSearch.toLowerCase();
        return localCustomers.filter(c => 
            c.firstName.toLowerCase().includes(search) || 
            c.lastName.toLowerCase().includes(search)
        );
    }, [localCustomers, customerSearch]);

    // Check for conflicts
    useEffect(() => {
        if (!selectedCar || !startDate || !endDate || !calendarData) {
            setIsConflict(false);
            return;
        }

        const start = parseISO(startDate);
        const end = parseISO(endDate);

        const hasRentalConflict = calendarData.rentals.some(r => {
            const rStart = new Date(r.startDate);
            const rEnd = new Date(r.endDate);
            return (start < rEnd && end > rStart);
        });

        const hasMaintenanceConflict = calendarData.maintenance.some(m => {
            const mStart = new Date(m.performedDate);
            const mEnd = m.nextDueDate ? new Date(m.nextDueDate) : new Date(mStart.getTime() + 4 * 60 * 60 * 1000);
            return (start < mEnd && end > mStart);
        });

        setIsConflict(hasRentalConflict || hasMaintenanceConflict);
    }, [startDate, endDate, calendarData, selectedCar]);

    const isLicenseExpired = useMemo(() => {
        if (!selectedCustomer?.licenseExpiryDate) return false;
        return new Date(selectedCustomer.licenseExpiryDate) < new Date();
    }, [selectedCustomer]);

    // Deposit Logic: New Customer 750€, 3+ Rentals 250€
    useEffect(() => {
        if (selectedCustomer) {
            const isAustrian = selectedCustomer.country === 'Österreich';
            if (isAustrian) {
                setDepositPaid('0');
            } else {
                const count = selectedCustomer.rentalsCount || 0;
                setDepositPaid(count >= 3 ? '250' : '750');
            }
        }
    }, [selectedCustomer]);

    // Pricing calculation
    const pricing = useMemo(() => {
        if (!selectedCar || !startDate || !endDate) return { dailyTotal: 0, optionsTotal: 0, total: 0, days: 0 };
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = differenceInDays(end, start);
        if (days <= 0) return { dailyTotal: 0, optionsTotal: 0, total: 0, days: 0 };
        
        const dailyTotal = Number(selectedCar.dailyRate) * days;
        const optionsTotal = selectedOptions.reduce((acc, optId) => {
            const opt = options.find(o => o.id === optId);
            return acc + (opt ? Number(opt.price) : 0);
        }, 0);

        return {
            dailyTotal,
            optionsTotal,
            total: dailyTotal + optionsTotal,
            days
        };
    }, [selectedCar, startDate, endDate, selectedOptions, options]);

    return (
        <>
        <form action={async (formData) => { await createRental(formData); }} className="space-y-6">
            {/* Vehicle & Customer Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/50 pb-4">
                    <CarIcon className="w-5 h-5 text-blue-500" />
                    Fahrzeug & Kunde
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Vehicle */}
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Fahrzeug auswählen *</label>
                        <div className="space-y-2">
                            <input 
                                type="text"
                                placeholder="Nach Kennzeichen, Marke... suchen"
                                className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/50"
                                value={carSearch}
                                onChange={(e) => setCarSearch(e.target.value)}
                            />
                            <select
                                name="carId"
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all shadow-sm"
                                value={selectedCarId}
                                onChange={(e) => setSelectedCarId(e.target.value)}
                            >
                                <option value="">Bitte wählen...</option>
                                {filteredCars.map(car => (
                                    <option key={car.id} value={car.id}>
                                        {car.brand} {car.model} [{car.plate}] - €{Number(car.dailyRate)}/Tag
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Customer */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Kunde auswählen *</label>
                            <button 
                                type="button"
                                onClick={() => setIsCustomerModalOpen(true)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md"
                            >
                                <User className="w-3 h-3" />
                                Neuer Kunde
                            </button>
                        </div>
                        <div className="space-y-2">
                            <input 
                                type="text"
                                placeholder="Nach Vorname, Nachname... suchen"
                                className="w-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/50"
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                            />
                            <select
                                name="customerId"
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all shadow-sm"
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                            >
                                <option value="">Bitte wählen...</option>
                                {filteredCustomers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.firstName} {customer.lastName} {customer.country ? `(${customer.country})` : ''} — {customer.rentalsCount > 0 ? `${customer.rentalsCount} Mieten` : 'Neukunde'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Verification Details */}
                        {selectedCustomer && (
                            <div className={`mt-4 p-4 rounded-xl border ${isLicenseExpired ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-700'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Kunden-Verifizierung</h3>
                                    {isLicenseExpired && (
                                        <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full animate-pulse">
                                            ABGELAUFEN
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 font-medium">Führerscheinnummer</p>
                                        <p className="text-sm font-semibold dark:text-white">{selectedCustomer.licenseNumber || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 font-medium">Gültig bis</p>
                                        <p className={`text-sm font-semibold ${isLicenseExpired ? 'text-red-600' : 'dark:text-white'}`}>
                                            {selectedCustomer.licenseExpiryDate ? new Date(selectedCustomer.licenseExpiryDate).toLocaleDateString('de-AT') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                {selectedCustomer.licensePhotoUrl ? (
                                    <div className="mt-4">
                                        <p className="text-[10px] text-gray-400 font-medium mb-1.5">Führerschein Foto</p>
                                        <a 
                                            href={selectedCustomer.licensePhotoUrl} 
                                            target="_blank" 
                                            className="block w-full h-24 rounded-lg bg-gray-200 dark:bg-gray-800 bg-cover bg-center border border-gray-300 dark:border-gray-600 hover:opacity-80 transition-opacity"
                                            style={{ backgroundImage: `url(${selectedCustomer.licensePhotoUrl})` }}
                                        >
                                            <div className="h-full w-full flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-bold">Vorschau öffnen</span>
                                            </div>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg flex items-center gap-2">
                                        <span className="text-amber-600 text-lg">⚠️</span>
                                        <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-tight">
                                            Kein Foto vorhanden. Für diesen Kunden muss vor dem Check-out bir Foto hochgeladen werden.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Zeitraum & Ort */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/50 pb-4">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Zeitraum & Ort
                </h2>
                
                {/* Availability Preview */}
                {selectedCar ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-2xl">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Schnellübersicht Belegung</h3>
                                </div>
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">Live Status</span>
                            </div>
                            {selectedCar.rentals && selectedCar.rentals.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {selectedCar.rentals.map((rental: { startDate: string | Date; endDate: string | Date }, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                                                {new Date(rental.startDate).toLocaleDateString('de-AT')} - {new Date(rental.endDate).toLocaleDateString('de-AT')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <span className="text-lg">✅</span>
                                    <p className="text-xs font-bold uppercase tracking-wider">Keine aktuellen Buchungen</p>
                                </div>
                            )}
                        </div>

                        {/* Full Calendar View */}
                        <div className="mt-4">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 px-2">Detaillierter Fahrzeug-Kalender</h3>
                            {isCalendarLoading ? (
                                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-xs text-gray-500">Kalenderdaten werden geladen...</p>
                                    </div>
                                </div>
                            ) : calendarData ? (
                                <div className="transform scale-[0.95] origin-top">
                                    <CarCalendar 
                                        rentals={calendarData.rentals}
                                        maintenance={calendarData.maintenance}
                                        tasks={calendarData.tasks}
                                        carId={Number(selectedCarId)}
                                        onSelectDates={(start, end) => {
                                            setStartDate(format(start, 'yyyy-MM-dd'));
                                            setEndDate(format(end, 'yyyy-MM-dd'));
                                        }}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : (
                    <div className="mb-8 p-6 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                        <p className="text-sm text-gray-400 font-medium italic">Wählen Sie oben bir Fahrzeug aus, um die Belegungsdaten zu sehen.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Abholdatum *</label>
                        <input
                            name="startDate"
                            type="date"
                            required
                            min={todayStr}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rückgabedatum *</label>
                        <input
                            name="endDate"
                            type="date"
                            required
                            min={startDate || todayStr}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    {isConflict && (
                        <div className="md:col-span-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 animate-pulse">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                            <div>
                                <p className="text-sm font-bold text-red-800 dark:text-red-200">Achtung: Zeitliche Überschneidung!</p>
                                <p className="text-xs text-red-700 dark:text-red-300">Das Fahrzeug ist im gewählten Zeitraum bereits belegt veya Wartungda.</p>
                            </div>
                        </div>
                    )}
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

            {/* Kosten & Zusatzfahrer */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/50 pb-4">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    Kosten & Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Deposit, Payment & Options */}
                    <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-700/50">
                        {/* Deposit */}
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                Kaution (Security Deposit)
                            </label>
                            <div className="relative">
                                <input
                                    name="depositPaid"
                                    type="number"
                                    step="0.01"
                                    className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white font-mono font-bold ${selectedCustomer?.rentalsCount! >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}
                                    value={depositPaid}
                                    onChange={(e) => setDepositPaid(e.target.value)}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</div>
                            </div>
                            <p className="text-[10px] text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                                {selectedCustomer?.rentalsCount! >= 3 ? 'Stammkunde (3+ Mieten): 250€ Kaution applies.' : 'Neukunde: Standard 750€ Kaution applies.'}
                            </p>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-500" />
                                Ödeme Yöntemi
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'Cash', name: 'Bar', icon: Banknote },
                                    { id: 'Card', name: 'Karte', icon: CreditCard },
                                    { id: 'Transfer', name: 'Überweisung', icon: Landmark }
                                ].map(method => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === method.id ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500'}`}
                                    >
                                        <method.icon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase">{method.name}</span>
                                    </button>
                                ))}
                                <input type="hidden" name="paymentMethod" value={paymentMethod} />
                            </div>
                        </div>

                        {/* Options */}
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Save className="w-4 h-4 text-blue-500" />
                                Zusatzoptionen & Extras
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {options.map(opt => (
                                    <label key={opt.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedOptions.includes(opt.id) ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                checked={selectedOptions.includes(opt.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedOptions(prev => [...prev, opt.id]);
                                                    else setSelectedOptions(prev => prev.filter(id => id !== opt.id));
                                                }}
                                            />
                                            <input type="hidden" name="options" value={opt.id} disabled={!selectedOptions.includes(opt.id)} />
                                            <div>
                                                <p className="text-xs font-bold dark:text-white">{opt.name}</p>
                                                <p className="text-[10px] text-gray-500">{opt.description}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-blue-600">€{opt.price}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notizen</label>
                        <textarea name="notes" rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white resize-none shadow-sm" placeholder="Spezielle Wünsche..."></textarea>
                    </div>
                </div>

                {pricing.total > 0 && (
                    <div className="mt-8 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
                        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Zusammenfassung Kosten</h3>
                        </div>
                        <div className="p-6 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Miete ({pricing.days} Tage x €{selectedCar?.dailyRate})</span>
                                <span className="font-mono font-bold">€{pricing.dailyTotal.toFixed(2)}</span>
                            </div>
                            {selectedOptions.length > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Extras & Optionen</span>
                                    <span className="font-mono font-bold text-blue-600">+ €{pricing.optionsTotal.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">Gesamtbetrag</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-blue-600">
                                        {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(pricing.total)}
                                    </span>
                                    <p className="text-[10px] text-gray-400 font-medium">Inkl. MwSt.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4 pt-4">
                <Link
                    href="/admin/reservations"
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                >
                    Abbrechen
                </Link>
                <button
                    type="submit"
                    className="flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Save className="w-5 h-5" />
                    Reservierung erstellen
                </button>
            </div>
        </form>

        <CustomerModal 
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            onSuccess={(result) => {
                if (result && result.success && result.customer) {
                    const newCustomer = {
                        ...result.customer,
                        rentalsCount: 0
                    };
                    setLocalCustomers(prev => [...prev, newCustomer].sort((a, b) => a.lastName.localeCompare(b.lastName)));
                    setSelectedCustomerId(result.customer.id);
                }
                router.refresh();
            }}
        />
        </>
    );
}
