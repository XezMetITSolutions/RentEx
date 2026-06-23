"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Lock, Loader2, User, Building2 } from "lucide-react";
import { createBooking } from "@/app/actions/booking";

export default function MobilePaymentClient({ car, customer, searchParams }: { car: any, customer: any, searchParams: { startDate: string, endDate: string } }) {
  const [method, setMethod] = useState<'arrival' | 'online'>('online');
  const [customerType, setCustomerType] = useState<'Private' | 'Business'>(customer?.customerType || 'Private');
  const [state, formAction, isPending] = useActionState(createBooking, null);

  // Address Autofill Logic
  const [addressQuery, setAddressQuery] = useState(customer?.address || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [postalCode, setPostalCode] = useState(customer?.postalCode || '');
  const [city, setCity] = useState(customer?.city || '');
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

  const start = new Date(searchParams.startDate);
  const end = new Date(searchParams.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalAmount = days * (Number(car.dailyRate) || 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white pb-32 transition-colors">
      <header className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#141414] sticky top-0 z-20 transition-colors">
        <Link href={`/mobile/checkout/${car.id}`} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-xl text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-[16px] font-bold">Details & Zahlung</h1>
        <div className="w-10"></div>
      </header>

      <form action={formAction} className="flex-1 flex flex-col">
        <input type="hidden" name="carId" value={car.id} />
        <input type="hidden" name="startDate" value={searchParams.startDate} />
        <input type="hidden" name="endDate" value={searchParams.endDate} />
        <input type="hidden" name="totalAmount" value={totalAmount} />
        <input type="hidden" name="paymentMethod" value={method} />

        {state?.error && (
            <div className="mx-5 mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
                {state.error}
            </div>
        )}

        <div className="px-5 mt-6 space-y-6">
          {/* Customer Type */}
          <div className="space-y-3">
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">Buchungstyp</h2>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${customerType === 'Private' ? 'bg-[#E53935]/10 border-[#E53935]' : 'bg-white dark:bg-[#1C1C1C] border-gray-200 dark:border-white/5'}`}>
                <input type="radio" name="customerType" value="Private" checked={customerType === 'Private'} onChange={() => setCustomerType('Private')} className="sr-only" />
                <User className={`w-4 h-4 ${customerType === 'Private' ? 'text-[#E53935]' : 'text-gray-400 dark:text-[#A3A3A3]'}`} />
                <span className={`text-[13px] font-medium ${customerType === 'Private' ? 'text-[#E53935]' : 'text-gray-500 dark:text-[#A3A3A3]'}`}>Privat</span>
              </label>
              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${customerType === 'Business' ? 'bg-[#E53935]/10 border-[#E53935]' : 'bg-white dark:bg-[#1C1C1C] border-gray-200 dark:border-white/5'}`}>
                <input type="radio" name="customerType" value="Business" checked={customerType === 'Business'} onChange={() => setCustomerType('Business')} className="sr-only" />
                <Building2 className={`w-4 h-4 ${customerType === 'Business' ? 'text-[#E53935]' : 'text-gray-400 dark:text-[#A3A3A3]'}`} />
                <span className={`text-[13px] font-medium ${customerType === 'Business' ? 'text-[#E53935]' : 'text-gray-500 dark:text-[#A3A3A3]'}`}>Firma</span>
              </label>
            </div>
          </div>

          {customerType === 'Business' && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Firmenname</label>
                <input required name="company" type="text" className="w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 px-4 text-[14px] text-gray-900 dark:text-white outline-none focus:border-[#E53935] mt-1 transition-colors" placeholder="Firma GmbH" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">USt-IdNr.</label>
                <input name="taxId" type="text" className="w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 px-4 text-[14px] text-gray-900 dark:text-white outline-none focus:border-[#E53935] mt-1 transition-colors" placeholder="ATU12345678" />
              </div>
            </div>
          )}

          {/* Personal Data */}
          <div className="space-y-4">
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">Persönliche Daten</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Vorname</label>
                <input required name="firstName" defaultValue={customer?.firstName || ''} type="text" className="w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 px-4 text-[14px] text-gray-900 dark:text-white outline-none focus:border-[#E53935] mt-1 transition-colors" placeholder="Max" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Nachname</label>
                <input required name="lastName" defaultValue={customer?.lastName || ''} type="text" className="w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 px-4 text-[14px] text-gray-900 dark:text-white outline-none focus:border-[#E53935] mt-1 transition-colors" placeholder="Mustermann" />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">E-Mail</label>
              <input required name="email" defaultValue={customer?.email || ''} type="email" className="w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 px-4 text-[14px] text-gray-900 dark:text-white outline-none focus:border-[#E53935] mt-1 transition-colors" placeholder="max@beispiel.com" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Telefon</label>
              <input required name="phone" defaultValue={customer?.phone || ''} type="tel" className="w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 px-4 text-[14px] text-gray-900 dark:text-white outline-none focus:border-[#E53935] mt-1 transition-colors" placeholder="+43 123 456789" />
            </div>
          </div>

          {/* Address Data */}
          <div className="space-y-4">
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">Adresse</h2>
            <div className="relative" ref={suggestionRef}>
              <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Straße & Hausnummer</label>
              <input 
                required 
                name="address" 
                value={addressQuery}
                onChange={(e) => fetchSuggestions(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                type="text" 
                className="w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 px-4 text-[14px] text-gray-900 dark:text-white outline-none focus:border-[#E53935] mt-1 transition-colors" 
                placeholder="Musterstraße 1" 
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden dark:backdrop-blur-xl">
                      {suggestions.map((f, i) => (
                          <button
                              key={i}
                              type="button"
                              onClick={() => handleSelectSuggestion(f)}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-[#A3A3A3] hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors border-b border-gray-100 dark:border-white/5 last:border-0"
                          >
                              <span className="font-medium text-gray-900 dark:text-white">{f.properties.name} {f.properties.housenumber}</span>
                              <span className="block text-xs mt-0.5 text-gray-500 dark:text-gray-400">
                                  {f.properties.postcode} {f.properties.city}, {f.properties.country}
                              </span>
                          </button>
                      ))}
                  </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">PLZ</label>
                <input required name="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} type="text" className="w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 px-4 text-[14px] text-gray-900 dark:text-white outline-none focus:border-[#E53935] mt-1 transition-colors" placeholder="1010" />
              </div>
              <div className="col-span-2">
                <label className="text-[12px] font-medium text-gray-500 dark:text-[#A3A3A3] ml-1">Stadt</label>
                <input required name="city" value={city} onChange={(e) => setCity(e.target.value)} type="text" className="w-full bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 px-4 text-[14px] text-gray-900 dark:text-white outline-none focus:border-[#E53935] mt-1 transition-colors" placeholder="Wien" />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4 pb-8">
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">Zahlungsmethode</h2>
            <div className="space-y-3">
              <button type="button" onClick={() => setMethod("online")} className={`flex items-center w-full p-4 rounded-[1rem] border transition-all ${method === "online" ? "bg-[#E53935]/10 border-[#E53935]" : "bg-white dark:bg-[#1C1C1C] border-gray-200 dark:border-white/5"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${method === "online" ? "border-[#E53935]" : "border-gray-300 dark:border-[#A3A3A3]"}`}>
                  {method === "online" && <div className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />}
                </div>
                <span className={`text-[14px] font-medium flex-1 text-left ${method === "online" ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-[#A3A3A3]"}`}>Online Bezahlen (Kreditkarte/Apple Pay)</span>
              </button>
              
              <button type="button" onClick={() => setMethod("arrival")} className={`flex items-center w-full p-4 rounded-[1rem] border transition-all ${method === "arrival" ? "bg-[#E53935]/10 border-[#E53935]" : "bg-white dark:bg-[#1C1C1C] border-gray-200 dark:border-white/5"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${method === "arrival" ? "border-[#E53935]" : "border-gray-300 dark:border-[#A3A3A3]"}`}>
                  {method === "arrival" && <div className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />}
                </div>
                <span className={`text-[14px] font-medium flex-1 text-left ${method === "arrival" ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-[#A3A3A3]"}`}>Bezahlung vor Ort</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto bg-white dark:bg-[#141414] border-t border-gray-200 dark:border-white/10 z-30 transition-colors">
          <div className="px-5 py-3 border-b border-gray-200 dark:border-white/5 flex items-center justify-between transition-colors">
            <div>
              <span className="text-[12px] text-gray-500 dark:text-[#A3A3A3] block">Gesamtbetrag</span>
              <span className="text-[10px] text-gray-500 dark:text-[#A3A3A3]">inkl. MwSt.</span>
            </div>
            <span className="text-[20px] font-bold text-gray-900 dark:text-white">
              {new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(totalAmount)}
            </span>
          </div>
          
          <div className="p-4">
            <button 
              type="submit"
              disabled={isPending}
              className={`flex items-center justify-center w-full py-4 font-bold text-[16px] rounded-[1rem] transition-colors ${
                isPending 
                  ? "bg-[#E53935]/80 text-white cursor-wait" 
                  : "bg-[#E53935] hover:bg-red-700 text-white shadow-lg shadow-[#E53935]/30"
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Wird verarbeitet...
                </>
              ) : (
                `Kostenpflichtig buchen`
              )}
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <Lock className="w-3.5 h-3.5 text-gray-400 dark:text-[#A3A3A3]" />
              <span className="text-[10px] text-gray-500 dark:text-[#A3A3A3]">Sichere Datenübertragung</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
