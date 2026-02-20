"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, Zap, Baby, Calendar } from "lucide-react";

type Option = {
    id: number;
    name: string;
    description: string | null;
    price: number; // serialization creates number usually
    type: string | null;
    isPerDay: boolean;
};

type BookingWidgetProps = {
    car: any; // We can improve typing later
    options: Option[];
    initialStartDate?: string;
    initialEndDate?: string;
};


export default function BookingWidget({ car, options, initialStartDate, initialEndDate }: BookingWidgetProps) {
    const router = useRouter();

    // Defaults if not provided
    const getDefaultDates = () => {
        const t = new Date();
        const tm = new Date(t);
        tm.setDate(t.getDate() + 1);
        return {
            start: t.toISOString().split('T')[0],
            end: tm.toISOString().split('T')[0]
        };
    };

    const defaults = getDefaultDates();

    const [startDate, setStartDate] = useState(initialStartDate || defaults.start);
    const [endDate, setEndDate] = useState(initialEndDate || defaults.end);

    // Sync state when props change
    useEffect(() => {
        if (initialStartDate) setStartDate(initialStartDate);
        if (initialEndDate) setEndDate(initialEndDate);
    }, [initialStartDate, initialEndDate]);

    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [totalDays, setTotalDays] = useState<number>(1);
    const [isAvailable, setIsAvailable] = useState<boolean>(true);

    // Check availability
    useEffect(() => {
        if (!car.rentals) return;

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Reset hours to compare dates only
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const hasOverlap = car.rentals.some((rental: any) => {
            const rentalStart = new Date(rental.startDate);
            const rentalEnd = new Date(rental.endDate);
            rentalStart.setHours(0, 0, 0, 0);
            rentalEnd.setHours(0, 0, 0, 0);

            // Check overlap
            return (start < rentalEnd && end > rentalStart);
        });

        setIsAvailable(!hasOverlap);
    }, [startDate, endDate, car.rentals]);

    // Calculate Price
    useEffect(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const validDays = days > 0 ? days : 1;
        setTotalDays(validDays);

        let total = validDays * Number(car.dailyRate);

        // Add options
        selectedOptions.forEach(optId => {
            const opt = options.find(o => o.id === optId);
            if (opt) {
                if (opt.isPerDay) {
                    total += Number(opt.price) * validDays;
                } else {
                    total += Number(opt.price);
                }
            }
        });

        setTotalPrice(total);
    }, [startDate, endDate, selectedOptions, car.dailyRate, options]);


    const handleOptionToggle = (id: number) => {
        setSelectedOptions(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const getOptionIcon = (type: string | null) => {
        switch (type) {
            case 'insurance': return ShieldCheck;
            case 'driver': return Users;
            case 'equipment': return Baby;
            case 'package': return Zap;
            default: return Zap;
        }
    };

    const handleBooking = () => {
        const params = new URLSearchParams();
        params.set('carId', car.id.toString());
        params.set('startDate', startDate);
        params.set('endDate', endDate);
        if (selectedOptions.length > 0) {
            params.set('options', selectedOptions.join(','));
        }

        router.push(`/checkout?${params.toString()}`);
    };

    return (
        <div className="sticky top-24 space-y-6">
            {/* Price Card */}
            <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-6">
                    <div>
                        <p className="text-gray-400 text-sm">Gesamtpreis</p>
                        <p className="text-4xl font-bold text-white">
                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalPrice)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">für {totalDays} Tage</p>
                    </div>
                </div>

                {/* Availability Status */}
                <div className="mb-6 flex justify-end">
                    {isAvailable ? (
                        <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs font-semibold">
                            Verfügbar
                        </span>
                    ) : (
                        <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs font-semibold">
                            Nicht verfügbar
                        </span>
                    )}
                </div>

                {/* Date Selection */}
                <div className="space-y-4 mb-6">
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                        <label className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Abholung
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                                const newStart = e.target.value;
                                setStartDate(newStart);
                                // If end date is now before start date, update it
                                if (endDate < newStart) {
                                    setEndDate(newStart);
                                }
                            }}
                            className="w-full bg-transparent text-white border-none focus:ring-0 p-0 mt-1 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                    <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                        <label className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Rückgabe
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-transparent text-white border-none focus:ring-0 p-0 mt-1 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                </div>

                <button
                    onClick={handleBooking}
                    disabled={!isAvailable}
                    className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] ${isAvailable
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                        : "bg-zinc-700 text-zinc-500 cursor-not-allowed shadow-none"
                        }`}
                >
                    {isAvailable ? "Jetzt Reservieren" : "Zeitraum belegt"}
                </button>
                <p className="text-center text-xs text-gray-500 mt-3">
                    Keine Kreditkarte für Reservierung erforderlich
                </p>
            </div>

            {/* Extras Selection */}
            <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Zusatzpakete</h3>
                <div className="space-y-3">
                    {options.map((option) => {
                        const Icon = getOptionIcon(option.type);
                        return (
                            <label key={option.id} className="flex items-start gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-colors group select-none">
                                <input
                                    type="checkbox"
                                    className="mt-1 rounded border-gray-600 bg-zinc-800 text-red-600 focus:ring-red-600"
                                    checked={selectedOptions.includes(option.id)}
                                    onChange={() => handleOptionToggle(option.id)}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-white flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-gray-500" />
                                            {option.name}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-300">
                                            +{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(option.price))}
                                            {option.isPerDay && <span className="text-[10px] text-zinc-500 ml-1">/Tag</span>}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                                        {option.description}
                                    </p>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
