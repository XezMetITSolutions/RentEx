"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, ShieldCheck, Zap, Users, Baby, CheckCircle, Building2, User } from "lucide-react";
import { createBooking } from "@/app/actions/booking";
import { useEffect, useRef } from "react";

type Props = {
    car: any;
    options: any[];
    initialCustomer: any | null;
    searchParams: {
        startDate: string;
        endDate: string;
        options: string;
    };
};

export default function CheckoutForm({ car, options, initialCustomer, searchParams }: Props) {
    // Basic calculation logic again to show summary (could be shared utility)
    const start = new Date(searchParams.startDate);
    const end = new Date(searchParams.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const selectedOptionIds = searchParams.options ? searchParams.options.split(',').map(Number) : [];
    const selectedOptions = options.filter(o => selectedOptionIds.includes(o.id));

    let total = days * (Number(car.dailyRate) || 0);
    selectedOptions.forEach(opt => {
        if (opt.isPerDay) {
            total += (Number(opt.price) || 0) * days;
        } else {
            total += (Number(opt.price) || 0);
        }
    });

    // useActionState generic typing: [state, dispatch]
    // Initial state null or object
    const [paymentMethod, setPaymentMethod] = useState<'arrival' | 'online'>(Math.abs(total) > 0 ? 'arrival' : 'arrival');
    const [customerType, setCustomerType] = useState<'Private' | 'Business'>(initialCustomer?.customerType || 'Private');
    const [agbAccepted, setAgbAccepted] = useState(false);
    const [state, formAction, isPending] = useActionState(createBooking, null);

    // Address Autofill Logic
    const [addressQuery, setAddressQuery] = useState(initialCustomer?.address || '');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [postalCode, setPostalCode] = useState(initialCustomer?.postalCode || '');
    const [city, setCity] = useState(initialCustomer?.city || '');
    const suggestionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchSuggestions = async (query: string) => {
        setAddressQuery(query);
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lat=51.1657&lon=10.4515&priority_distance=1000`);
            const data = await res.json();
            setSuggestions(data.features || []);
            setShowSuggestions(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectSuggestion = (feature: any) => {
        const { name, housenumber, postcode, city: cityName, street } = feature.properties;
        const fullAddress = housenumber ? `${street || name} ${housenumber}` : (street || name);
        setAddressQuery(fullAddress);
        setPostalCode(postcode || '');
        setCity(cityName || '');
        setShowSuggestions(false);
    };

    return (
        <form action={formAction} className="grid lg:grid-cols-3 gap-12">

            {/* Hidden Fields for Server Action */}
            <input type="hidden" name="carId" value={car.id} />
            <input type="hidden" name="startDate" value={searchParams.startDate} />
            <input type="hidden" name="endDate" value={searchParams.endDate} />
            <input type="hidden" name="options" value={searchParams.options} />
            <input type="hidden" name="totalAmount" value={total} />


            {/* LEFT: Customer Form */}
            <div className="lg:col-span-2 space-y-8">

                {/* Customer Type */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Buchungstyp</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center justify-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${customerType === 'Private' ? 'bg-red-500/10 border-red-500/50 text-white' : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20'}`}>
                            <input type="radio" name="customerType" value="Private" checked={customerType === 'Private'} onChange={() => setCustomerType('Private')} className="sr-only" />
                            <User className="w-5 h-5" />
                            <span className="font-medium">Privat</span>
                        </label>
                        <label className={`flex items-center justify-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${customerType === 'Business' ? 'bg-red-500/10 border-red-500/50 text-white' : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/20'}`}>
                            <input type="radio" name="customerType" value="Business" checked={customerType === 'Business'} onChange={() => setCustomerType('Business')} className="sr-only" />
                            <Building2 className="w-5 h-5" />
                            <span className="font-medium">Geschäftlich</span>
                        </label>
                    </div>

                    {customerType === 'Business' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Firmenname</label>
                                <input required name="company" type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="Beispiel GmbH" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">USt-IdNr.</label>
                                <input name="taxId" type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="DE123456789" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Personal Info */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Persönliche Daten</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Vorname</label>
                            <input required name="firstName" type="text" defaultValue={initialCustomer?.firstName || ''} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="Max" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Nachname</label>
                            <input required name="lastName" type="text" defaultValue={initialCustomer?.lastName || ''} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="Mustermann" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">E-Mail Adresse</label>
                            <input required name="email" type="email" defaultValue={initialCustomer?.email || ''} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="max@beispiel.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Telefonnummer</label>
                            <input required name="phone" type="tel" defaultValue={initialCustomer?.phone || ''} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="+49 ..." />
                        </div>
                        {!initialCustomer && (
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-400">Passwort (optional – um Konto zu erstellen)</label>
                                <input name="password" type="password" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="Mindestens 6 Zeichen" />
                                <p className="text-[10px] text-gray-500">Wenn Sie ein Passwort angeben, wird automatisch ein Kundenkonto für Sie erstellt.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Address */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Anschrift</h2>
                    <div className="space-y-6">
                        <div className="space-y-2 relative" ref={suggestionRef}>
                            <label className="text-sm font-medium text-gray-400">Straẞe & Hausnummer</label>
                            <input
                                required
                                name="address"
                                type="text"
                                value={addressQuery}
                                onChange={(e) => fetchSuggestions(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none"
                                placeholder="Hauptstraẞe 1"
                                autoComplete="off"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                                    {suggestions.map((f, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(f)}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0"
                                        >
                                            <span className="font-medium">{f.properties.name} {f.properties.housenumber}</span>
                                            <span className="block text-xs text-gray-500">
                                                {f.properties.postcode} {f.properties.city}, {f.properties.country}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">PLZ</label>
                                <input required name="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="12345" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Stadt</label>
                                <input required name="city" value={city} onChange={(e) => setCity(e.target.value)} type="text" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="Berlin" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Land</label>
                            <select name="country" defaultValue={initialCustomer?.country || "Deutschland"} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none appearance-none">
                                <option value="Deutschland">Deutschland</option>
                                <option value="Österreich">Österreich</option>
                                <option value="Schweiz">Schweiz</option>
                                <option value="Niederlande">Niederlande</option>
                                <option value="Belgien">Belgien</option>
                                <option value="Frankreich">Frankreich</option>
                                <option value="Italien">Italien</option>
                                <option value="Spanien">Spanien</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Zahlungsmethode</h2>
                    <div className="space-y-4">
                        <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${paymentMethod === 'arrival' ? 'bg-red-500/10 border-red-500/50' : 'bg-black/20 border-white/5 hover:border-white/20'}`}>
                            <input type="radio" name="paymentMethod" value="arrival" checked={paymentMethod === 'arrival'} onChange={() => setPaymentMethod('arrival')} className="w-5 h-5 text-red-600 focus:ring-red-500 bg-black border-gray-600" />
                            <div className="flex-1">
                                <span className="block font-medium text-white">Bezahlung bei Abholung</span>
                                <span className="block text-sm text-gray-400">Zahlen Sie bequem bar oder mit Karte vor Ort.</span>
                            </div>
                            {paymentMethod === 'arrival' && <CheckCircle className="w-6 h-6 text-red-500 invisible sm:visible" />}
                        </label>

                        <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${paymentMethod === 'online' ? 'bg-red-500/10 border-red-500/50' : 'bg-black/20 border-white/5 hover:border-white/20'}`}>
                            <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-5 h-5 text-red-600 focus:ring-red-500 bg-black border-gray-600" />
                            <div className="flex-1">
                                <span className="block font-medium text-white">Online Überweisung / Karte</span>
                                <span className="block text-sm text-gray-400">Sicher online bezahlen (Stripe, Klarna, Kreditkarte).</span>
                            </div>
                            {paymentMethod === 'online' && <CheckCircle className="w-6 h-6 text-red-500 invisible sm:visible" />}
                        </label>
                    </div>
                </div>

            </div>


            {/* RIGHT: Summary */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4">Zusammenfassung</h3>

                        {/* Car Info */}
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-zinc-800">
                                {car.imageUrl && <Image src={car.imageUrl} alt={car.model} fill className="object-cover" />}
                            </div>
                            <div>
                                <p className="font-bold text-white">{car.brand} {car.model}</p>
                                <p className="text-xs text-gray-400">{car.category}</p>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-red-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-400">Abholung</p>
                                    <p className="text-sm font-medium text-white">{start.toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-500">10:00 Uhr</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="w-4 h-4 text-red-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-400">Rückgabe</p>
                                    <p className="text-sm font-medium text-white">{end.toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-500">10:00 Uhr</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-4" /> {/* Spacer */}
                                <p className="text-xs text-gray-400">Dauer: <span className="text-white font-medium">{days} Tage</span></p>
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Fahrzeugmiete</span>
                                <span className="text-white">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(days * (Number(car.dailyRate) || 0))}</span>
                            </div>

                            {/* Packages (Kilometer) */}
                            {selectedOptions.filter(o => o.type === 'package').length > 0 && (
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kilometer-Pakete</p>
                                    {selectedOptions.filter(o => o.type === 'package').map(opt => (
                                        <div key={opt.id} className="flex justify-between text-sm mb-1.5 pl-2">
                                            <span className="text-gray-400 flex items-center gap-1">
                                                {opt.name}
                                                {opt.isPerDay && <span className="text-[10px] opacity-70">({days}x)</span>}
                                            </span>
                                            <span className="text-white">
                                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(opt.isPerDay ? ((Number(opt.price) || 0) * days) : (Number(opt.price) || 0))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Other Extras */}
                            {selectedOptions.filter(o => o.type !== 'package').length > 0 && (
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Zusatzoptionen</p>
                                    {selectedOptions.filter(o => o.type !== 'package').map(opt => (
                                        <div key={opt.id} className="flex justify-between text-sm mb-1.5 pl-2">
                                            <span className="text-gray-400 flex items-center gap-1">
                                                {opt.name}
                                                {opt.isPerDay && <span className="text-[10px] opacity-70">({days}x)</span>}
                                            </span>
                                            <span className="text-white">
                                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(opt.isPerDay ? ((Number(opt.price) || 0) * days) : (Number(opt.price) || 0))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mb-4 pb-4 border-b border-white/10">
                            <label className="block text-xs text-gray-400 mb-1">Gutscheincode</label>
                            <input name="couponCode" type="text" placeholder="Code eingeben" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-red-500 outline-none" />
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex justify-between items-end">
                                <span className="text-gray-400 font-medium">Gesamtbetrag</span>
                                <span className="text-2xl font-bold text-white text-right">
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(total)}
                                </span>
                            </div>
                            <p className="text-xs text-right text-gray-500 mt-1">inkl. MwSt.</p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center mt-1">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={agbAccepted}
                                        onChange={(e) => setAgbAccepted(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 border-2 border-white/10 rounded group-hover:border-red-500/50 peer-checked:border-red-600 peer-checked:bg-red-600 transition-all"></div>
                                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 transition-opacity" />
                                </div>
                                <span className="text-xs text-gray-400 leading-relaxed">
                                    Ich habe die <a href="/agb" target="_blank" className="text-red-500 hover:underline">Allgemeinen Geschäftsbedingungen</a> sowie die <a href="/datenschutz" target="_blank" className="text-red-500 hover:underline">Datenschutzerklärung</a> gelesen und akzeptiere diese.
                                </span>
                            </label>
                        </div>

                        <button
                            disabled={isPending || !agbAccepted}
                            type="submit"
                            className="w-full py-4 mt-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
                        >
                            {isPending ? 'Wird verarbeitet...' : 'Kostenpflichtig buchen'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

