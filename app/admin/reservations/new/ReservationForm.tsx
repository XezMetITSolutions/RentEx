'use client';

import { createRental } from '@/app/actions';
import { Calendar, MapPin, User, Car as CarIcon, DollarSign, Save, ArrowLeft, AlertTriangle, CreditCard, Banknote, Landmark, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import CarCalendar from '@/components/admin/CarCalendar';
import CustomerModal from '@/components/admin/CustomerModal';

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
    carId?: number | null;
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

    const carContainerRef = useRef<HTMLDivElement>(null);
    const customerContainerRef = useRef<HTMLDivElement>(null);
    const [isCarDropdownOpen, setIsCarDropdownOpen] = useState(false);
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    const todayStr = new Date().toISOString().split('T')[0];

    const selectedCar = useMemo(() => cars.find(c => c.id === Number(selectedCarId)), [selectedCarId, cars]);
    const selectedCustomer = useMemo(() => localCustomers.find(c => c.id === Number(selectedCustomerId)), [selectedCustomerId, localCustomers]);

    const filteredOptions = useMemo(() => {
        return options.filter(opt => opt.carId === null || opt.carId === Number(selectedCarId));
    }, [options, selectedCarId]);

    // Keep selected options valid when car changes
    useEffect(() => {
        setSelectedOptions(prev => prev.filter(id => {
            const opt = options.find(o => o.id === id);
            return opt && (opt.carId === null || opt.carId === Number(selectedCarId));
        }));
    }, [selectedCarId, options]);

    useEffect(() => {
        if (carIdFromUrl) setSelectedCarId(carIdFromUrl);
        if (startDateFromUrl) setStartDate(startDateFromUrl);
        if (endDateFromUrl) setEndDate(endDateFromUrl);
    }, [carIdFromUrl, startDateFromUrl, endDateFromUrl]);

    useEffect(() => {
        setLocalCustomers(customers);
    }, [customers]);

    // Click outside popover handling
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (carContainerRef.current && !carContainerRef.current.contains(event.target as Node)) {
                setIsCarDropdownOpen(false);
            }
            if (customerContainerRef.current && !customerContainerRef.current.contains(event.target as Node)) {
                setIsCustomerDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    // Sync search inputs with selections
    useEffect(() => {
        if (selectedCar) {
            setCarSearch(`${selectedCar.brand} ${selectedCar.model} [${selectedCar.plate}]`);
        } else {
            setCarSearch('');
        }
    }, [selectedCar, cars]);

    useEffect(() => {
        if (selectedCustomer) {
            setCustomerSearch(`${selectedCustomer.firstName} ${selectedCustomer.lastName}`);
        } else {
            setCustomerSearch('');
        }
    }, [selectedCustomer, localCustomers]);

    const filteredCars = useMemo(() => {
        const search = carSearch.toLowerCase();
        const selectedCarText = selectedCar ? `${selectedCar.brand} ${selectedCar.model} [${selectedCar.plate}]`.toLowerCase() : '';
        if (!carSearch || search === selectedCarText) {
            return cars;
        }
        return cars.filter(c => 
            c.brand.toLowerCase().includes(search) || 
            c.model.toLowerCase().includes(search) || 
            c.plate.toLowerCase().includes(search)
        );
    }, [cars, carSearch, selectedCar]);

    const filteredCustomers = useMemo(() => {
        const search = customerSearch.toLowerCase();
        const selectedCustomerText = selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`.toLowerCase() : '';
        if (!customerSearch || search === selectedCustomerText) {
            return localCustomers;
        }
        return localCustomers.filter(c => 
            c.firstName.toLowerCase().includes(search) || 
            c.lastName.toLowerCase().includes(search)
        );
    }, [localCustomers, customerSearch, selectedCustomer]);

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

    const isLicenseMissing = useMemo(() => {
        return selectedCustomer ? !selectedCustomer.licenseNumber : false;
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left side: Form Inputs */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Vehicle & Customer Selection */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/50 pb-4">
                            <CarIcon className="w-5 h-5 text-blue-500" />
                            Fahrzeug & Kunde
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Vehicle */}
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
                                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                                                            €{Number(car.dailyRate).toFixed(2)}/Tag
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                    <input type="hidden" name="carId" value={selectedCarId} />
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Kunde auswählen *</label>
                                    <button 
                                        type="button"
                                        onClick={() => setIsCustomerModalOpen(true)}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md transition-colors"
                                    >
                                        <User className="w-3 h-3" />
                                        Neuer Kunde
                                    </button>
                                </div>
                                <div ref={customerContainerRef} className="relative">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <User className="w-4 h-4" />
                                        </span>
                                        <input 
                                            type="text"
                                            placeholder="Nach Vorname, Nachname... suchen"
                                            className="w-full pl-9 pr-10 py-3 text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm text-gray-900 dark:text-white font-medium"
                                            value={customerSearch}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCustomerSearch(val);
                                                if (!val) setSelectedCustomerId('');
                                                setIsCustomerDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsCustomerDropdownOpen(true)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                                            onClick={() => setIsCustomerDropdownOpen(prev => !prev)}
                                        >
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                    
                                    {isCustomerDropdownOpen && (
                                        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-950 rounded-xl py-1 focus:outline-none">
                                            {filteredCustomers.length === 0 ? (
                                                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic">
                                                    Keine Kunden gefunden
                                                </div>
                                            ) : (
                                                filteredCustomers.map(customer => (
                                                    <div
                                                        key={customer.id}
                                                        onClick={() => {
                                                            setSelectedCustomerId(customer.id);
                                                            setCustomerSearch(`${customer.firstName} ${customer.lastName}`);
                                                            setIsCustomerDropdownOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                                            selectedCustomerId === customer.id ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <span className="font-semibold text-gray-900 dark:text-white truncate">
                                                                {customer.firstName} {customer.lastName}
                                                            </span>
                                                            {customer.country && (
                                                                <span className="px-1.5 py-0.5 text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded shrink-0">
                                                                    {customer.country}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                                            {customer.rentalsCount > 0 ? `${customer.rentalsCount} Mieten` : 'Neukunde'}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                    <input type="hidden" name="customerId" value={selectedCustomerId} />
                                </div>

                                {/* Verification Details & Alerts */}
                                {selectedCustomer && (
                                    <div className="space-y-3 mt-4">
                                        {isLicenseExpired && (
                                            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 shadow-sm">
                                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Achtung: Führerschein abgelaufen!</h4>
                                                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                                                        Der Führerschein dieses Kunden ist abgelaufen. Sie müssen die Führerscheindaten im Kundenprofil aktualisieren, bevor diese Reservierung erstellt werden kann.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {isLicenseMissing && (
                                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-start gap-3 shadow-sm">
                                                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Führerschein-Daten unvollständig!</h4>
                                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                                        Es ist keine Führerscheinnummer hinterlegt. Bitte tragen Sie die Führerscheinnummer im Kundenprofil nach.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-4 rounded-xl border border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50">
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Kunden-Verifizierung</h3>
                                                {isLicenseExpired ? (
                                                    <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full animate-pulse">
                                                        ABGELAUFEN
                                                    </span>
                                                ) : !isLicenseMissing ? (
                                                    <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                                                        AKTIV
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                                                        UNVOLLSTÄNDIG
                                                    </span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-gray-400 font-medium">Führerscheinnummer</p>
                                                    <p className="text-sm font-semibold dark:text-white font-mono">{selectedCustomer.licenseNumber || 'N/A'}</p>
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
                                                        Kein Foto vorhanden. Für diesen Kunden muss vor dem Check-out ein Foto hochgeladen werden.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Zeitraum & Ort */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
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
                            <div className="mb-8 p-6 text-center border-2 border-dashed border-gray-200/50 dark:border-gray-800/50 rounded-2xl">
                                <p className="text-sm text-gray-400 font-medium italic">Wählen Sie oben ein Fahrzeug aus, um die Belegungsdaten zu sehen.</p>
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
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white focus:border-blue-500 outline-none"
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
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white focus:border-blue-500 outline-none"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            {isConflict && (
                                <div className="md:col-span-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 animate-pulse">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                    <div>
                                        <p className="text-sm font-bold text-red-800 dark:text-red-200">Achtung: Zeitliche Überschneidung!</p>
                                        <p className="text-xs text-red-700 dark:text-red-300">Das Fahrzeug ist im gewählten Zeitraum bereits belegt oder in Wartung.</p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Abholort</label>
                                <select name="pickupLocationId" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white focus:border-blue-500 outline-none">
                                    <option value="">Kein Ort ausgewählt</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rückgabeort</label>
                                <select name="returnLocationId" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white focus:border-blue-500 outline-none">
                                    <option value="">Kein Ort ausgewählt</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Kosten & Zusatzfahrer */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-800/50">
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
                                            className={`w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-mono font-bold focus:border-blue-500 outline-none ${selectedCustomer?.rentalsCount! >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}
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
                                        Zahlungsart
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
                                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                                                    paymentMethod === method.id 
                                                        ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-600 dark:border-blue-600 dark:text-white shadow-md shadow-blue-500/20' 
                                                        : 'bg-white dark:bg-gray-900 border-gray-200/50 dark:border-gray-800/50 text-gray-500 hover:border-gray-300 dark:hover:border-gray-700'
                                                }`}
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
                                    <div className="max-h-64 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-3 bg-gray-50/30 dark:bg-gray-900/20 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                                        {filteredOptions.map(opt => (
                                            <label key={opt.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedOptions.includes(opt.id) ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white dark:bg-gray-900 border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700'}`}>
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
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white">{opt.name}</p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{opt.description}</p>
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
                                <textarea name="notes" rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white focus:border-blue-500 outline-none resize-none shadow-sm" placeholder="Spezielle Wünsche..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Sticky Pricing Invoice Panel */}
                <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-900/40 px-6 py-4 border-b border-gray-200/50 dark:border-gray-800/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">Preisübersicht</h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">Buchungskalkulation (Live)</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] px-2 py-0.5 font-bold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 uppercase tracking-tighter">Entwurf</span>
                            </div>
                        </div>
                        
                        {pricing.total > 0 ? (
                            <div className="p-6 space-y-6">
                                {/* Invoice Details */}
                                <div className="space-y-4">
                                    {/* Car Details */}
                                    {selectedCar && (
                                        <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700/50 pb-3">
                                            <div>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{selectedCar.brand} {selectedCar.model}</p>
                                                <p className="text-[10px] text-gray-500 font-mono">{selectedCar.plate}</p>
                                            </div>
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">€{Number(selectedCar.dailyRate).toFixed(2)}/Tag</p>
                                        </div>
                                    )}

                                    {/* Period Details */}
                                    {startDate && endDate && (
                                        <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700/50 pb-3">
                                            <div>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Mietdauer</p>
                                                <p className="text-[10px] text-gray-500">
                                                    {new Date(startDate).toLocaleDateString('de-AT')} - {new Date(endDate).toLocaleDateString('de-AT')}
                                                </p>
                                            </div>
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{pricing.days} {pricing.days === 1 ? 'Tag' : 'Tage'}</p>
                                        </div>
                                    )}

                                    {/* Breakdown Rate */}
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>Miete ({pricing.days} Tage x €{Number(selectedCar?.dailyRate).toFixed(2)})</span>
                                        <span className="font-mono font-bold text-gray-800 dark:text-gray-200">€{pricing.dailyTotal.toFixed(2)}</span>
                                    </div>

                                    {/* Extras & Options */}
                                    {selectedOptions.length > 0 && (
                                        <div className="space-y-2 border-t border-dashed border-gray-100 dark:border-gray-700/50 pt-3">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ausgewählte Extras</p>
                                            {selectedOptions.map(optId => {
                                                const opt = options.find(o => o.id === optId);
                                                if (!opt) return null;
                                                return (
                                                    <div key={opt.id} className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                        <span>{opt.name}</span>
                                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">+ €{Number(opt.price).toFixed(2)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Total / Deposit */}
                                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">Mietpreis Gesamt</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                                {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(pricing.total)}
                                            </span>
                                            <p className="text-[10px] text-gray-400 font-medium">Inkl. MwSt.</p>
                                        </div>
                                    </div>

                                    {depositPaid && (
                                        <div className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-200/30 dark:border-gray-800/30 text-xs">
                                            <span className="text-gray-500">Kaution (Sicherheitsleistung)</span>
                                            <span className="font-mono font-bold text-gray-800 dark:text-gray-200">€{Number(depositPaid).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center space-y-3">
                                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center mx-auto text-gray-400 border border-gray-200/50 dark:border-gray-800/50">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[200px] mx-auto">
                                    Wählen Sie Fahrzeug und Zeitraum aus, um die Kostenaufstellung zu sehen.
                                </p>
                            </div>
                        )}

                        {/* Buttons & Validation State in Sidebar */}
                        <div className="p-6 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-200/50 dark:border-gray-800/50 space-y-4">
                            {selectedCustomer && isLicenseExpired && (
                                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl flex items-start gap-2.5">
                                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-red-800 dark:text-red-300 leading-tight">
                                        <strong>Erstellung blockiert:</strong> Führerschein abgelaufen. Aktualisieren Sie zuerst das Kundenprofil.
                                    </p>
                                </div>
                            )}

                            {selectedCustomer && isLicenseMissing && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-900/50 rounded-xl flex items-start gap-2.5">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-tight">
                                        <strong>Führerschein unvollständig:</strong> Bitte tragen Sie die Führerscheinnummer im Profil nach.
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <button
                                    type="submit"
                                    disabled={isLicenseExpired || !selectedCarId || !selectedCustomerId || !startDate || !endDate || isConflict}
                                    className={`flex items-center justify-center gap-2 w-full py-3.5 px-4 text-white font-bold rounded-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                        isLicenseExpired || !selectedCarId || !selectedCustomerId || !startDate || !endDate || isConflict
                                            ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none'
                                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 hover:scale-[1.01] active:scale-95'
                                    }`}
                                    title={isLicenseExpired ? "Erstellung deaktiviert, da der Führerschein abgelaufen ist." : ""}
                                >
                                    <Save className="w-4 h-4" />
                                    Reservierung erstellen
                                </button>
                                
                                <Link
                                    href="/admin/reservations"
                                    className="flex items-center justify-center py-2.5 px-4 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    Abbrechen
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
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
