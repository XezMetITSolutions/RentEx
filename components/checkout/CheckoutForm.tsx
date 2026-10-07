"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ArrowRight, Building2, Check, CheckCircle2, KeyRound, Loader2, User, X } from "lucide-react";
import { createBooking, previewCoupon, checkBookingAvailability } from "@/app/actions/booking";
import { calculateChargeableDays, getOpeningHours, isOutsideOpeningHours, parseBookingDateTime } from "@/lib/bookingUtils";
import { quoteBooking, resolveSelection, type CouponTerms, type PriceOption } from "@/lib/bookingPrice";
import { BUSINESS, RENTAL_TERMS } from "@/lib/config";
import CustomDatePicker from "@/components/ui/CustomDatePicker";

export interface CheckoutCar {
    id: number;
    brand: string;
    model: string;
    category: string | null;
    imageUrl: string | null;
    dailyRate: number;
    maxMileagePerDay: number | null;
    depositAmount: number | null;
    weeklyRate?: number | null;
    monthlyRate?: number | null;
    longTermRate?: number | null;
    minDaysForLongTerm?: number | null;
    promoPrice?: number | null;
    promoStartDate?: string | null;
    promoEndDate?: string | null;
    extraKmCost: number | null;
    fuelPolicy: string | null;
    transmission: string | null;
    fuelType: string | null;
    seats: number | null;
}

export interface CheckoutCustomer {
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    customerType: string | null;
    company: string | null;
    taxId: string | null;
    dateOfBirth: string; // YYYY-MM-DD or ""
    licenseNumber: string | null;
    licenseCountry: string | null;
    licenseExpiryDate: string; // YYYY-MM-DD or ""
    licensePhotoUrl: string | null;
}

type Props = {
    car: CheckoutCar;
    options: PriceOption[];
    initialCustomer: CheckoutCustomer | null;
    initial: {
        startDate: string;
        endDate: string;
        pickupTime: string;
        returnTime: string;
        optionIds: number[];
        couponCode: string;
    };
};

// Neighbouring countries first — almost every customer is from here.
const TOP_COUNTRIES = ["Österreich", "Deutschland", "Schweiz", "Liechtenstein", "Italien"];
const OTHER_COUNTRIES = [
    "Afghanistan", "Ägypten", "Albanien", "Algerien", "Andorra", "Angola", "Antigua und Barbuda",
    "Äquatorialguinea", "Argentinien", "Armenien", "Aserbaidschan", "Äthiopien", "Australien", "Bahamas", "Bahrain",
    "Bangladesch", "Barbados", "Belgien", "Belize", "Benin", "Bhutan", "Bolivien", "Bosnien und Herzegowina",
    "Botswana", "Brasilien", "Brunei Darussalam", "Bulgarien", "Burkina Faso", "Burundi", "Chile", "China",
    "Costa Rica", "Dänemark", "Dominica", "Dominikanische Republik", "Dschibuti", "Ecuador",
    "Elfenbeinküste", "El Salvador", "Eritrea", "Estland", "Eswatini", "Fidschi", "Finnland", "Frankreich",
    "Gabun", "Gambia", "Georgien", "Ghana", "Grenada", "Griechenland", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Honduras", "Indien", "Indonesien", "Irak", "Iran", "Irland", "Island", "Israel",
    "Jamaika", "Japan", "Jemen", "Jordanien", "Kambodscha", "Kamerun", "Kanada", "Kap Verde",
    "Kasachstan", "Katar", "Kenia", "Kirgisistan", "Kiribati", "Kolumbien", "Komoren", "Kongo (Demokratische Republik)",
    "Kongo (Republik)", "Nordkorea", "Südkorea", "Kosovo", "Kroatien", "Kuba", "Kuwait", "Laos", "Lesotho",
    "Lettland", "Libanon", "Liberia", "Libyen", "Litauen", "Luxemburg", "Madagaskar", "Malawi",
    "Malaysia", "Malediven", "Mali", "Malta", "Marokko", "Marshallinseln", "Mauretanien", "Mauritius", "Mexiko",
    "Mikronesien", "Moldau", "Monaco", "Mongolei", "Montenegro", "Mosambik", "Myanmar", "Namibia", "Nauru",
    "Nepal", "Neuseeland", "Nicaragua", "Niederlande", "Niger", "Nigeria", "Nordmazedonien", "Norwegen", "Oman",
    "Osttimor (Timor-Leste)", "Pakistan", "Palau", "Palästina", "Panama", "Papua-Neuguinea", "Paraguay", "Peru",
    "Philippinen", "Polen", "Portugal", "Ruanda", "Rumänien", "Russland", "Salomonen", "Sambia", "Samoa",
    "San Marino", "São Tomé und Príncipe", "Saudi-Arabien", "Schweden", "Senegal", "Serbien",
    "Seychellen", "Sierra Leone", "Simbabwe", "Singapur", "Slowakei", "Slowenien", "Somalia", "Spanien",
    "Sri Lanka", "St. Kitts und Nevis", "St. Lucia", "St. Vincent und die Grenadinen", "Südafrika", "Sudan",
    "Südsudan", "Suriname", "Syrien", "Tadschikistan", "Tansania", "Thailand", "Togo", "Tonga", "Trinidad und Tobago",
    "Tschad", "Tschechien", "Tunesien", "Türkei", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "Ungarn",
    "Uruguay", "Usbekistan", "Vanuatu", "Vatikanstadt", "Venezuela", "Vereinigte Arabische Emirate",
    "Vereinigtes Königreich (Großbritannien)", "Vereinigte Staaten (USA)", "Vietnam", "Weißrussland (Belarus)",
    "Westsahara (umstritten)", "Zentralafrikanische Republik", "Zypern"
];

type PhotonFeature = {
    properties: { name?: string; street?: string; housenumber?: string; postcode?: string; city?: string; country?: string };
};

const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0');
    return `${hour}:${i % 2 === 0 ? '00' : '30'}`;
});

const eur = (n: number) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n);
const todayIso = () => new Date().toISOString().slice(0, 10);
const toIso = (d: Date) => d.toISOString().slice(0, 10);

const inputClass =
    "w-full min-h-12 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper px-4 text-[15px] text-hm-ink outline-none placeholder:text-hm-muted hover:border-hm-muted focus:border-hm-ink transition-[border-color] duration-[var(--hm-dur-short)] ease-hm-out dark:[color-scheme:dark]";
const labelClass = "block text-sm font-semibold text-hm-ink";
const hintClass = "mt-1.5 text-xs text-hm-muted";

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
    return (
        <section className="rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper p-6 sm:p-8">
            <h2 className="flex items-center gap-3 text-xl font-bold">
                <span className="hm-tnum grid h-7 w-7 shrink-0 place-items-center rounded-full bg-hm-ink text-xs font-semibold text-hm-paper">{step}</span>
                {title}
            </h2>
            <div className="mt-6">{children}</div>
        </section>
    );
}

function CountrySelect({ name, value, onChange, id }: { name: string; value: string; onChange: (v: string) => void; id: string }) {
    return (
        <select id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} mt-2 appearance-none cursor-pointer`}>
            {TOP_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            <option disabled>──────────</option>
            {OTHER_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
    );
}

export default function CheckoutForm({ car, options, initialCustomer, initial }: Props) {
    const [startDate, setStartDate] = useState(initial.startDate);
    const [endDate, setEndDate] = useState(initial.endDate);
    const [pickupTime, setPickupTime] = useState(initial.pickupTime);
    const [returnTime, setReturnTime] = useState(initial.returnTime);
    const [optionIds, setOptionIds] = useState<number[]>(initial.optionIds);

    const days = calculateChargeableDays(startDate, pickupTime, endDate, returnTime);
    const isPickupOutside = isOutsideOpeningHours(startDate, pickupTime);
    const isReturnOutside = isOutsideOpeningHours(endDate, returnTime);

    // --- Coupon ---
    const [couponInput, setCouponInput] = useState(initial.couponCode);
    const [coupon, setCoupon] = useState<(CouponTerms & { code: string }) | null>(null);
    const [couponError, setCouponError] = useState('');
    const [couponPending, setCouponPending] = useState(false);
    const applyCoupon = async (code = couponInput) => {
        if (!code.trim()) return;
        setCouponPending(true);
        setCouponError('');
        const res = await previewCoupon(code);
        setCouponPending(false);
        if (res.ok) {
            setCoupon({ code: res.code, discountType: res.discountType, discountValue: res.discountValue });
            setCouponInput(res.code);
        } else {
            setCoupon(null);
            setCouponError(res.error);
        }
    };
    const didAutoApply = useRef(false);
    useEffect(() => {
        if (initial.couponCode && !didAutoApply.current) {
            didAutoApply.current = true;
            applyCoupon(initial.couponCode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Price (same function the server charges with) ---
    const selected = useMemo(() => resolveSelection(options, optionIds), [options, optionIds]);
    const quote = quoteBooking(car, selected, days, coupon, parseBookingDateTime(startDate, pickupTime));

    const baseKm = (car.maxMileagePerDay || 0) * days;
    const insurance = options.filter((o) => o.type === 'insurance');
    const kmPackages = options.filter((o) => o.type === 'package');
    const otherExtras = options.filter((o) => o.type !== 'insurance' && o.type !== 'package');
    const selectedPackageId = kmPackages.find((o) => optionIds.includes(o.id))?.id ?? 0;
    const toggleOption = (id: number) =>
        setOptionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    const selectPackage = (id: number) =>
        setOptionIds((prev) => [...prev.filter((x) => !kmPackages.some((p) => p.id === x)), ...(id ? [id] : [])]);

    // --- Live availability ---
    const [availability, setAvailability] = useState<{ state: 'checking' | 'ok' | 'conflict'; reason?: string }>({ state: 'ok' });
    useEffect(() => {
        setAvailability({ state: 'checking' });
        const t = setTimeout(async () => {
            const res = await checkBookingAvailability(car.id, startDate, pickupTime, endDate, returnTime);
            setAvailability(res.available ? { state: 'ok' } : { state: 'conflict', reason: res.reason });
        }, 400);
        return () => clearTimeout(t);
    }, [car.id, startDate, pickupTime, endDate, returnTime]);

    // --- Customer ---
    const [customerType, setCustomerType] = useState<'Private' | 'Business'>(initialCustomer?.customerType === 'Business' ? 'Business' : 'Private');
    const [paymentMethod, setPaymentMethod] = useState<'arrival' | 'online'>(isPickupOutside ? 'online' : 'arrival');
    useEffect(() => {
        if (isPickupOutside) setPaymentMethod('online');
    }, [isPickupOutside]);

    const [emailValue, setEmailValue] = useState(initialCustomer?.email || '');
    const [emailExists, setEmailExists] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!initialCustomer);
    const [firstName, setFirstName] = useState(initialCustomer?.firstName || '');
    const [lastName, setLastName] = useState(initialCustomer?.lastName || '');
    const [phone, setPhone] = useState(initialCustomer?.phone || '');
    const [dateOfBirth, setDateOfBirth] = useState(initialCustomer?.dateOfBirth || '');
    const [licenseNumber, setLicenseNumber] = useState(initialCustomer?.licenseNumber || '');
    const [licenseCountry, setLicenseCountry] = useState(initialCustomer?.licenseCountry || 'Österreich');
    const [licensePhotoUrl, setLicensePhotoUrl] = useState(initialCustomer?.licensePhotoUrl || '');
    const [licenseExpiryDate, setLicenseExpiryDate] = useState(initialCustomer?.licenseExpiryDate || '');
    const [country, setCountry] = useState(initialCustomer?.country || 'Österreich');
    const [company, setCompany] = useState(initialCustomer?.company || '');
    const [taxId, setTaxId] = useState(initialCustomer?.taxId || '');
    const [addressQuery, setAddressQuery] = useState(initialCustomer?.address || '');
    const [postalCode, setPostalCode] = useState(initialCustomer?.postalCode || '');
    const [city, setCity] = useState(initialCustomer?.city || '');

    const fillTestData = () => {
        setCustomerType('Private');
        setFirstName('Test');
        setLastName('Tester');
        setEmailValue(`test+${Date.now()}@xezmet.at`);
        setEmailExists(false);
        setPhone('+436601234567');
        setDateOfBirth('1990-01-01');
        setLicenseNumber('123456789');
        setLicenseCountry('Österreich');
        setLicenseExpiryDate('2030-01-01');
        setLicensePhotoUrl('dummy.jpg');
        setAddressQuery('Hauptstraße 1');
        setPostalCode('1010');
        setCity('Wien');
        setCountry('Österreich');
        setAgbAccepted(true);
    };

    const checkEmail = async (email: string) => {
        const value = email.trim();
        if (!value.includes('@') || (initialCustomer && initialCustomer.email === value)) {
            setEmailExists(false);
            return;
        }
        try {
            const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(value)}`);
            const data = await res.json();
            setEmailExists(!!data.exists);
        } catch {
            setEmailExists(false);
        }
    };

    // The licence must still be valid when the car comes back.
    const licenseValidForRental = !!licenseExpiryDate && licenseExpiryDate >= endDate;
    const hasStoredLicense = isLoggedIn && !!licenseNumber && !!licensePhotoUrl && licenseValidForRental;
    const minLicenseExpiry = endDate;
    const maxBirthDate = useMemo(() => {
        const d = new Date(`${startDate}T12:00:00Z`);
        d.setUTCFullYear(d.getUTCFullYear() - RENTAL_TERMS.MIN_DRIVER_AGE);
        return toIso(d);
    }, [startDate]);

    // --- Address autocomplete (debounced; sent to the Photon geocoder) ---
    const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef<HTMLDivElement>(null);
    const addressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const addressAbort = useRef<AbortController | null>(null);
    const onAddressChange = (query: string) => {
        setAddressQuery(query);
        if (addressTimer.current) clearTimeout(addressTimer.current);
        if (query.trim().length < 4) {
            setSuggestions([]);
            return;
        }
        addressTimer.current = setTimeout(async () => {
            addressAbort.current?.abort();
            const controller = new AbortController();
            addressAbort.current = controller;
            try {
                const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lat=47.24&lon=9.6&lang=de`, { signal: controller.signal });
                if (!res.ok) return;
                const data = await res.json();
                setSuggestions(data.features || []);
                setShowSuggestions(true);
            } catch {
                // aborted or offline — typing still works
            }
        }, 350);
    };
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) setShowSuggestions(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleSelectSuggestion = (feature: PhotonFeature) => {
        const { name, housenumber, postcode, city: cityName, street, country: featureCountry } = feature.properties;
        setAddressQuery(housenumber ? `${street || name} ${housenumber}` : (street || name || ''));
        setPostalCode(postcode || '');
        setCity(cityName || '');
        if (featureCountry && [...TOP_COUNTRIES, ...OTHER_COUNTRIES].includes(featureCountry)) setCountry(featureCountry);
        setShowSuggestions(false);
    };

    // --- Sign-in modal for existing accounts ---
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const handleModalLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError('');
        try {
            const res = await fetch('/api/auth/checkout-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailValue, password: loginPassword }),
            });
            const data = await res.json();
            if (data.success) {
                const c = data.customer;
                const iso = (v: string | null) => (v ? String(v).slice(0, 10) : '');
                setFirstName(c.firstName || '');
                setLastName(c.lastName || '');
                setPhone(c.phone || '');
                setAddressQuery(c.address || '');
                setCity(c.city || '');
                setPostalCode(c.postalCode || '');
                setCountry(c.country || 'Österreich');
                setCustomerType(c.customerType === 'Business' ? 'Business' : 'Private');
                setCompany(c.company || '');
                setTaxId(c.taxId || '');
                setDateOfBirth(iso(c.dateOfBirth));
                setLicenseNumber(c.licenseNumber || '');
                setLicenseCountry(c.licenseCountry || 'Österreich');
                setLicensePhotoUrl(c.licensePhotoUrl || '');
                setLicenseExpiryDate(iso(c.licenseExpiryDate));
                setIsLoggedIn(true);
                setShowLoginModal(false);
                setEmailExists(false);
            } else {
                setLoginError(data.error || 'Anmeldung fehlgeschlagen.');
            }
        } catch {
            setLoginError('Serverfehler beim Anmelden.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const [agbAccepted, setAgbAccepted] = useState(false);
    const [state, formAction, isPending] = useActionState(createBooking, null);
    
    const handleSubmit = (formData: FormData) => {
        if (emailValue.startsWith('test+') && licensePhotoUrl === 'dummy.jpg') {
            const fileInput = document.getElementById('co-lic-photo') as HTMLInputElement;
            if (fileInput && fileInput.files?.length === 0) {
                formData.set('licensePhoto', new File(["dummy content"], "dummy.jpg", { type: "image/jpeg" }));
            }
        }
        formAction(formData);
    };

    const errorRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (state?.error) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [state]);

    const canSubmit = agbAccepted && availability.state === 'ok' && !isPending;
    const hours = getOpeningHours(startDate);
    const returnHours = getOpeningHours(endDate);
    const hoursLabel = (h: ReturnType<typeof getOpeningHours>) => (h ? `${h.open}–${h.close} Uhr` : 'geschlossen');
    const timeLabel = (date: string, t: string) => `${t}${isOutsideOpeningHours(date, t) ? ' · Self-Check-in' : ' Uhr'}`;

    const optionPriceLabel = (o: PriceOption) =>
        o.isPerDay ? `${eur(o.price)} / Tag` : `${eur(o.price)} pauschal`;

    return (
        <>
            <form action={handleSubmit} encType="multipart/form-data" className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-8 items-start">
                <input type="hidden" name="carId" value={car.id} />
                <input type="hidden" name="startDate" value={startDate} />
                <input type="hidden" name="endDate" value={endDate} />
                <input type="hidden" name="pickupTime" value={pickupTime} />
                <input type="hidden" name="returnTime" value={returnTime} />
                <input type="hidden" name="options" value={selected.map((o) => o.id).join(',')} />
                <input type="hidden" name="couponCode" value={coupon?.code ?? ''} />

                <div className="min-w-0 space-y-6">
                    {state?.error && (
                        <div ref={errorRef} role="alert" className="flex items-start gap-3 rounded-[var(--hm-radius-input)] border border-hm-accent/30 bg-hm-accent/10 px-4 py-3 text-sm text-hm-accent-text">
                            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                            {state.error}
                        </div>
                    )}

                    {/* 1 · Extras */}
                    {options.length > 0 && (
                        <Section step={1} title="Extras & Schutz">
                            <div className="space-y-6">
                                {insurance.length > 0 && (
                                    <fieldset className="min-w-0 space-y-2">
                                        <legend className="font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted">Schutz</legend>
                                        {insurance.map((o) => (
                                            <OptionRow key={o.id} option={o} checked={o.isMandatory || optionIds.includes(o.id)} disabled={o.isMandatory}
                                                onChange={() => toggleOption(o.id)} price={optionPriceLabel(o)} type="checkbox" />
                                        ))}
                                    </fieldset>
                                )}
                                {kmPackages.length > 0 && (
                                    <fieldset className="min-w-0 space-y-2">
                                        <legend className="font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted">
                                            Kilometer · {baseKm.toLocaleString('de-AT')} km inklusive
                                        </legend>
                                        <OptionRow option={{ id: 0, name: 'Kein Zusatzpaket', price: 0 } as PriceOption} checked={selectedPackageId === 0}
                                            onChange={() => selectPackage(0)} price="" type="radio" groupName="km-package" />
                                        {kmPackages.map((o) => (
                                            <OptionRow key={o.id} option={o} checked={selectedPackageId === o.id} onChange={() => selectPackage(o.id)}
                                                price={optionPriceLabel(o)} type="radio" groupName="km-package" />
                                        ))}
                                    </fieldset>
                                )}
                                {otherExtras.length > 0 && (
                                    <fieldset className="min-w-0 space-y-2">
                                        <legend className="font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted">Weitere Extras</legend>
                                        {otherExtras.map((o) => (
                                            <OptionRow key={o.id} option={o} checked={o.isMandatory || optionIds.includes(o.id)} disabled={o.isMandatory}
                                                onChange={() => toggleOption(o.id)} price={optionPriceLabel(o)} type="checkbox" />
                                        ))}
                                    </fieldset>
                                )}
                            </div>
                        </Section>
                    )}

                    {/* 2 · Personal */}
                    <Section step={options.length > 0 ? 2 : 1} title="Ihre Daten">
                        <div className="mb-4">
                            <button type="button" onClick={fillTestData} className="text-xs font-semibold bg-hm-accent/10 text-hm-accent-text hover:bg-hm-accent/20 px-3 py-1.5 rounded-[var(--hm-radius-pill)] transition-colors">
                                ⚡ Testdaten ausfüllen
                            </button>
                        </div>
                        <div role="radiogroup" aria-label="Buchungstyp" className="grid grid-cols-2 gap-2 rounded-[var(--hm-radius-input)] bg-hm-paper-2 p-1">
                            {([['Private', 'Privat', User], ['Business', 'Geschäftlich', Building2]] as const).map(([value, label, Icon]) => (
                                <label key={value} className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[calc(var(--hm-radius-input)-3px)] text-sm font-semibold transition-[background-color,color] duration-[var(--hm-dur-short)] ${customerType === value ? 'bg-hm-paper text-hm-ink shadow-sm' : 'text-hm-ink-2 hover:text-hm-ink'}`}>
                                    <input type="radio" name="customerType" value={value} checked={customerType === value} onChange={() => setCustomerType(value)} className="sr-only" />
                                    <Icon aria-hidden className="h-4 w-4" />
                                    {label}
                                </label>
                            ))}
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            {customerType === 'Business' && (
                                <>
                                    <div>
                                        <label htmlFor="co-company" className={labelClass}>Firmenname</label>
                                        <input id="co-company" required name="company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" className={`${inputClass} mt-2`} placeholder="Beispiel GmbH" />
                                    </div>
                                    <div>
                                        <label htmlFor="co-tax" className={labelClass}>USt-IdNr. <span className="font-normal text-hm-muted">(optional)</span></label>
                                        <input id="co-tax" name="taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} className={`${inputClass} mt-2`} placeholder="ATU12345678" />
                                    </div>
                                </>
                            )}
                            <div>
                                <label htmlFor="co-first" className={labelClass}>Vorname</label>
                                <input id="co-first" required name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" className={`${inputClass} mt-2`} />
                            </div>
                            <div>
                                <label htmlFor="co-last" className={labelClass}>Nachname</label>
                                <input id="co-last" required name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" className={`${inputClass} mt-2`} />
                            </div>
                            <div>
                                <label htmlFor="co-email" className={labelClass}>E-Mail</label>
                                <input id="co-email" required name="email" type="email" value={emailValue} readOnly={isLoggedIn && !!initialCustomer}
                                    onChange={(e) => { setEmailValue(e.target.value); setEmailExists(false); }}
                                    onBlur={(e) => checkEmail(e.target.value)} autoComplete="email" className={`${inputClass} mt-2`} placeholder="name@beispiel.at" />
                                {emailExists && !isLoggedIn && (
                                    <div className="mt-2 flex items-center justify-between gap-3 rounded-[var(--hm-radius-input)] bg-hm-paper-2 px-3 py-2 text-xs text-hm-ink-2">
                                        <span>Für diese E-Mail gibt es ein Kundenkonto.</span>
                                        <button type="button" onClick={() => { setLoginError(''); setShowLoginModal(true); }} className="whitespace-nowrap rounded-[var(--hm-radius-pill)] bg-hm-ink px-3 py-1.5 font-semibold text-hm-paper hover:bg-hm-accent hover:text-hm-accent-ink">
                                            Anmelden
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="co-phone" className={labelClass}>Telefon</label>
                                <input id="co-phone" required name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" className={`${inputClass} mt-2`} placeholder="+43 660 1234567" />
                            </div>
                            <div>
                                <label htmlFor="co-dob" className={labelClass}>Geburtsdatum</label>
                                <input id="co-dob" required name="dateOfBirth" type="date" value={dateOfBirth} max={maxBirthDate} min="1920-01-01" onChange={(e) => setDateOfBirth(e.target.value)} autoComplete="bday" className={`${inputClass} mt-2`} />
                                <p className={hintClass}>Mindestalter {RENTAL_TERMS.MIN_DRIVER_AGE} Jahre bei Mietbeginn.</p>
                            </div>
                        </div>

                        {!isLoggedIn && !emailExists && (
                            <details className="group mt-6 rounded-[var(--hm-radius-input)] border border-hm-rule px-4 py-3">
                                <summary className="cursor-pointer list-none text-sm font-semibold text-hm-ink">
                                    Kundenkonto anlegen <span className="font-normal text-hm-muted">(optional — Buchungen später einsehen)</span>
                                </summary>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="co-pw" className={labelClass}>Passwort</label>
                                        <input id="co-pw" name="password" type="password" minLength={8} autoComplete="new-password" className={`${inputClass} mt-2`} />
                                        <p className={hintClass}>Mindestens 8 Zeichen.</p>
                                    </div>
                                    <div>
                                        <label htmlFor="co-pw2" className={labelClass}>Passwort wiederholen</label>
                                        <input id="co-pw2" name="passwordRepeat" type="password" minLength={8} autoComplete="new-password" className={`${inputClass} mt-2`} />
                                    </div>
                                </div>
                            </details>
                        )}
                    </Section>

                    {/* 3 · Licence */}
                    <Section step={options.length > 0 ? 3 : 2} title="Führerschein">
                        {hasStoredLicense ? (
                            <div className="flex items-start gap-3 rounded-[var(--hm-radius-input)] bg-hm-paper-2 px-4 py-3 text-sm">
                                <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-hm-accent-text" />
                                <div>
                                    <p className="font-semibold">Führerschein hinterlegt</p>
                                    <p className="mt-0.5 text-hm-ink-2">{licenseNumber} ({licenseCountry}), gültig bis {new Date(licenseExpiryDate).toLocaleDateString('de-AT')}.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {isLoggedIn && licenseNumber && !licenseValidForRental && (
                                    <p className="mb-5 rounded-[var(--hm-radius-input)] bg-hm-accent/10 px-4 py-3 text-sm text-hm-accent-text">
                                        Ihr hinterlegter Führerschein ist nicht bis zum Mietende gültig. Bitte die neuen Daten eintragen.
                                    </p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="co-lic" className={labelClass}>Führerscheinnummer</label>
                                        <input id="co-lic" required name="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} className={`${inputClass} mt-2`} placeholder="z. B. 12345678" />
                                    </div>
                                    <div>
                                        <label htmlFor="co-lic-country" className={labelClass}>Ausstellungsland</label>
                                        <CountrySelect id="co-lic-country" name="licenseCountry" value={licenseCountry} onChange={setLicenseCountry} />
                                    </div>
                                    <div>
                                        <label htmlFor="co-lic-exp" className={labelClass}>Gültig bis</label>
                                        <input id="co-lic-exp" required name="licenseExpiryDate" type="date" min={minLicenseExpiry} value={licenseExpiryDate} onChange={(e) => setLicenseExpiryDate(e.target.value)} className={`${inputClass} mt-2`} />
                                        <p className={hintClass}>Muss bis zum Mietende gültig sein.</p>
                                    </div>
                                    <div>
                                        <label htmlFor="co-lic-photo" className={labelClass}>Foto der Vorderseite</label>
                                        <input id="co-lic-photo" required={!licensePhotoUrl || !licenseValidForRental} name="licensePhoto" type="file" accept="image/*,application/pdf"
                                            className={`${inputClass} mt-2 py-2.5 file:mr-3 file:rounded-[var(--hm-radius-pill)] file:border-0 file:bg-hm-paper-2 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-hm-ink`} />
                                        <p className={hintClass}>Bild oder PDF, max. 10 MB.</p>
                                    </div>
                                </div>
                                <p className={`${hintClass} mt-5`}>Voraussetzung: seit mindestens zwei Jahren gültige Lenkerberechtigung. Das Original wird bei Abholung geprüft.</p>
                            </>
                        )}
                    </Section>

                    {/* 4 · Address */}
                    <Section step={options.length > 0 ? 4 : 3} title="Anschrift">
                        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-5">
                            <div className="relative md:col-span-2" ref={suggestionRef}>
                                <label htmlFor="co-address" className={labelClass}>Straße & Hausnummer</label>
                                <input id="co-address" required name="address" value={addressQuery} onChange={(e) => onAddressChange(e.target.value)}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} autoComplete="street-address" className={`${inputClass} mt-2`} placeholder="Hauptstraße 1" />
                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="hm-float absolute z-50 mt-2 w-full overflow-hidden rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper">
                                        {suggestions.map((f, i) => (
                                            <li key={i}>
                                                <button type="button" onClick={() => handleSelectSuggestion(f)} className="w-full px-4 py-3 text-left text-sm hover:bg-hm-paper-2">
                                                    <span className="font-medium">{f.properties.street || f.properties.name} {f.properties.housenumber}</span>
                                                    <span className="block text-xs text-hm-muted">{f.properties.postcode} {f.properties.city}, {f.properties.country}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-5 md:col-span-2">
                                <div>
                                    <label htmlFor="co-plz" className={labelClass}>PLZ</label>
                                    <input id="co-plz" required name="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} autoComplete="postal-code" className={`${inputClass} mt-2`} />
                                </div>
                                <div>
                                    <label htmlFor="co-city" className={labelClass}>Ort</label>
                                    <input id="co-city" required name="city" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" className={`${inputClass} mt-2`} />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="co-country" className={labelClass}>Land</label>
                                <CountrySelect id="co-country" name="country" value={country} onChange={setCountry} />
                            </div>
                        </div>
                    </Section>

                    {/* 5 · Payment */}
                    <Section step={options.length > 0 ? 5 : 4} title="Bezahlung">
                        <div className="space-y-2">
                            {isPickupOutside ? (
                                <p className="rounded-[var(--hm-radius-input)] bg-hm-paper-2 px-4 py-3 text-sm text-hm-ink-2">
                                    <KeyRound aria-hidden className="mr-1.5 inline h-4 w-4 align-[-3px]" />
                                    Abholung außerhalb der Öffnungszeiten — bitte online bezahlen und uns unter {BUSINESS.PHONE} anrufen, damit wir die Übergabe abstimmen.
                                </p>
                            ) : (
                                <PaymentRow value="arrival" checked={paymentMethod === 'arrival'} onChange={() => setPaymentMethod('arrival')}
                                    title="Bei Abholung bezahlen" text="Bar oder mit Karte vor Ort." />
                            )}
                            <PaymentRow value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')}
                                title="Jetzt online bezahlen" text="Kreditkarte über Stripe. Das Fahrzeug ist 30 Minuten für die Zahlung reserviert." />
                        </div>
                    </Section>
                </div>

                {/* Summary */}
                <aside className="min-w-0 lg:sticky lg:top-24">
                    <div className="overflow-hidden rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper">
                        <div className="hm-stage relative aspect-[16/8]">
                            {car.imageUrl && <Image src={car.imageUrl} alt={`${car.brand} ${car.model}`} fill sizes="400px" className="object-cover" priority />}
                        </div>
                        <div className="p-6">
                            <p className="font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted">{car.category}</p>
                            <h2 className="mt-1 text-xl font-bold">{car.brand} {car.model}</h2>
                            <p className="mt-0.5 text-xs text-hm-muted">{[car.transmission, car.fuelType, car.seats ? `${car.seats} Sitze` : null].filter(Boolean).join(' · ')}</p>

                            {/* Period */}
                            <div className="mt-6 space-y-4 border-t border-hm-rule pt-5">
                                {([
                                    ['Abholung', startDate, pickupTime, setPickupTime, todayIso(), (v: string) => { setStartDate(v); if (endDate < v) setEndDate(v); }, hours],
                                    ['Rückgabe', endDate, returnTime, setReturnTime, startDate, setEndDate, returnHours],
                                ] as const).map(([label, date, time, setTime, min, setDate, h]) => (
                                    <div key={label}>
                                        <p className="flex items-baseline justify-between font-hm-mono text-[11px] uppercase tracking-[0.08em] text-hm-muted">
                                            {label}
                                            <span className="normal-case tracking-normal">Öffnungszeit {hoursLabel(h)}</span>
                                        </p>
                                        <div className="mt-2 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2">
                                            <CustomDatePicker value={date} min={min} onChange={setDate}
                                                inputClassName="flex min-h-11 w-full cursor-pointer select-none items-center justify-between rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper px-3 text-sm text-hm-ink hover:border-hm-muted" />
                                            <select aria-label={`${label} Uhrzeit`} value={time} onChange={(e) => setTime(e.target.value)}
                                                className="min-h-11 w-full cursor-pointer appearance-none rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper px-3 text-sm text-hm-ink outline-none hover:border-hm-muted focus:border-hm-ink">
                                                {timeOptions.map((t) => <option key={t} value={t}>{timeLabel(date, t)}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                                {(isPickupOutside || isReturnOutside) && (
                                    <p className="text-xs text-hm-ink-2">
                                        <KeyRound aria-hidden className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />
                                        Außerhalb der Öffnungszeiten: schlüssellose Übergabe (Self-Check-in/-out).
                                    </p>
                                )}
                                <p aria-live="polite" className={`flex items-center gap-2 text-sm ${availability.state === 'conflict' ? 'text-hm-accent-text font-semibold' : 'text-hm-ink-2'}`}>
                                    {availability.state === 'checking' && <><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Verfügbarkeit wird geprüft …</>}
                                    {availability.state === 'ok' && <><Check aria-hidden className="h-4 w-4 text-hm-accent-text" /> Verfügbar · {days} {days === 1 ? 'Miettag' : 'Miettage'}</>}
                                    {availability.state === 'conflict' && <><AlertCircle aria-hidden className="h-4 w-4" /> {availability.reason}</>}
                                </p>
                            </div>

                            {/* Price */}
                            <dl className="hm-tnum mt-5 space-y-2 border-t border-hm-rule pt-5 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-hm-ink-2">Miete · {days} × {eur(car.dailyRate)}</dt>
                                    <dd>{eur(quote.rent)}</dd>
                                </div>
                                {quote.lines.map(({ option, cost }) => (
                                    <div key={option.id} className="flex justify-between gap-4">
                                        <dt className="text-hm-ink-2">{option.name}{option.isPerDay ? ` · ${days} Tage` : ''}</dt>
                                        <dd>{eur(cost)}</dd>
                                    </div>
                                ))}
                                {quote.discount > 0 && coupon && (
                                    <div className="flex justify-between gap-4 text-hm-accent-text">
                                        <dt>Gutschein {coupon.code}</dt>
                                        <dd>− {eur(quote.discount)}</dd>
                                    </div>
                                )}
                            </dl>

                            {/* Coupon */}
                            <div className="mt-4">
                                {coupon ? (
                                    <p className="flex items-center justify-between rounded-[var(--hm-radius-input)] bg-hm-paper-2 px-3 py-2 text-sm">
                                        <span><Check aria-hidden className="mr-1 inline h-4 w-4 text-hm-accent-text" /> {coupon.code} eingelöst</span>
                                        <button type="button" onClick={() => { setCoupon(null); setCouponInput(''); }} className="text-xs font-semibold text-hm-ink-2 hover:text-hm-ink">Entfernen</button>
                                    </p>
                                ) : (
                                    <div className="flex gap-2">
                                        <label htmlFor="co-coupon" className="sr-only">Gutscheincode</label>
                                        <input id="co-coupon" value={couponInput} onChange={(e) => setCouponInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); } }}
                                            placeholder="Gutscheincode" className="min-h-10 min-w-0 flex-1 rounded-[var(--hm-radius-input)] border border-hm-rule bg-hm-paper px-3 text-sm uppercase outline-none placeholder:normal-case placeholder:text-hm-muted focus:border-hm-ink" />
                                        <button type="button" onClick={() => applyCoupon()} disabled={!couponInput.trim() || couponPending}
                                            className="min-h-10 whitespace-nowrap rounded-[var(--hm-radius-input)] border border-hm-ink px-4 text-sm font-semibold hover:bg-hm-ink hover:text-hm-paper disabled:opacity-50">
                                            {couponPending ? '…' : 'Einlösen'}
                                        </button>
                                    </div>
                                )}
                                {couponError && <p className="mt-1.5 text-xs text-hm-accent-text">{couponError}</p>}
                            </div>

                            <div className="mt-5 flex items-end justify-between border-t border-hm-rule pt-5">
                                <span className="font-semibold">Gesamt</span>
                                <span className="hm-tnum text-3xl font-bold">{eur(quote.total)}</span>
                            </div>
                            <p className="text-right text-xs text-hm-muted">inkl. MwSt.{quote.rateNote !== 'Tagespreis' ? ` · ${quote.rateNote}` : ''}</p>

                            {/* Terms at a glance */}
                            <dl className="mt-5 space-y-1.5 rounded-[var(--hm-radius-input)] bg-hm-paper-2 p-4 text-xs">
                                <TermRow label="Inklusive" value={`${quote.includedKm.toLocaleString('de-AT')} km`} />
                                <TermRow label="Mehrkilometer" value={car.extraKmCost != null ? `${eur(car.extraKmCost)} / km` : RENTAL_TERMS.EXTRA_KM_RANGE} />
                                {car.depositAmount != null && <TermRow label="Kaution bei Abholung" value={`${eur(car.depositAmount)} · nicht im Gesamtpreis`} />}
                                <TermRow label="Tank" value={car.fuelPolicy || `${RENTAL_TERMS.FUEL_POLICY} (sonst Kosten + ${eur(RENTAL_TERMS.REFUEL_FEE_EUR)})`} />
                                <TermRow label="Abholung" value={`${BUSINESS.PICKUP_ADDRESS}, ${BUSINESS.PICKUP_POSTAL_CODE} ${BUSINESS.PICKUP_CITY}`} />
                                <TermRow label="Stornierung" value="Kostenlos bis 24 Std. vor Abholung" />
                            </dl>

                            <label className="mt-6 flex cursor-pointer items-start gap-3 text-xs text-hm-ink-2">
                                <input type="checkbox" name="agbAccepted" value="yes" required checked={agbAccepted} onChange={(e) => setAgbAccepted(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--hm-accent)]" />
                                <span>
                                    Ich habe die <Link href="/terms" target="_blank" className="font-semibold text-hm-ink underline underline-offset-2">AGB</Link> und
                                    die <Link href="/privacy" target="_blank" className="font-semibold text-hm-ink underline underline-offset-2">Datenschutzerklärung</Link> gelesen und akzeptiere sie.
                                </span>
                            </label>

                            <button type="submit" disabled={!canSubmit}
                                className="group mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-[var(--hm-radius-input)] bg-hm-accent text-[15px] font-semibold text-hm-accent-ink hover:bg-hm-accent-hover active:translate-y-px disabled:pointer-events-none disabled:opacity-50 transition-[background-color,transform,opacity] duration-[var(--hm-dur-short)] ease-hm-out">
                                {isPending ? (
                                    <><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Wird gebucht …</>
                                ) : (
                                    <>{paymentMethod === 'online' ? 'Kostenpflichtig buchen & bezahlen' : 'Kostenpflichtig buchen'} <ArrowRight aria-hidden className="h-4 w-4" /></>
                                )}
                            </button>
                            {!agbAccepted && <p className="mt-2 text-center text-xs text-hm-muted">Bitte zuerst AGB & Datenschutz bestätigen.</p>}
                        </div>
                    </div>
                </aside>
            </form>

            {showLoginModal && (
                <div role="dialog" aria-modal="true" aria-labelledby="co-login-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="hm-float relative w-full max-w-md rounded-[var(--hm-radius-card)] border border-hm-rule bg-hm-paper p-8">
                        <button type="button" aria-label="Schließen" onClick={() => setShowLoginModal(false)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-hm-muted hover:bg-hm-paper-2 hover:text-hm-ink">
                            <X aria-hidden className="h-5 w-5" />
                        </button>
                        <h3 id="co-login-title" className="text-2xl font-bold">Anmelden</h3>
                        <p className="mt-2 text-sm text-hm-ink-2">Passwort für <strong className="text-hm-ink">{emailValue}</strong> eingeben, um Ihre Daten zu übernehmen.</p>
                        {loginError && <p role="alert" className="mt-4 rounded-[var(--hm-radius-input)] bg-hm-accent/10 px-3 py-2 text-sm text-hm-accent-text">{loginError}</p>}
                        <form onSubmit={handleModalLogin} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="co-login-pw" className={labelClass}>Passwort</label>
                                <input id="co-login-pw" required type="password" autoComplete="current-password" autoFocus value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={`${inputClass} mt-2`} />
                            </div>
                            <button type="submit" disabled={isLoggingIn} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--hm-radius-input)] bg-hm-accent font-semibold text-hm-accent-ink hover:bg-hm-accent-hover disabled:opacity-60">
                                {isLoggingIn ? <><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Anmelden …</> : 'Anmelden & Daten übernehmen'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function TermRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4">
            <dt className="text-hm-muted">{label}</dt>
            <dd className="text-right text-hm-ink">{value}</dd>
        </div>
    );
}

function OptionRow({ option, checked, disabled, onChange, price, type, groupName }: {
    option: PriceOption; checked: boolean; disabled?: boolean; onChange: () => void; price: string; type: 'checkbox' | 'radio'; groupName?: string;
}) {
    return (
        <label className={`flex min-h-14 cursor-pointer items-center gap-4 rounded-[var(--hm-radius-input)] border px-4 py-3 transition-[border-color,background-color] duration-[var(--hm-dur-short)] ${checked ? 'border-hm-ink bg-hm-paper-2' : 'border-hm-rule hover:border-hm-muted'} ${disabled ? 'cursor-default' : ''}`}>
            <input type={type} name={groupName} checked={checked} disabled={disabled} onChange={onChange} className="h-4 w-4 shrink-0 accent-[var(--hm-accent)]" />
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{option.name}{option.isMandatory ? ' · inklusive' : ''}</span>
                {option.description && <span className="block text-xs text-hm-muted">{option.description}</span>}
            </span>
            {price && <span className="hm-tnum whitespace-nowrap text-sm text-hm-ink-2">{price}</span>}
        </label>
    );
}

function PaymentRow({ value, checked, onChange, title, text }: { value: string; checked: boolean; onChange: () => void; title: string; text: string }) {
    return (
        <label className={`flex cursor-pointer items-center gap-4 rounded-[var(--hm-radius-input)] border px-4 py-4 transition-[border-color,background-color] duration-[var(--hm-dur-short)] ${checked ? 'border-hm-ink bg-hm-paper-2' : 'border-hm-rule hover:border-hm-muted'}`}>
            <input type="radio" name="paymentMethod" value={value} checked={checked} onChange={onChange} className="h-4 w-4 shrink-0 accent-[var(--hm-accent)]" />
            <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-hm-ink-2">{text}</span>
            </span>
        </label>
    );
}
