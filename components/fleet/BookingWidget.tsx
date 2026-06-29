"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, Zap, Baby, Calendar, Clock } from "lucide-react";
import { calculateChargeableDays, isOutsideOpeningHours } from "@/lib/bookingUtils";

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
    startDate: string;
    endDate: string;
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    pickupTime: string;
    returnTime: string;
    setPickupTime: (time: string) => void;
    setReturnTime: (time: string) => void;
};


const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const minute = (i % 2 === 0 ? '00' : '30');
    return `${hour}:${minute}`;
});

export default function BookingWidget({ car, options, startDate, endDate, setStartDate, setEndDate, pickupTime, returnTime, setPickupTime, setReturnTime }: BookingWidgetProps) {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [totalDays, setTotalDays] = useState<number>(1);
    const [isAvailable, setIsAvailable] = useState<boolean>(true);

    const isPickupOutside = isOutsideOpeningHours(startDate, pickupTime);
    const isReturnOutside = isOutsideOpeningHours(endDate, returnTime);
    const needsSelfCheckin = isPickupOutside || isReturnOutside;

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
        const validDays = calculateChargeableDays(startDate, pickupTime, endDate, returnTime);
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
    }, [startDate, endDate, pickupTime, returnTime, selectedOptions, car.dailyRate, options]);


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
        setIsPending(true);
        const params = new URLSearchParams();
        params.set('carId', car.id.toString());
        params.set('startDate', startDate);
        params.set('endDate', endDate);
        params.set('pickupTime', pickupTime);
        params.set('returnTime', returnTime);
        if (selectedOptions.length > 0) {
            params.set('options', selectedOptions.join(','));
        }

        setTimeout(() => {
            router.push(`/checkout?${params.toString()}`);
        }, 750);
    };

    return (
        <div className="sticky top-24 space-y-6">
            {/* Price Card */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/5">
                <div className="flex justify-between items-end mb-6 border-b border-gray-200 dark:border-white/10 pb-6">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Gesamtpreis</p>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white">
                            {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(totalPrice)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">für {totalDays} Tage</p>
                    </div>
                </div>

                {/* Availability Status */}
                <div className="mb-6 flex justify-end">
                    {isAvailable ? (
                        <span className="text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded text-xs font-semibold">
                            Verfügbar
                        </span>
                    ) : (
                        <span className="text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-semibold">
                            Nicht verfügbar
                        </span>
                    )}
                </div>

                {/* Date & Time Selection */}
                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 dark:bg-black/40 rounded-xl p-3 border border-gray-200 dark:border-white/5">
                        <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-red-500" /> Abholung
                        </label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <input
                                type="date"
                                value={startDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => {
                                    const newStart = e.target.value;
                                    setStartDate(newStart);
                                    if (endDate < newStart) {
                                        setEndDate(newStart);
                                    }
                                }}
                                className="w-full bg-transparent text-gray-900 dark:text-white border-none focus:ring-0 p-0 text-sm dark:[&::-webkit-calendar-picker-indicator]:invert"
                            />
                            <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-white/10 pl-2">
                                <Clock className="w-3.5 h-3.5 text-gray-405 shrink-0" />
                                <select
                                    value={pickupTime}
                                    onChange={(e) => setPickupTime(e.target.value)}
                                    className="w-full bg-transparent text-gray-900 dark:text-white border-none focus:ring-0 p-0 text-sm outline-none appearance-none cursor-pointer"
                                >
                                    {timeOptions.map(t => (
                                        <option key={t} value={t} className="bg-white dark:bg-zinc-900 text-gray-950 dark:text-white">{t} Uhr</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-black/40 rounded-xl p-3 border border-gray-200 dark:border-white/5">
                        <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-red-500" /> Rückgabe
                        </label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-transparent text-gray-900 dark:text-white border-none focus:ring-0 p-0 text-sm dark:[&::-webkit-calendar-picker-indicator]:invert"
                            />
                            <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-white/10 pl-2">
                                <Clock className="w-3.5 h-3.5 text-gray-405 shrink-0" />
                                <select
                                    value={returnTime}
                                    onChange={(e) => setReturnTime(e.target.value)}
                                    className="w-full bg-transparent text-gray-900 dark:text-white border-none focus:ring-0 p-0 text-sm outline-none appearance-none cursor-pointer"
                                >
                                    {timeOptions.map(t => (
                                        <option key={t} value={t} className="bg-white dark:bg-zinc-900 text-gray-950 dark:text-white">{t} Uhr</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Self Check-in Notice */}
                {needsSelfCheckin && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in duration-300">
                        <span className="text-base leading-none">🔑</span>
                        <div>
                            <p className="font-bold mb-0.5">Self-Check-in/Check-out aktiv</p>
                            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                Die von Ihnen gewählte Abhol- oder Rückgabezeit liegt außerhalb unserer regulären Öffnungszeiten. Sie erhalten alle Details zur schlüssellosen Fahrzeugübergabe vor Mietbeginn.
                            </p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleBooking}
                    disabled={!isAvailable || isPending}
                    className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${isAvailable
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed shadow-none"
                        } ${isPending ? "opacity-90 cursor-wait" : ""}`}
                >
                    {isPending ? (
                        <>
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Wird vorbereitet...
                        </>
                    ) : isAvailable ? (
                        "Jetzt Reservieren"
                    ) : (
                        "Zeitraum belegt"
                    )}
                </button>
                <p className="text-center text-xs text-gray-500 mt-3">
                    Keine Kreditkarte für Reservierung erforderlich
                </p>
            </div>

            {/* Extras Selection */}
            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Zusatzpakete</h3>
                <div className="space-y-3">
                    {options.map((option) => {
                        const Icon = getOptionIcon(option.type);
                        return (
                            <label key={option.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-150 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group select-none">
                                <input
                                    type="checkbox"
                                    className="mt-1 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-red-600 focus:ring-red-600"
                                    checked={selectedOptions.includes(option.id)}
                                    onChange={() => handleOptionToggle(option.id)}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-gray-500" />
                                            {option.name}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            +{new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(Number(option.price))}
                                            {option.isPerDay && <span className="text-[10px] text-gray-500 ml-1">/Tag</span>}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-400 transition-colors">
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
