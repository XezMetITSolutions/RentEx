"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, ShieldCheck, Zap, Users, Baby, CheckCircle, Building2, User, X } from "lucide-react";
import { createBooking } from "@/app/actions/booking";
import { useEffect, useRef } from "react";
import { calculateChargeableDays, isOutsideOpeningHours } from "@/lib/bookingUtils";

type Props = {
    car: any;
    options: any[];
    initialCustomer: any | null;
    searchParams: {
        startDate: string;
        endDate: string;
        pickupTime: string;
        returnTime: string;
        options: string;
    };
};

const COUNTRIES = [
    "Österreich", "Afghanistan", "Ägypten", "Albanien", "Algerien", "Andorra", "Angola", "Antigua und Barbuda",
    "Äquatorialguinea", "Argentinien", "Armenien", "Aserbaidschan", "Äthiopien", "Australien", "Bahamas", "Bahrain",
    "Bangladesch", "Barbados", "Belgien", "Belize", "Benin", "Bhutan", "Bolivien", "Bosnien und Herzegowina",
    "Botswana", "Brasilien", "Brunei Darussalam", "Bulgarien", "Burkina Faso", "Burundi", "Chile", "China",
    "Costa Rica", "Dänemark", "Deutschland", "Dominica", "Dominikanische Republik", "Dschibuti", "Ecuador",
    "Elfenbeinküste", "El Salvador", "Eritrea", "Estland", "Eswatini", "Fidschi", "Finnland", "Frankreich",
    "Gabun", "Gambia", "Georgien", "Ghana", "Grenada", "Griechenland", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Honduras", "Indien", "Indonesien", "Irak", "Iran", "Irland", "Island", "Israel",
    "Italien", "Jamaika", "Japan", "Jemen", "Jordanien", "Kambodscha", "Kamerun", "Kanada", "Kap Verde",
    "Kasachstan", "Katar", "Kenia", "Kirgisistan", "Kiribati", "Kolumbien", "Komoren", "Kongo (Demokratische Republik)",
    "Kongo (Republik)", "Nordkorea", "Südkorea", "Kosovo", "Kroatien", "Kuba", "Kuwait", "Laos", "Lesotho",
    "Lettland", "Libanon", "Liberia", "Libyen", "Liechtenstein", "Litauen", "Luxemburg", "Madagaskar", "Malawi",
    "Malaysia", "Malediven", "Mali", "Malta", "Marokko", "Marshallinseln", "Mauretanien", "Mauritius", "Mexiko",
    "Mikronesien", "Moldau", "Monaco", "Mongolei", "Montenegro", "Mosambik", "Myanmar", "Namibia", "Nauru",
    "Nepal", "Neuseeland", "Nicaragua", "Niederlande", "Niger", "Nigeria", "Nordmazedonien", "Norwegen", "Oman",
    "Osttimor (Timor-Leste)", "Pakistan", "Palau", "Palästina", "Panama", "Papua-Neuguinea", "Paraguay", "Peru",
    "Philippinen", "Polen", "Portugal", "Ruanda", "Rumänien", "Russland", "Salomonen", "Sambia", "Samoa",
    "San Marino", "São Tomé und Príncipe", "Saudi-Arabien", "Schweden", "Schweiz", "Senegal", "Serbien",
    "Seychellen", "Sierra Leone", "Simbabwe", "Singapur", "Slowakei", "Slowenien", "Somalia", "Spanien",
    "Sri Lanka", "St. Kitts und Nevis", "St. Lucia", "St. Vincent und die Grenadinen", "Südafrika", "Sudan",
    "Südsudan", "Suriname", "Syrien", "Tadschikistan", "Tansania", "Thailand", "Togo", "Tonga", "Trinidad und Tobago",
    "Tschad", "Tschechien", "Tunesien", "Türkei", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "Ungarn",
    "Uruguay", "Usbekistan", "Vanuatu", "Vatikanstadt", "Venezuela", "Vereinigte Arabische Emirate",
    "Vereinigtes Königreich (Großbritannien)", "Vereinigte Staaten (USA)", "Vietnam", "Weißrussland (Belarus)",
    "Westsahara (umstritten)", "Zentralafrikanische Republik", "Zypern"
];

const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    const minute = (i % 2 === 0 ? '00' : '30');
    return `${hour}:${minute}`;
});

const formatDateOfBirth = (dateVal: any) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString();
    return `${day}/${month}/${year}`;
};

export default function CheckoutForm({ car, options, initialCustomer, searchParams }: Props) {
    const [startDate, setStartDate] = useState(searchParams.startDate);
    const [endDate, setEndDate] = useState(searchParams.endDate);
    const [pickupTime, setPickupTime] = useState(searchParams.pickupTime || "10:00");
    const [returnTime, setReturnTime] = useState(searchParams.returnTime || "10:00");

    const days = calculateChargeableDays(startDate, pickupTime, endDate, returnTime);

    const isPickupOutside = isOutsideOpeningHours(startDate, pickupTime);
    const isReturnOutside = isOutsideOpeningHours(endDate, returnTime);
    const needsSelfCheckin = isPickupOutside || isReturnOutside;

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
    const [paymentMethod, setPaymentMethod] = useState<'arrival' | 'online'>(needsSelfCheckin ? 'online' : 'arrival');
    const [customerType, setCustomerType] = useState<'Private' | 'Business'>(initialCustomer?.customerType || 'Private');
    const [agbAccepted, setAgbAccepted] = useState(false);
    const [state, formAction, isPending] = useActionState(createBooking, null);

    useEffect(() => {
        if (needsSelfCheckin) {
            setPaymentMethod('online');
        }
    }, [needsSelfCheckin]);

    // Address Autofill Logic
    const [addressQuery, setAddressQuery] = useState(initialCustomer?.address || '');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [postalCode, setPostalCode] = useState(initialCustomer?.postalCode || '');
    const [city, setCity] = useState(initialCustomer?.city || '');
    const suggestionRef = useRef<HTMLDivElement>(null);

    const [emailExists, setEmailExists] = useState(false);
    const [emailValue, setEmailValue] = useState(initialCustomer?.email || '');

    const [isLoggedIn, setIsLoggedIn] = useState(!!initialCustomer);
    const [firstName, setFirstName] = useState(initialCustomer?.firstName || '');
    const [lastName, setLastName] = useState(initialCustomer?.lastName || '');
    const [phone, setPhone] = useState(initialCustomer?.phone || '+43 ');
    const [dateOfBirth, setDateOfBirth] = useState(initialCustomer?.dateOfBirth ? formatDateOfBirth(initialCustomer.dateOfBirth) : '');
    const [licenseNumber, setLicenseNumber] = useState(initialCustomer?.licenseNumber || '');
    const [licenseCountry, setLicenseCountry] = useState(initialCustomer?.licenseCountry || 'Österreich');
    const [licensePhotoUrl, setLicensePhotoUrl] = useState(initialCustomer?.licensePhotoUrl || '');
    const [licenseExpiryDate, setLicenseExpiryDate] = useState(initialCustomer?.licenseExpiryDate ? formatDateOfBirth(initialCustomer.licenseExpiryDate) : '');
    const [selectedCountry, setSelectedCountry] = useState(initialCustomer?.country || 'Österreich');
    const [company, setCompany] = useState(initialCustomer?.company || '');
    const [taxId, setTaxId] = useState(initialCustomer?.taxId || '');

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const checkEmail = async (email: string) => {
        if (!email || email.indexOf('@') === -1) {
            setEmailExists(false);
            return;
        }
        if (initialCustomer && initialCustomer.email === email) {
            setEmailExists(false);
            return;
        }
        try {
            const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email.trim())}`);
            const data = await res.json();
            setEmailExists(data.exists);
        } catch (e) {
            console.error("Failed to check email", e);
        }
    };

    const handleModalLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError('');
        try {
            const res = await fetch('/api/auth/checkout-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailValue, password: loginPassword })
            });
            const data = await res.json();
            if (data.success) {
                const cust = data.customer;
                setFirstName(cust.firstName || '');
                setLastName(cust.lastName || '');
                setPhone(cust.phone || '');
                setAddressQuery(cust.address || '');
                setCity(cust.city || '');
                setPostalCode(cust.postalCode || '');
                setSelectedCountry(cust.country || 'Österreich');
                setCustomerType(cust.customerType || 'Private');
                setCompany(cust.company || '');
                setTaxId(cust.taxId || '');
                setDateOfBirth(cust.dateOfBirth ? formatDateOfBirth(cust.dateOfBirth) : '');
                setLicenseNumber(cust.licenseNumber || '');
                setLicenseCountry(cust.licenseCountry || 'Österreich');
                setLicensePhotoUrl(cust.licensePhotoUrl || '');
                setLicenseExpiryDate(cust.licenseExpiryDate ? formatDateOfBirth(cust.licenseExpiryDate) : '');
                setIsLoggedIn(true);
                setShowLoginModal(false);
                setEmailExists(false);
            } else {
                setLoginError(data.error || 'Login fehlgeschlagen.');
            }
        } catch (err) {
            setLoginError('Serverfehler beim Anmelden.');
        } finally {
            setIsLoggingIn(false);
        }
    };
    const isExpiryStringExpired = (dateStr: string) => {
        if (!dateStr) return false;
        const normalized = dateStr.replace(/[\.\-]/g, '/').trim();
        const parts = normalized.split('/');
        if (parts.length !== 3) return false;
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        const d = new Date(year, month, day);
        return !isNaN(d.getTime()) && d.getTime() < new Date().setHours(0,0,0,0);
    };

    const isExpired = isExpiryStringExpired(licenseExpiryDate);
    const showLicenseInput = !licenseNumber || !licenseExpiryDate || isExpired;

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
            const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lat=47.5162&lon=14.5501`);
            if (!res.ok) {
                setSuggestions([]);
                return;
            }
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
        <>
        <form action={formAction} encType="multipart/form-data" className="grid lg:grid-cols-3 gap-12">
            
            {state?.error && (
                <div className="lg:col-span-3 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 font-medium">
                    {state.error}
                </div>
            )}

            {/* Hidden Fields for Server Action */}
            <input type="hidden" name="carId" value={car.id} />
            <input type="hidden" name="startDate" value={startDate} />
            <input type="hidden" name="endDate" value={endDate} />
            <input type="hidden" name="options" value={searchParams.options} />
            <input type="hidden" name="totalAmount" value={total} />
            <input type="hidden" name="pickupTime" value={pickupTime} />
            <input type="hidden" name="returnTime" value={returnTime} />


            {/* LEFT: Customer Form */}
            <div className="lg:col-span-2 space-y-8">

                {/* Customer Type */}
                <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Buchungstyp</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`flex items-center justify-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${customerType === 'Private' ? 'bg-red-500/10 border-red-500/50 text-red-600 dark:text-white' : 'bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'}`}>
                            <input type="radio" name="customerType" value="Private" checked={customerType === 'Private'} onChange={() => setCustomerType('Private')} className="sr-only" />
                            <User className="w-5 h-5" />
                            <span className="font-medium">Privat</span>
                        </label>
                        <label className={`flex items-center justify-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${customerType === 'Business' ? 'bg-red-500/10 border-red-500/50 text-red-600 dark:text-white' : 'bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'}`}>
                            <input type="radio" name="customerType" value="Business" checked={customerType === 'Business'} onChange={() => setCustomerType('Business')} className="sr-only" />
                            <Building2 className="w-5 h-5" />
                            <span className="font-medium">Geschäftlich</span>
                        </label>
                    </div>

                    {customerType === 'Business' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-150 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Firmenname</label>
                                <input required name="company" type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none" placeholder="Beispiel GmbH" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">USt-IdNr.</label>
                                <input name="taxId" type="text" value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none" placeholder="ATU12345678" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Personal Info */}
                <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Persönliche Daten</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Vorname</label>
                            <input required name="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none" placeholder="Max" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nachname</label>
                            <input required name="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none" placeholder="Mustermann" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">E-Mail Adresse</label>
                            <input
                                required
                                name="email"
                                type="email"
                                value={emailValue}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEmailValue(val);
                                    checkEmail(val);
                                }}
                                onBlur={(e) => checkEmail(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none"
                                placeholder="max@beispiel.com"
                            />
                            {emailExists && (
                                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-300">
                                    <span>⚠️ Ein Konto mit dieser E-Mail existiert bereits.</span>
                                    <button
                                        type="button"
                                        onClick={() => { setLoginError(''); setShowLoginModal(true); }}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all text-[10px]"
                                    >
                                        Jetzt anmelden
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefonnummer</label>
                            <input required name="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none" placeholder="+43 660 ..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Geburtsdatum *</label>
                            <input
                                required
                                name="dateOfBirth"
                                type="text"
                                value={dateOfBirth}
                                onChange={e => setDateOfBirth(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none"
                                placeholder="TT/MM/JJJJ (z.B. 15/08/1990)"
                                pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
                                title="Bitte im Format TT/MM/JJJJ eingeben (z.B. 15/08/1990)"
                            />
                        </div>
                        {/* Driver's License Info - Only visible if not already supplied by logged-in user or if expired */}
                        {showLicenseInput ? (
                            <>
                                {licenseNumber && isExpired && (
                                    <div className="md:col-span-2 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs animate-in fade-in duration-300">
                                        ⚠️ Ihr hinterlegter Führerschein ({licenseNumber}) ist am {licenseExpiryDate} abgelaufen. Bitte tragen Sie die neuen Daten ein und laden Sie das neue Dokument hoch.
                                    </div>
                                )}
                                <div className="space-y-2 animate-in fade-in duration-300">
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Führerscheinnummer *</label>
                                    <input required name="licenseNumber" type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none" placeholder="z.B. A1234567" />
                                </div>
                                <div className="space-y-2 animate-in fade-in duration-300">
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Führerschein Ausstellungsland *</label>
                                    <select required name="licenseCountry" value={licenseCountry} onChange={e => setLicenseCountry(e.target.value)} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none appearance-none">
                                        {COUNTRIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2 animate-in fade-in duration-300">
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Führerschein Ablaufdatum *</label>
                                    <input required name="licenseExpiryDate" type="text" value={licenseExpiryDate} onChange={e => setLicenseExpiryDate(e.target.value)} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none" placeholder="TT/MM/JJJJ" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" title="Bitte im Format TT/MM/JJJJ eingeben (z.B. 15/08/2030)" />
                                </div>
                                <div className="space-y-2 animate-in fade-in duration-300">
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Führerschein Foto hochladen (Vorderseite) *</label>
                                    <input required={!licensePhotoUrl || isExpired} name="licensePhoto" type="file" accept="image/*" className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-gray-950 dark:text-white focus:border-red-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-500/10 file:text-red-500 hover:file:bg-red-500/20" />
                                </div>
                            </>
                        ) : (
                            <div className="md:col-span-2 p-4 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-2xl text-xs flex items-center gap-3 animate-in fade-in duration-300">
                                <span className="text-lg">✓</span>
                                <div>
                                    <p className="font-bold">Führerscheindaten verifiziert</p>
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Führerscheinnummer {licenseNumber} ({licenseCountry}) läuft am {licenseExpiryDate} ab und ist bereits in Ihrem Profil hinterlegt.
                                    </p>
                                </div>
                            </div>
                        )}
                        {!initialCustomer && (
                            <div className="space-y-2 md:col-span-2 pt-4 mt-4 border-t border-gray-150 dark:border-white/5">
                                <label className="text-sm font-medium text-red-500">Konto erstellen (optional)</label>
                                <div className="relative">
                                    <input name="password" type="password" className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none" placeholder="Passwort vergeben (min. 6 Zeichen)" />
                                </div>
                                <p className="text-[10px] text-gray-500 italic">Wenn Sie ein Passwort angeben, wird automatisch ein Kundenkonto für Sie erstellt, damit Sie Ihre Buchungen verwalten können.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Anschrift</h2>
                    <div className="space-y-6">
                        <div className="space-y-2 relative" ref={suggestionRef}>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Straẞe & Hausnummer</label>
                            <input
                                required
                                name="address"
                                type="text"
                                value={addressQuery}
                                onChange={(e) => fetchSuggestions(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none"
                                placeholder="Hauptstraẞe 1"
                                autoComplete="off"
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                                    {suggestions.map((f, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleSelectSuggestion(f)}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-950 hover:dark:text-white transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
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
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">PLZ</label>
                                <input required name="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none" placeholder="6800" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Stadt</label>
                                <input required name="city" value={city} onChange={(e) => setCity(e.target.value)} type="text" className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none" placeholder="Feldkirch" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Land</label>
                            <select name="country" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none appearance-none">
                                {COUNTRIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Zahlungsmethode</h2>
                    <div className="space-y-4">
                        {!needsSelfCheckin ? (
                            <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${paymentMethod === 'arrival' ? 'bg-red-500/10 border-red-500/50' : 'bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}>
                                <input type="radio" name="paymentMethod" value="arrival" checked={paymentMethod === 'arrival'} onChange={() => setPaymentMethod('arrival')} className="w-5 h-5 text-red-600 focus:ring-red-500 bg-white dark:bg-black border-gray-300 dark:border-gray-600" />
                                <div className="flex-1">
                                    <span className="block font-medium text-gray-900 dark:text-white">Bezahlung bei Abholung</span>
                                    <span className="block text-sm text-gray-500 dark:text-gray-400">Zahlen Sie bequem bar oder mit Karte vor Ort.</span>
                                </div>
                                {paymentMethod === 'arrival' && <CheckCircle className="w-6 h-6 text-red-500 invisible sm:visible" />}
                            </label>
                        ) : (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs">
                                🔑 <strong>Online-Zahlung erforderlich:</strong> Da Ihre Abhol- oder Rückgabezeit außerhalb der Öffnungszeiten liegt (Self-Check-in), ist die Bezahlung bei Abholung vor Ort nicht möglich.
                            </div>
                        )}

                        <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${paymentMethod === 'online' ? 'bg-red-500/10 border-red-500/50' : 'bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}>
                            <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-5 h-5 text-red-600 focus:ring-red-500 bg-white dark:bg-black border-gray-300 dark:border-gray-600" />
                            <div className="flex-1">
                                <span className="block font-medium text-gray-900 dark:text-white">Online Überweisung / Karte</span>
                                <span className="block text-sm text-gray-500 dark:text-gray-400">Sicher online bezahlen (Stripe, Klarna, Kreditkarte).</span>
                            </div>
                            {paymentMethod === 'online' && <CheckCircle className="w-6 h-6 text-red-500 invisible sm:visible" />}
                        </label>
                    </div>
                </div>

            </div>


            {/* RIGHT: Summary */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl shadow-black/5">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Zusammenfassung</h3>

                        {/* Car Info */}
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                {car.imageUrl && <Image src={car.imageUrl} alt={car.model} fill className="object-cover" />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{car.brand} {car.model}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{car.category}</p>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                            {/* Abholung Date & Time */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-red-500" /> Abholzeitpunkt
                                </label>
                                <div className="grid grid-cols-2 gap-2">
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
                                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-xs text-gray-950 dark:text-white focus:border-red-500 outline-none dark:[&::-webkit-calendar-picker-indicator]:invert"
                                    />
                                    <select
                                        value={pickupTime}
                                        onChange={(e) => setPickupTime(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-2 py-2 text-xs text-gray-950 dark:text-white focus:border-red-500 outline-none appearance-none cursor-pointer"
                                    >
                                        {timeOptions.map(t => (
                                            <option key={t} value={t} className="bg-white dark:bg-zinc-900 text-gray-950 dark:text-white">{t} Uhr</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Rückgabe Date & Time */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-red-500" /> Rückgabezeitpunkt
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="date"
                                        value={endDate}
                                        min={startDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-2.5 py-2 text-xs text-gray-950 dark:text-white focus:border-red-500 outline-none dark:[&::-webkit-calendar-picker-indicator]:invert"
                                    />
                                    <select
                                        value={returnTime}
                                        onChange={(e) => setReturnTime(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-2 py-2 text-xs text-gray-950 dark:text-white focus:border-red-500 outline-none appearance-none cursor-pointer"
                                    >
                                        {timeOptions.map(t => (
                                            <option key={t} value={t} className="bg-white dark:bg-zinc-900 text-gray-950 dark:text-white">{t} Uhr</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-1">
                                <span>Berechnete Dauer:</span>
                                <span className="text-gray-900 dark:text-white font-bold text-xs bg-red-500/10 px-2 py-0.5 rounded-lg">{days} Tage</span>
                            </div>
                            {needsSelfCheckin && (
                                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-[11px] leading-relaxed">
                                    🔑 <strong>Self-Check-in/Out aktiv:</strong> Abholung/Rückgabe erfolgt schlüssellos außerhalb der Öffnungszeiten.
                                </div>
                            )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Fahrzeugmiete</span>
                                <span className="text-gray-900 dark:text-white">{new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(days * (Number(car.dailyRate) || 0))}</span>
                            </div>

                            {/* Packages (Kilometer) */}
                            {selectedOptions.filter(o => o.type === 'package').length > 0 && (
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kilometer-Pakete</p>
                                    {selectedOptions.filter(o => o.type === 'package').map(opt => (
                                        <div key={opt.id} className="flex justify-between text-sm mb-1.5 pl-2">
                                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                {opt.name}
                                                {opt.isPerDay && <span className="text-[10px] opacity-70">({days}x)</span>}
                                            </span>
                                            <span className="text-gray-900 dark:text-white">
                                                {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(opt.isPerDay ? ((Number(opt.price) || 0) * days) : (Number(opt.price) || 0))}
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
                                            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                {opt.name}
                                                {opt.isPerDay && <span className="text-[10px] opacity-70">({days}x)</span>}
                                            </span>
                                            <span className="text-gray-900 dark:text-white">
                                                {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(opt.isPerDay ? ((Number(opt.price) || 0) * days) : (Number(opt.price) || 0))}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Gutscheincode</label>
                            <input name="couponCode" type="text" placeholder="Code eingeben" className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:border-red-500 outline-none" />
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-white/10">
                            <div className="flex justify-between items-end">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Gesamtbetrag</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white text-right">
                                    {new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(total)}
                                </span>
                            </div>
                            <p className="text-xs text-right text-gray-400 dark:text-gray-500 mt-1">inkl. MwSt.</p>
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
                                    <div className="w-5 h-5 border-2 border-gray-350 dark:border-white/10 rounded group-hover:border-red-500/50 peer-checked:border-red-600 peer-checked:bg-red-600 transition-all"></div>
                                    <CheckCircle className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 transition-opacity" />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
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
        {showLoginModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                    <button
                        type="button"
                        onClick={() => setShowLoginModal(false)}
                        className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Anmelden</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Geben Sie das Passwort für <strong>{emailValue}</strong> ein, um fortzufahren.</p>
                    
                    {loginError && (
                        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs animate-shake">
                            ⚠️ {loginError}
                        </div>
                    )}
                    
                    <form onSubmit={handleModalLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Passwort</label>
                            <input
                                required
                                type="password"
                                value={loginPassword}
                                onChange={e => setLoginPassword(e.target.value)}
                                placeholder="••••••"
                                className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:border-red-500 outline-none"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full py-3.5 mt-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20"
                        >
                            {isLoggingIn ? 'Wird angemeldet...' : 'Anmelden & Daten laden'}
                        </button>
                    </form>
                </div>
            </div>
        )}
        </>
    );
}

